import { useState, useEffect } from 'react';
import { get, set } from 'idb-keyval';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import Tesseract from 'tesseract.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export type AutoFeaturedBook = {
  id: string | number;
  title: string;
  author: string;
  publisher: string;
  price: string | number;
  cover: string; // Base64 Data URI or external URL
  pdf: string;
  featured: boolean;
  rating: number;
  slug?: string;
};

// Use eager loading to get the resolved URLs directly without async dynamic imports
const pdfModules = import.meta.glob('@/book_pdf/*.pdf', { query: '?url', eager: true }) as Record<string, { default: string }>;

const CACHE_VERSION = 'v3_ocr';

async function processPdf(path: string, url: string): Promise<AutoFeaturedBook[]> {
  const cacheKey = `featured_book_imgs_${CACHE_VERSION}_${path}`;
  const cached = await get<AutoFeaturedBook[]>(cacheKey);
  if (cached) return cached;

  try {
    const loadingTask = pdfjsLib.getDocument({ url });
    const doc = await loadingTask.promise;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { info } = await doc.getMetadata() as any;
    
    const fileName = path.split('/').pop()?.replace('.pdf', '') || 'Book';
    
    // Some PDFs have raw CorelDraw metadata titles like "catalogue 2026.cdr" which look bad.
    // If the title contains ".cdr", ".pdf", or "catalogue", prefer the filename.
    let baseTitle = info?.Title || fileName;
    if (baseTitle.toLowerCase().includes('.cdr') || 
        baseTitle.toLowerCase().includes('.pdf') || 
        baseTitle.toLowerCase().includes('catalogue')) {
      baseTitle = fileName;
    }
    // Final safety check: remove .cdr from filename fallback just in case
    baseTitle = baseTitle.replace(/\.cdr$/i, '').trim();
    const author = info?.Author || 'Unknown Author';

    const extractedBooks: AutoFeaturedBook[] = [];

    // Iterate through pages to extract embedded images and text
    for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
      const page = await doc.getPage(pageNum);
      
      // Extract text items with their coordinates
      const textContent = await page.getTextContent();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const textItems = textContent.items.map((item: any) => ({
        str: item.str.trim(),
        x: item.transform[4],
        y: item.transform[5]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      })).filter((t: any) => t.str.length > 0);

      const ops = await page.getOperatorList();
      
      let currentTransform = [1, 0, 0, 1, 0, 0];
      const transformStack: number[][] = [];
      
      const applyTransform = (m1: number[], m2: number[]) => [
        m1[0] * m2[0] + m1[2] * m2[1],
        m1[1] * m2[0] + m1[3] * m2[1],
        m1[0] * m2[2] + m1[2] * m2[3],
        m1[1] * m2[2] + m1[3] * m2[3],
        m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
        m1[1] * m2[4] + m1[3] * m2[5] + m1[5]
      ];
      
      let imageIndex = 0;
      for (let i = 0; i < ops.fnArray.length; i++) {
        const fn = ops.fnArray[i];
        const args = ops.argsArray[i];

        if (fn === pdfjsLib.OPS.transform) {
          currentTransform = applyTransform(currentTransform, args);
        } else if (fn === pdfjsLib.OPS.save) {
          transformStack.push([...currentTransform]);
        } else if (fn === pdfjsLib.OPS.restore) {
          const popped = transformStack.pop();
          if (popped) currentTransform = popped;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } else if (fn === pdfjsLib.OPS.paintImageXObject || fn === (pdfjsLib.OPS as any).paintJpegXObject) {
          const objId = args[0];
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const img = await page.objs.get(objId) as any;
            
            // Filter out small logos/icons
            if (img && img.width > 200 && img.height > 250) {
              imageIndex++;
              
              // Calculate real coordinates from transformation matrix
              const x = currentTransform[4];
              const y = currentTransform[5];
              const w = currentTransform[0];
              const h = currentTransform[3];

              // Find nearby text to extract details
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const nearby = textItems.filter((t: any) => 
                t.y >= y - 50 && t.y <= y + h + 50 &&
                t.x >= x - 50 && t.x <= x + w + 400
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ).sort((a: any, b: any) => b.y - a.y);
              
              let extractedTitle = `${baseTitle} (Book ${extractedBooks.length + 1})`;
              let extractedAuthor = author;
              let extractedPrice: string | number = 'On Request';
              let nextIsAuthor = false;

              for (const t of nearby) {
                const str = t.str;
                if (str === 'Author:') { nextIsAuthor = true; continue; }
                if (nextIsAuthor) { extractedAuthor = str; nextIsAuthor = false; continue; }
                
                if (str.startsWith('Price:')) {
                  extractedPrice = str.replace('Price:', '').trim();
                } else if (str.startsWith('Subject:')) {
                  extractedTitle = str.replace('Subject:', '').trim();
                } else if (str.startsWith('Title:')) {
                  extractedTitle = str.replace('Title:', '').trim();
                }
              }
              
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              
              const ctx = canvas.getContext('2d');
              if (ctx) {
                if (img.data) {
                  const imageData = ctx.createImageData(img.width, img.height);
                  if (img.data.length === img.width * img.height * 3) {
                    let j = 0, k = 0;
                    while (j < img.data.length) {
                      imageData.data[k++] = img.data[j++];
                      imageData.data[k++] = img.data[j++];
                      imageData.data[k++] = img.data[j++];
                      imageData.data[k++] = 255;
                    }
                  } else if (img.data.length === img.width * img.height * 4) {
                    imageData.data.set(img.data);
                  } else if (img.data.length === img.width * img.height) { // Grayscale
                    let j = 0, k = 0;
                    while (j < img.data.length) {
                      const val = img.data[j++];
                      imageData.data[k++] = val;
                      imageData.data[k++] = val;
                      imageData.data[k++] = val;
                      imageData.data[k++] = 255;
                    }
                  } else {
                    console.warn(`Unsupported img.data length: ${img.data.length}`);
                    continue; 
                  }
                  ctx.putImageData(imageData, 0, 0);
                } else if (img.bitmap) {
                  ctx.drawImage(img.bitmap, 0, 0);
                } else if (typeof HTMLImageElement !== 'undefined' && img instanceof HTMLImageElement) {
                  ctx.drawImage(img, 0, 0);
                } else if (typeof ImageBitmap !== 'undefined' && img instanceof ImageBitmap) {
                  ctx.drawImage(img, 0, 0);
                } else if (typeof HTMLCanvasElement !== 'undefined' && img instanceof HTMLCanvasElement) {
                  ctx.drawImage(img, 0, 0);
                } else {
                  console.warn('Unsupported image object structure:', img);
                  continue; 
                }

                // Compress heavily to keep IndexedDB happy
                const coverDataUri = canvas.toDataURL('image/jpeg', 0.7); 
                
                // OCR the title directly from the book cover!
                let ocrTitle = '';
                try {
                  const result = await Tesseract.recognize(canvas, 'eng');
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const lines = (result.data as any).lines.map((l: any) => l.text.trim()).filter((l: any) => l.length > 3);
                  // The title is usually one of the biggest/first few lines.
                  // Let's just grab the first valid line or two.
                  if (lines.length > 0) {
                    ocrTitle = lines.slice(0, 2).join(' ');
                    // Clean up common OCR artifacts
                    ocrTitle = ocrTitle.replace(/[^a-zA-Z0-9\s:,-]/g, '').trim();
                  }
                } catch (e) {
                  console.warn('OCR failed:', e);
                }
                
                // Use OCR title if available, otherwise Subject, otherwise fallback
                const finalTitle = ocrTitle || extractedTitle;

                const book: AutoFeaturedBook = {
                  id: `${path}_${pageNum}_${imageIndex}`,
                  title: finalTitle,
                  author: extractedAuthor,
                  publisher: 'Techno World Books',
                  price: extractedPrice,
                  cover: coverDataUri,
                  pdf: url,
                  featured: true,
                  rating: 4.5 + Math.round(Math.random() * 5) / 10,
                  slug: finalTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                };

                extractedBooks.push(book);
              }
            }
          } catch (e) {
            console.warn(`Failed to extract image ${objId}:`, e);
          }
        }
      }
    }

    if (extractedBooks.length > 0) {
      await set(cacheKey, extractedBooks);
    }
    
    return extractedBooks;
  } catch (err) {
    console.error(`Error processing PDF ${path}:`, err);
    return [];
  }
}

export function useAutoFeaturedBooks() {
  const [books, setBooks] = useState<AutoFeaturedBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const loadBooks = async () => {
      const paths = Object.keys(pdfModules);
      if (paths.length === 0) {
        if (isMounted) {
          setBooks([]);
          setLoading(false);
        }
        return;
      }

      // Process concurrently
      const results = await Promise.all(
        paths.map(path => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const url = (pdfModules[path] as any).default || pdfModules[path];
          return processPdf(path, url);
        })
      );
      
      if (isMounted) {
        // Flatten the arrays of extracted books
        setBooks(results.flat());
        setLoading(false);
      }
    };

    loadBooks();

    return () => {
      isMounted = false;
    };
  }, []);

  return { books, loading };
}

import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

async function search(pdfPath) {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const textContent = await page.getTextContent();
    const items = textContent.items.map(i => i.str);
    const found = items.filter(s => s.toUpperCase().includes('DYNAMIC') || s.toUpperCase().includes('ALGEBRA') || s.toUpperCase().includes('RIGID'));
    if (found.length > 0) {
      console.log(`Page ${p} matches:`, found);
    }
  }
  console.log("Done searching.");
}

search('src/book_pdf/Math_compressed.pdf').catch(console.error);

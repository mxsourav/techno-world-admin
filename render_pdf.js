import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

async function extractText(pdfPath) {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const loadingTask = pdfjsLib.getDocument({ data });
  const doc = await loadingTask.promise;
  console.log(`\n--- PDF: ${pdfPath} ---`);
  
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const textContent = await page.getTextContent();
    const text = textContent.items.map(item => item.str).join(' ');
    console.log(`Page ${i}: ${text.substring(0, 200)}...`);
  }
}

async function main() {
  await extractText('src/book_pdf/Physics.pdf');
  await extractText('src/book_pdf/Botany, Biology , Zoology.pdf');
}

main().catch(console.error);

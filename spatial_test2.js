import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

async function spatialExtraction(pdfPath) {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  const page = await doc.getPage(1);
  const textContent = await page.getTextContent();
  
  const textItems = textContent.items.map(item => ({
    str: item.str,
    x: item.transform[4],
    y: item.transform[5]
  })).filter(item => item.str.trim().length > 0);
  
  textItems.sort((a, b) => b.y - a.y); // Sort top to bottom
  
  for (let item of textItems) {
    console.log(`Text: "${item.str}" at X:${item.x.toFixed(1)}, Y:${item.y.toFixed(1)}`);
  }
}

spatialExtraction('src/book_pdf/Physics.pdf').catch(console.error);

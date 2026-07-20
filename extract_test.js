import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

async function testPdf(pdfPath) {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const loadingTask = pdfjsLib.getDocument({ data });
  const doc = await loadingTask.promise;
  console.log(`\n--- PDF: ${pdfPath} ---`);
  const numPages = doc.numPages;
  console.log(`Pages: ${numPages}`);
  
  const page = await doc.getPage(1);
  const operatorList = await page.getOperatorList();
  
  let imageCount = 0;
  for (let i = 0; i < operatorList.fnArray.length; i++) {
    if (operatorList.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
      imageCount++;
    }
  }
  console.log(`Images on page 1: ${imageCount}`);
}

async function main() {
  await testPdf('src/book_pdf/Physics.pdf');
  await testPdf('src/book_pdf/Botany, Biology , Zoology.pdf');
}

main().catch(console.error);

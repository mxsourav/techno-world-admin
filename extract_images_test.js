import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

async function extractImages(pdfPath) {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  console.log(`\n--- PDF: ${pdfPath} ---`);
  
  const page = await doc.getPage(1);
  const ops = await page.getOperatorList();
  
  for (let i = 0; i < ops.fnArray.length; i++) {
    if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject || ops.fnArray[i] === pdfjsLib.OPS.paintJpegXObject) {
      const objId = ops.argsArray[i][0];
      try {
        const img = await page.objs.get(objId);
        console.log(`Image ${objId}: width=${img.width}, height=${img.height}, kind=${img.kind}`);
      } catch (e) {
        console.log(`Image ${objId}: Failed to load - ${e.message}`);
      }
    }
  }
}

async function main() {
  await extractImages('src/book_pdf/Physics.pdf');
}

main().catch(console.error);

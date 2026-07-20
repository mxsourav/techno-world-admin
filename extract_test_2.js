import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

async function extractImages(pdfPath) {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  const page = await doc.getPage(1);
  const ops = await page.getOperatorList();
  
  for (let i = 0; i < ops.fnArray.length; i++) {
    if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject || ops.fnArray[i] === pdfjsLib.OPS.paintJpegXObject) {
      const objId = ops.argsArray[i][0];
      try {
        const img = await page.objs.get(objId);
        console.log(`Image ${objId}: width=${img.width}, height=${img.height}, kind=${img.kind}`);
        console.log(`Data length: ${img.data ? img.data.length : 'undefined'}`);
      } catch (e) {
        console.log(`Image ${objId}: Failed - ${e.message}`);
      }
      break; // just check the first one
    }
  }
}

extractImages('src/book_pdf/Physics.pdf').catch(console.error);

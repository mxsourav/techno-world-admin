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
      const img = await page.objs.get(objId);
      console.log(`Image ${objId}: ${img.width}x${img.height}, kind=${img.kind}`);
      
      // We want to see if we can convert RGB to RGBA
      if (img.width > 200 && img.height > 200) {
        let rgbaData;
        if (img.data.length === img.width * img.height * 3) {
          rgbaData = new Uint8ClampedArray(img.width * img.height * 4);
          let j = 0, k = 0;
          while (j < img.data.length) {
            rgbaData[k++] = img.data[j++];
            rgbaData[k++] = img.data[j++];
            rgbaData[k++] = img.data[j++];
            rgbaData[k++] = 255;
          }
        } else if (img.data.length === img.width * img.height * 4) {
          rgbaData = img.data;
        } else {
          console.log(`Unsupported data length: ${img.data.length}`);
          continue;
        }
        console.log(`Successfully converted ${objId} to RGBA array of length ${rgbaData.length}`);
      }
    }
  }
}

extractImages('src/book_pdf/Physics.pdf').catch(console.error);

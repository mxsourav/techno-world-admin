import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

async function spatialExtraction(pdfPath) {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  const page = await doc.getPage(1);
  
  const textContent = await page.getTextContent();
  const ops = await page.getOperatorList();
  
  let currentTransform = [1, 0, 0, 1, 0, 0];
  const transformStack = [];
  
  function applyTransform(m1, m2) {
    return [
      m1[0] * m2[0] + m1[2] * m2[1],
      m1[1] * m2[0] + m1[3] * m2[1],
      m1[0] * m2[2] + m1[2] * m2[3],
      m1[1] * m2[2] + m1[3] * m2[3],
      m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
      m1[1] * m2[4] + m1[3] * m2[5] + m1[5]
    ];
  }

  const images = [];

  for (let i = 0; i < ops.fnArray.length; i++) {
    const fn = ops.fnArray[i];
    const args = ops.argsArray[i];
    
    if (fn === pdfjsLib.OPS.transform) {
      currentTransform = applyTransform(currentTransform, args);
    } else if (fn === pdfjsLib.OPS.save) {
      transformStack.push([...currentTransform]);
    } else if (fn === pdfjsLib.OPS.restore) {
      currentTransform = transformStack.pop();
    } else if (fn === pdfjsLib.OPS.paintImageXObject || fn === pdfjsLib.OPS.paintJpegXObject) {
      const objId = args[0];
      const x = currentTransform[4];
      const y = currentTransform[5];
      const w = currentTransform[0];
      const h = currentTransform[3];
      images.push({ id: objId, x, y, w, h });
    }
  }
  
  console.log("Found Images:");
  console.log(images.filter(img => Math.abs(img.w) > 50 && Math.abs(img.h) > 50));
  
  console.log("\nText Items:");
  const textItems = textContent.items.map(item => ({
    str: item.str,
    x: item.transform[4],
    y: item.transform[5],
    height: item.height
  })).filter(item => item.str.trim().length > 0);
  
  for (let i = 0; i < Math.min(20, textItems.length); i++) {
    console.log(`Text: "${textItems[i].str}" at X:${textItems[i].x.toFixed(1)}, Y:${textItems[i].y.toFixed(1)}`);
  }
}

spatialExtraction('src/book_pdf/Physics.pdf').catch(console.error);

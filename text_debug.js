import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

async function debug(pdfPath) {
  console.log(`\n--- ${pdfPath} ---`);
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  
  const page = await doc.getPage(1);
  const textContent = await page.getTextContent();
  const textItems = textContent.items.map(item => ({
    str: item.str.trim(),
    x: item.transform[4],
    y: item.transform[5]
  })).filter(t => t.str.length > 0);

  const ops = await page.getOperatorList();
  
  let currentTransform = [1, 0, 0, 1, 0, 0];
  const transformStack = [];
  
  const applyTransform = (m1, m2) => [
    m1[0] * m2[0] + m1[2] * m2[1],
    m1[1] * m2[0] + m1[3] * m2[1],
    m1[0] * m2[2] + m1[2] * m2[3],
    m1[1] * m2[2] + m1[3] * m2[3],
    m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
    m1[1] * m2[4] + m1[3] * m2[5] + m1[5]
  ];

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
    } else if (fn === pdfjsLib.OPS.paintImageXObject || fn === pdfjsLib.OPS.paintJpegXObject) {
      const objId = args[0];
      const img = await page.objs.get(objId);
      
      if (img && img.width > 200 && img.height > 250) {
        const x = currentTransform[4];
        const y = currentTransform[5];
        const w = currentTransform[0];
        const h = currentTransform[3];

        console.log(`\nImage ${objId}: x=${x.toFixed(2)}, y=${y.toFixed(2)}, w=${w.toFixed(2)}, h=${h.toFixed(2)}`);
        
        // Let's find text items that are somewhat close (expand search area significantly)
        const nearby = textItems.filter(t => 
          t.y >= y - 100 && t.y <= y + h + 100 &&
          t.x >= x - 100 && t.x <= x + w + 800
        ).sort((a, b) => b.y - a.y);
        
        console.log("Nearby text:");
        nearby.forEach(t => console.log(`  [x:${t.x.toFixed(2)}, y:${t.y.toFixed(2)}] ${t.str}`));
      }
    }
  }
}

debug('src/book_pdf/Math_compressed.pdf').catch(console.error);

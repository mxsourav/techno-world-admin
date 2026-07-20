import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

async function spatialExtraction(pdfPath) {
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
      const x = currentTransform[4];
      const y = currentTransform[5];
      const w = currentTransform[0];
      const h = currentTransform[3];
      
      if (Math.abs(w) > 50 && Math.abs(h) > 50) {
        console.log(`\nFound Image at X:${x.toFixed(1)}, Y:${y.toFixed(1)}, W:${w.toFixed(1)}, H:${h.toFixed(1)}`);
        
        // Find nearby text
        const nearby = textItems.filter(t => 
          t.y >= y - 50 && t.y <= y + h + 50 &&
          t.x >= x - 50 && t.x <= x + w + 400
        ).sort((a, b) => b.y - a.y);
        
        let extractedTitle = 'Unknown';
        let extractedAuthor = 'Unknown';
        let extractedPrice = 'On Request';
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
             // Just in case
             extractedTitle = str.replace('Title:', '').trim();
          }
        }
        
        console.log(`Title: ${extractedTitle}`);
        console.log(`Author: ${extractedAuthor}`);
        console.log(`Price: ${extractedPrice}`);
      }
    }
  }
}

spatialExtraction('src/book_pdf/Physics.pdf').catch(console.error);

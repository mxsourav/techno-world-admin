import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

async function dump(pdfPath) {
  console.log(`\n--- ${pdfPath} ---`);
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  const { info } = await doc.getMetadata();
  console.log("Metadata Title:", info?.Title);
  
  for (let p = 1; p <= Math.min(2, doc.numPages); p++) {
    const page = await doc.getPage(p);
    const textContent = await page.getTextContent();
    const ops = await page.getOperatorList();
    
    console.log(`Page ${p} Text:`);
    console.log(textContent.items.map(i => i.str.trim()).filter(s => s).slice(0, 15));
    
    let imgCount = 0;
    for (let i = 0; i < ops.fnArray.length; i++) {
        const fn = ops.fnArray[i];
        if (fn === pdfjsLib.OPS.paintImageXObject || fn === pdfjsLib.OPS.paintJpegXObject) {
            imgCount++;
        }
    }
    console.log(`Page ${p} Images: ${imgCount}`);
  }
}

const files = [
  'src/book_pdf/Botany, Biology , Zoology.pdf',
  'src/book_pdf/Math_compressed.pdf',
  'src/book_pdf/Physics.pdf',
  'src/book_pdf/computer science_compressed (1).pdf'
];

async function run() {
  for (const f of files) {
    await dump(f);
  }
}
run().catch(console.error);

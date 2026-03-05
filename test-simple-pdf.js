// test-simple-pdf.js
const PDFDocument = require('pdfkit');
const fs = require('fs');

function generateSimplePDF() {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const chunks = [];
    
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    
    // SUPER SIMPLE CONTENT
    doc.fontSize(25)
       .text('Hello World!', 100, 100);
    
    // Draw a simple rectangle
    doc.rect(100, 150, 200, 100)
       .stroke();
    
    // Add a colored circle
    doc.circle(200, 250, 50)
       .fillColor('red')
       .fill();
    
    doc.end();
  });
}

async function test() {
  try {
    console.log('🧪 Testing simple PDF...');
    const pdfBuffer = await generateSimplePDF();
    fs.writeFileSync('simple-test.pdf', pdfBuffer);
    console.log('✅ Simple PDF generated (size:', pdfBuffer.length, 'bytes)');
    console.log('📄 Check simple-test.pdf - if this works, the issue is in your complex layout');
  } catch (error) {
    console.error('❌ Failed:', error);
  }
}

test();
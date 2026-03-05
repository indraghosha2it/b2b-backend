// // src/utils/pdfGenerator.js
// const PDFDocument = require('pdfkit');
// const axios = require('axios');

// // Helper function to format currency
// const formatPrice = (price) => {
//   return new Intl.NumberFormat('en-US', {
//     style: 'currency',
//     currency: 'USD',
//     minimumFractionDigits: 2
//   }).format(price || 0);
// };

// // Helper function to format date
// const formatDate = (dateString) => {
//   const date = new Date(dateString);
//   return date.toLocaleDateString('en-US', {
//     year: 'numeric',
//     month: 'short',
//     day: 'numeric'
//   });
// };

// // Helper function to get company initials
// const getCompanyInitials = (companyName) => {
//   if (!companyName) return 'AC';
//   return companyName
//     .split(' ')
//     .map(word => word[0])
//     .join('')
//     .toUpperCase()
//     .substring(0, 2);
// };

// // Function to fetch image as buffer
// const fetchImageAsBuffer = async (imageUrl) => {
//   try {
//     if (!imageUrl || imageUrl.startsWith('data:')) return null;
    
//     const response = await axios.get(imageUrl, { 
//       responseType: 'arraybuffer',
//       timeout: 5000 
//     });
    
//     return Buffer.from(response.data, 'binary');
//   } catch (error) {
//     console.error('Error fetching image:', error.message);
//     return null;
//   }
// };

// // Function to draw a color circle
// // Alternative simpler drawColorCircle function
// const drawColorCircle = (doc, x, y, colorCode) => {
//   doc.save();
  
//   try {
//     // Use the color code directly
//     doc.fillColor(colorCode)
//        .circle(x, y, 4)
//        .fill();
    
//     // Add border
//     doc.strokeColor('#888888')
//        .lineWidth(0.5)
//        .circle(x, y, 4)
//        .stroke();
//   } catch (error) {
//     console.error('Error drawing color circle:', error);
//     // Fallback to gray
//     doc.fillColor('#CCCCCC')
//        .circle(x, y, 4)
//        .fill()
//        .stroke();
//   }
  
//   doc.restore();
// };

// /**
//  * Generate Invoice PDF - WITH COMPANY LOGO AND INFO
//  * @param {Object} invoice - Invoice data
//  * @returns {Promise<Buffer>} - PDF buffer
//  */
// const generateInvoicePDF = async (invoice) => {
//   console.log('📄 Starting PDF generation for invoice:', invoice?.invoiceNumber);
  
//   return new Promise(async (resolve, reject) => {
//     try {
//       // Load company logo if available
//       let companyLogoBuffer = null;
//       if (invoice.company?.logo) {
//         try {
//           companyLogoBuffer = await fetchImageAsBuffer(invoice.company.logo);
//         } catch (error) {
//           console.error('Failed to load company logo:', error);
//         }
//       }

//       // Create a PDF document
//       const doc = new PDFDocument({ 
//         margin: 50,
//         size: 'A4'
//       });
      
//       const chunks = [];
      
//       // Set up event handlers ONCE
//       doc.on('data', chunk => chunks.push(chunk));
//       doc.on('end', () => {
//         const pdfBuffer = Buffer.concat(chunks);
//         console.log('📄 PDF generated, size:', pdfBuffer.length);
//         resolve(pdfBuffer);
//       });
//       doc.on('error', reject);

//       // ==================== HEADER WITH LOGO AND COMPANY INFO ====================
      
//       // Logo on left
//       const logoSize = 40;
//       const logoX = 50;
//       const logoY = 45;
      
//       if (companyLogoBuffer) {
//         try {
//           doc.image(companyLogoBuffer, logoX, logoY, { width: logoSize, height: logoSize });
//         } catch (error) {
//           // Fallback to initials
//           const companyName = invoice.company?.companyName || 'Asian Clothify';
//           const initials = getCompanyInitials(companyName);
          
//           // Draw circle background
//           doc.fillColor('#E39A65')
//              .circle(logoX + logoSize/2, logoY + logoSize/2, logoSize/2)
//              .fill();
          
//           // Add initials
//           doc.fillColor('#FFFFFF')
//              .fontSize(16)
//              .font('Helvetica-Bold')
//              .text(initials, logoX + logoSize/2 - 10, logoY + logoSize/2 - 8);
//         }
//       } else {
//         // No logo - show initials
//         const companyName = invoice.company?.companyName || 'Asian Clothify';
//         const initials = getCompanyInitials(companyName);
        
//         // Draw circle background
//         doc.fillColor('#E39A65')
//            .circle(logoX + logoSize/2, logoY + logoSize/2, logoSize/2)
//            .fill();
        
//         // Add initials
//         doc.fillColor('#FFFFFF')
//            .fontSize(16)
//            .font('Helvetica-Bold')
//            .text(initials, logoX + logoSize/2 - 10, logoY + logoSize/2 - 8);
//       }

//       // Company Info next to logo
//       const companyX = logoX + logoSize + 20;
      
//       doc.fillColor('#333333')
//          .fontSize(16)
//          .font('Helvetica-Bold')
//          .text(invoice.company?.companyName || 'Asian Clothify', companyX, logoY);
      
//       doc.fontSize(9)
//          .font('Helvetica');
      
//       if (invoice.company?.contactPerson) {
//         doc.font('Helvetica-Bold')
//            .text('Contact: ', companyX, logoY + 20, { continued: true })
//            .font('Helvetica')
//            .text(invoice.company.contactPerson);
//       }
      
//       doc.fontSize(8)
//          .fillColor('#666666')
//          .text(invoice.company?.email || 'info@asianclothify.com', companyX, logoY + 32)
//          .text(invoice.company?.phone || '+8801305-785685', companyX, logoY + 42);
      
//       if (invoice.company?.address) {
//         doc.text(invoice.company.address, companyX, logoY + 52, { width: 250 });
//       }

//       // Invoice details on right
//       doc.fillColor('#E39A65')
//          .fontSize(12)
//          .font('Helvetica-Bold')
//          .text('INVOICE', 400, 50, { align: 'right' });
      
//       doc.fillColor('#333333')
//          .fontSize(10)
//          .font('Helvetica')
//          .text(`Invoice #: ${invoice.invoiceNumber || 'N/A'}`, 400, 70, { align: 'right' })
//          .text(`Date: ${formatDate(invoice.invoiceDate)}`, 400, 85, { align: 'right' })
//          .text(`Due Date: ${formatDate(invoice.dueDate)}`, 400, 100, { align: 'right' })
//          .text(`Status: ${invoice.paymentStatus?.toUpperCase() || 'UNPAID'}`, 400, 115, { align: 'right' });

//       // ==================== BILL TO SECTION ====================
//       let yPos = 160;
      
//       doc.fillColor('#333333')
//          .fontSize(12)
//          .font('Helvetica-Bold')
//          .text('Bill To:', 50, yPos);
      
//       yPos += 15;
      
//       doc.fontSize(10)
//          .font('Helvetica')
//          .text(invoice.customer?.companyName || 'N/A', 50, yPos)
//          .text(invoice.customer?.contactPerson || '', 50, yPos + 12)
//          .text(invoice.customer?.email || '', 50, yPos + 24)
//          .text(invoice.customer?.phone || '', 50, yPos + 36);

//       // Billing Address
//       const billingAddress = [
//         invoice.customer?.billingAddress,
//         invoice.customer?.billingCity,
//         invoice.customer?.billingZipCode,
//         invoice.customer?.billingCountry
//       ].filter(Boolean).join(', ');
      
//       if (billingAddress) {
//         doc.text('Billing Address:', 50, yPos + 48)
//            .fontSize(9)
//            .text(billingAddress, 50, yPos + 60, { width: 250 });
//       }

//       // Shipping Address (if different)
//       const shippingAddress = [
//         invoice.customer?.shippingAddress,
//         invoice.customer?.shippingCity,
//         invoice.customer?.shippingZipCode,
//         invoice.customer?.shippingCountry
//       ].filter(Boolean).join(', ');
      
//       if (shippingAddress && shippingAddress !== billingAddress) {
//         doc.fontSize(10)
//            .font('Helvetica-Bold')
//            .text('Ship To:', 300, 160);
        
//         doc.fontSize(9)
//            .font('Helvetica')
//            .text(shippingAddress, 300, 175, { width: 200 });
//       }

//       // ==================== ITEMS TABLE ====================
//       yPos = 260;
      
//       // Table Header
//       doc.fillColor('#E39A65')
//          .rect(50, yPos - 5, 500, 20)
//          .fill();
      
//       doc.fillColor('#FFFFFF')
//          .fontSize(10)
//          .font('Helvetica-Bold')
//          .text('Product', 55, yPos)
//          .text('Color', 200, yPos)
//          .text('Sizes', 280, yPos)
//          .text('Qty', 380, yPos, { width: 50, align: 'right' })
//          .text('Price', 430, yPos, { width: 60, align: 'right' })
//          .text('Total', 490, yPos, { width: 60, align: 'right' });

//       yPos += 25;
      
//       // Table Rows - FIXED: Show product name only once per product
//       if (invoice.items && invoice.items.length > 0) {
//         for (const item of invoice.items) {
//           let firstColorForProduct = true;
          
//           if (item.colors && item.colors.length > 0) {
//             for (const color of item.colors) {
//               const activeSizes = color.sizeQuantities?.filter(sq => sq.quantity > 0) || [];
//               const sizesText = activeSizes.map(sq => `${sq.size}:${sq.quantity}`).join(', ');
//               const colorQty = color.totalForColor || 0;
//               const colorTotal = colorQty * (item.unitPrice || 0);
              
//               // Alternate row background
//               if (yPos % 40 === 0) {
//                 doc.fillColor('#F9F9F9')
//                    .rect(50, yPos - 3, 500, 20)
//                    .fill();
//               }
              
//               // Product name - show only for first color of this product
//               if (firstColorForProduct) {
//                 doc.fillColor('#333333')
//                    .fontSize(9)
//                    .font('Helvetica-Bold')
//                    .text(item.productName.substring(0, 25), 55, yPos);
//               }
              
//               // Color - show with actual color circle
//               doc.fillColor('#333333')
//                  .fontSize(9)
//                  .font('Helvetica');
              
//               // Draw color circle
//               const colorCode = color.color?.code || '#CCCCCC';
//               drawColorCircle(doc, 208, yPos + 3, colorCode);
              
//               // Color name (without code)
//               let colorName = color.color?.name || color.color?.code || 'Color';
//               if (colorName.startsWith('#')) {
//                 colorName = 'Color';
//               }
//               doc.text(colorName, 215, yPos);
              
//               // Sizes
//               doc.text(sizesText, 280, yPos, { width: 90 });
              
//               // Quantity, Price, Total (aligned right)
//               doc.text(colorQty.toString(), 380, yPos, { width: 50, align: 'right' })
//                  .text(formatPrice(item.unitPrice), 430, yPos, { width: 60, align: 'right' })
//                  .text(formatPrice(colorTotal), 490, yPos, { width: 60, align: 'right' });
              
//               yPos += 18;
//               firstColorForProduct = false;
              
//               // Check for page break
//               if (yPos > 700) {
//                 doc.addPage();
//                 yPos = 50;
                
//                 // Redraw header on new page
//                 doc.fillColor('#E39A65')
//                    .rect(50, yPos - 5, 500, 20)
//                    .fill();
                
//                 doc.fillColor('#FFFFFF')
//                    .fontSize(10)
//                    .font('Helvetica-Bold')
//                    .text('Product', 55, yPos)
//                    .text('Color', 200, yPos)
//                    .text('Sizes', 280, yPos)
//                    .text('Qty', 380, yPos, { width: 50, align: 'right' })
//                    .text('Price', 430, yPos, { width: 60, align: 'right' })
//                    .text('Total', 490, yPos, { width: 60, align: 'right' });
                
//                 yPos += 25;
//               }
//             }
//           } else {
//             // Item without colors
//             if (yPos % 40 === 0) {
//               doc.fillColor('#F9F9F9')
//                  .rect(50, yPos - 3, 500, 20)
//                  .fill();
//             }
            
//             doc.fillColor('#333333')
//                .fontSize(9)
//                .font('Helvetica')
//                .text(item.productName.substring(0, 25), 55, yPos)
//                .text('-', 200, yPos)
//                .text('-', 280, yPos)
//                .text((item.totalQuantity || 0).toString(), 380, yPos, { width: 50, align: 'right' })
//                .text(formatPrice(item.unitPrice), 430, yPos, { width: 60, align: 'right' })
//                .text(formatPrice(item.total || 0), 490, yPos, { width: 60, align: 'right' });
            
//             yPos += 18;
//           }
//         }
//       }

// // ==================== SUMMARY ====================
// yPos += 30;

// const subtotal = Number(invoice.subtotal || 0).toFixed(2);
// const vatAmount = Number(invoice.vatAmount || 0).toFixed(2);
// const discountAmount = Number(invoice.discountAmount || 0).toFixed(2);
// const shippingCost = Number(invoice.shippingCost || 0).toFixed(2);
// const finalTotal = Number(invoice.finalTotal || 0).toFixed(2);
// const amountPaid = Number(invoice.amountPaid || 0).toFixed(2);
// const dueAmount = Number(invoice.dueAmount || 0).toFixed(2);

// // Calculate percentages with proper formatting
// const paidPercent = finalTotal > 0 ? ((amountPaid / finalTotal) * 100).toFixed(1) : '0';
// const duePercent = finalTotal > 0 ? ((dueAmount / finalTotal) * 100).toFixed(1) : '0';

// // Summary box with fixed positioning and proper spacing
// const summaryBoxX = 270; // Moved more left
// const summaryBoxY = yPos - 10;
// const summaryBoxWidth = 280; // Increased width
// const summaryBoxHeight = 160;

// doc.fillColor('#F5F5F5')
//    .rect(summaryBoxX, summaryBoxY, summaryBoxWidth, summaryBoxHeight)
//    .fill();

// let summaryY = yPos;
// const labelX = summaryBoxX + 15;
// const amountX = summaryBoxX + 160; // Position for amounts
// const percentX = summaryBoxX + 240; // Position for percentages

// doc.fillColor('#333333')
//    .fontSize(10)
//    .font('Helvetica');

// // Function to format price without symbol for better spacing
// const formatPriceShort = (price) => {
//   const num = parseFloat(price);
//   return '$' + num.toFixed(2);
// };

// // Subtotal
// doc.text('Subtotal:', labelX, summaryY);
// doc.fontSize(9).text(formatPriceShort(subtotal), amountX, summaryY, { align: 'right' });
// doc.fontSize(10);
// summaryY += 15;

// // VAT
// if (invoice.vatPercentage > 0) {
//   doc.text(`VAT (${invoice.vatPercentage}%):`, labelX, summaryY);
//   doc.fontSize(9).text(formatPriceShort(vatAmount), amountX, summaryY, { align: 'right' });
//   doc.fontSize(10);
//   summaryY += 15;
// }

// // Discount
// if (invoice.discountPercentage > 0) {
//   doc.text(`Discount (${invoice.discountPercentage}%):`, labelX, summaryY);
//   doc.fontSize(9).text(`-${formatPriceShort(discountAmount)}`, amountX, summaryY, { align: 'right' });
//   doc.fontSize(10);
//   summaryY += 15;
// }

// // Shipping
// if (parseFloat(shippingCost) > 0) {
//   doc.text('Shipping:', labelX, summaryY);
//   doc.fontSize(9).text(formatPriceShort(shippingCost), amountX, summaryY, { align: 'right' });
//   doc.fontSize(10);
//   summaryY += 15;
// }

// // Line
// doc.strokeColor('#CCCCCC')
//    .lineWidth(0.5)
//    .moveTo(labelX, summaryY - 4)
//    .lineTo(summaryBoxX + summaryBoxWidth - 15, summaryY - 4)
//    .stroke();
// summaryY += 6;

// // Total
// doc.font('Helvetica-Bold')
//    .fontSize(12)
//    .text('TOTAL:', labelX, summaryY);
// doc.fontSize(11).text(formatPriceShort(finalTotal), amountX, summaryY, { align: 'right' });
// summaryY += 18;

// // Payment breakdown
// doc.font('Helvetica')
//    .fontSize(9);

// // Paid row
// doc.fillColor('#22c55e')
//    .text(`Paid: ${paidPercent}%`, labelX, summaryY);
// doc.text(formatPriceShort(amountPaid), amountX - 10, summaryY, { align: 'right' });
// summaryY += 13;

// // Due row
// doc.fillColor(parseFloat(dueAmount) > 0 ? '#ef4444' : '#22c55e')
//    .text(`Due: ${duePercent}%`, labelX, summaryY);
// doc.text(formatPriceShort(dueAmount), amountX - 10, summaryY, { align: 'right' });


//       // ==================== BANK DETAILS ====================
//       if (invoice.bankDetails && Object.values(invoice.bankDetails).some(v => v)) {
//         yPos = Math.max(yPos + 30, 550);
        
//         doc.fillColor('#333333')
//            .fontSize(12)
//            .font('Helvetica-Bold')
//            .text('Bank Details', 50, yPos);
        
//         let bankY = yPos + 15;
        
//         doc.fontSize(9)
//            .font('Helvetica');
        
//         if (invoice.bankDetails.bankName) {
//           doc.text(`Bank: ${invoice.bankDetails.bankName}`, 50, bankY);
//           bankY += 12;
//         }
//         if (invoice.bankDetails.accountName) {
//           doc.text(`Acc Name: ${invoice.bankDetails.accountName}`, 50, bankY);
//           bankY += 12;
//         }
//         if (invoice.bankDetails.accountNumber) {
//           doc.text(`Acc No: ${invoice.bankDetails.accountNumber}`, 50, bankY);
//           bankY += 12;
//         }
//         if (invoice.bankDetails.routingNumber) {
//           doc.text(`Routing No: ${invoice.bankDetails.routingNumber}`, 50, bankY);
//           bankY += 12;
//         }
//         if (invoice.bankDetails.swiftCode) {
//           doc.text(`SWIFT: ${invoice.bankDetails.swiftCode}`, 50, bankY);
//           bankY += 12;
//         }
//       }







//       // ==================== NOTES ====================
//       if (invoice.notes || invoice.terms) {
//         yPos = Math.max(yPos + 20, 600);
        
//         if (invoice.notes) {
//           doc.fillColor('#333333')
//              .fontSize(12)
//              .font('Helvetica-Bold')
//              .text('Notes:', 50, yPos);
//           yPos += 15;

//           doc.fontSize(9)
//              .font('Helvetica')
//              .text(invoice.notes, 50, yPos, { width: 500 });
//           yPos += doc.heightOfString(invoice.notes, { width: 500 }) + 10;
//         }

//         if (invoice.terms) {
//           doc.fillColor('#333333')
//              .fontSize(12)
//              .font('Helvetica-Bold')
//              .text('Terms & Conditions:', 50, yPos);
//           yPos += 15;

//           doc.fontSize(9)
//              .font('Helvetica')
//              .text(invoice.terms, 50, yPos, { width: 500 });
//         }
//       }

//       // ==================== FOOTER ====================
//       const pageCount = doc.bufferedPageRange().count;
//       for (let i = 0; i < pageCount; i++) {
//         doc.switchToPage(i);
//         doc.fontSize(8)
//            .fillColor('#999999')
//            .text(
//              `Invoice #${invoice.invoiceNumber} | Generated on ${new Date().toLocaleDateString()}`,
//              50,
//              doc.page.height - 50,
//              { align: 'center', width: doc.page.width - 100 }
//            );
//       }

//       // Finalize PDF
//       doc.end();

//     } catch (error) {
//       console.error('❌ PDF Generation Error:', error);
//       reject(error);
//     }
//   });
// };


// src/utils/pdfGenerator.js
const PDFDocument = require('pdfkit');
const axios = require('axios');

// Helper function to format currency
const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(price || 0);
};

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Helper function to get company initials
const getCompanyInitials = (companyName) => {
  if (!companyName) return 'AC';
  return companyName
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Function to fetch image as buffer
const fetchImageAsBuffer = async (imageUrl) => {
  try {
    if (!imageUrl || imageUrl.startsWith('data:')) return null;
    
    const response = await axios.get(imageUrl, { 
      responseType: 'arraybuffer',
      timeout: 5000 
    });
    
    return Buffer.from(response.data, 'binary');
  } catch (error) {
    console.error('Error fetching image:', error.message);
    return null;
  }
};

// Function to draw a color circle
const drawColorCircle = (doc, x, y, colorCode) => {
  doc.save();
  
  try {
    doc.fillColor(colorCode)
       .circle(x, y, 3) // Reduced from 4 to 3
       .fill();
    
    doc.strokeColor('#888888')
       .lineWidth(0.3) // Reduced from 0.5 to 0.3
       .circle(x, y, 3)
       .stroke();
  } catch (error) {
    console.error('Error drawing color circle:', error);
    doc.fillColor('#CCCCCC')
       .circle(x, y, 3)
       .fill()
       .stroke();
  }
  
  doc.restore();
};

/**
 * Generate Invoice PDF - COMPACT VERSION
 */
const generateInvoicePDF = async (invoice) => {
  console.log('📄 Starting PDF generation for invoice:', invoice?.invoiceNumber);
  
  return new Promise(async (resolve, reject) => {
    try {
      // Load company logo if available
      let companyLogoBuffer = null;
      if (invoice.company?.logo) {
        try {
          companyLogoBuffer = await fetchImageAsBuffer(invoice.company.logo);
        } catch (error) {
          console.error('Failed to load company logo:', error);
        }
      }

      // Create a PDF document
      const doc = new PDFDocument({ 
        margin: 40, // Reduced from 50 to 40
        size: 'A4'
      });
      
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        console.log('📄 PDF generated, size:', pdfBuffer.length);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // ==================== HEADER WITH LOGO AND COMPANY INFO ====================
      const logoSize = 35; // Reduced from 40 to 35
      const logoX = 40; // Adjusted for new margin
      const logoY = 35; // Moved up
      
      if (companyLogoBuffer) {
        try {
          doc.image(companyLogoBuffer, logoX, logoY, { width: logoSize, height: logoSize });
        } catch (error) {
          const companyName = invoice.company?.companyName || 'Asian Clothify';
          const initials = getCompanyInitials(companyName);
          
          doc.fillColor('#E39A65')
             .circle(logoX + logoSize/2, logoY + logoSize/2, logoSize/2)
             .fill();
          
          doc.fillColor('#FFFFFF')
             .fontSize(14) // Reduced from 16 to 14
             .font('Helvetica-Bold')
             .text(initials, logoX + logoSize/2 - 8, logoY + logoSize/2 - 7);
        }
      } else {
        const companyName = invoice.company?.companyName || 'Asian Clothify';
        const initials = getCompanyInitials(companyName);
        
        doc.fillColor('#E39A65')
           .circle(logoX + logoSize/2, logoY + logoSize/2, logoSize/2)
           .fill();
        
        doc.fillColor('#FFFFFF')
           .fontSize(14)
           .font('Helvetica-Bold')
           .text(initials, logoX + logoSize/2 - 8, logoY + logoSize/2 - 7);
      }

      const companyX = logoX + logoSize + 15; // Reduced spacing
      
      doc.fillColor('#333333')
         .fontSize(14) // Reduced from 16 to 14
         .font('Helvetica-Bold')
         .text(invoice.company?.companyName || 'Asian Clothify', companyX, logoY);
      
      doc.fontSize(8) // Reduced from 9 to 8
         .font('Helvetica');
      
      if (invoice.company?.contactPerson) {
        doc.font('Helvetica-Bold')
           .text('Contact: ', companyX, logoY + 18, { continued: true })
           .font('Helvetica')
           .text(invoice.company.contactPerson);
      }
      
      doc.fontSize(7) // Reduced from 8 to 7
         .fillColor('#666666')
         .text(invoice.company?.email || 'info@asianclothify.com', companyX, logoY + 28)
         .text(invoice.company?.phone || '+8801305-785685', companyX, logoY + 35); // Reduced spacing
      
      if (invoice.company?.address) {
        doc.fontSize(6.5) // Reduced from 6.5 to 6
           .text(invoice.company.address, companyX, logoY + 42, { width: 220 }); // Reduced width
      }

      // Invoice details on right
      doc.fillColor('#E39A65')
         .fontSize(11) // Reduced from 12 to 11
         .font('Helvetica-Bold')
         .text('INVOICE', 450, 40, { align: 'right' }); // Adjusted position
      
      doc.fillColor('#333333')
         .fontSize(9) // Reduced from 10 to 9
         .font('Helvetica')
         .text(`Invoice #: ${invoice.invoiceNumber || 'N/A'}`, 450, 58, { align: 'right' })
         .text(`Date: ${formatDate(invoice.invoiceDate)}`, 450, 72, { align: 'right' })
         .text(`Due Date: ${formatDate(invoice.dueDate)}`, 450, 86, { align: 'right' })
         .text(`Status: ${invoice.paymentStatus?.toUpperCase() || 'UNPAID'}`, 450, 100, { align: 'right' });

      // ==================== BILL TO SECTION ====================
      let yPos = 135; // Reduced from 160
      
      doc.fillColor('#333333')
         .fontSize(11) // Reduced from 12 to 11
         .font('Helvetica-Bold')
         .text('Bill To:', 40, yPos);
      
      yPos += 12; // Reduced spacing
      
      doc.fontSize(9) // Reduced from 10 to 9
         .font('Helvetica')
         .text(invoice.customer?.companyName || 'N/A', 40, yPos)
         .text(invoice.customer?.contactPerson || '', 40, yPos + 10) // Reduced spacing
         .text(invoice.customer?.email || '', 40, yPos + 20)
         .text(invoice.customer?.phone || '', 40, yPos + 30);

      // Billing Address
      const billingAddress = [
        invoice.customer?.billingAddress,
        invoice.customer?.billingCity,
        invoice.customer?.billingZipCode,
        invoice.customer?.billingCountry
      ].filter(Boolean).join(', ');
      
      if (billingAddress) {
        doc.text('Billing Address:', 40, yPos + 40)
           .fontSize(8) // Reduced from 9 to 8
           .text(billingAddress, 40, yPos + 48, { width: 220 }); // Adjusted
      }

      // Shipping Address (if different)
      const shippingAddress = [
        invoice.customer?.shippingAddress,
        invoice.customer?.shippingCity,
        invoice.customer?.shippingZipCode,
        invoice.customer?.shippingCountry
      ].filter(Boolean).join(', ');
      
      if (shippingAddress && shippingAddress !== billingAddress) {
        doc.fontSize(9)
           .font('Helvetica-Bold')
           .text('Ship To:', 280, 135); // Adjusted position
        
        doc.fontSize(8) // Reduced from 9 to 8
           .font('Helvetica')
           .text(shippingAddress, 280, 147, { width: 180 }); // Adjusted
      }

      // ==================== BANK DETAILS (Right Side) ====================
      if (invoice.bankDetails && Object.values(invoice.bankDetails).some(v => v)) {
        doc.fillColor('#333333')
           .fontSize(11) // Reduced from 12 to 11
           .font('Helvetica-Bold')
           .text('Bank Details', 330, 135); // Adjusted position
        
        let bankY = 147; // Adjusted
        const lineHeight = 10; // Reduced from 12 to 10
        
        doc.fontSize(8) // Reduced from 9 to 8
           .font('Helvetica')
           .fillColor('#666666');
        
        if (invoice.bankDetails.bankName) {
          doc.text(`Bank: ${invoice.bankDetails.bankName}`, 330, bankY);
          bankY += lineHeight;
        }
        if (invoice.bankDetails.accountName) {
          doc.text(`A/C: ${invoice.bankDetails.accountName}`, 330, bankY);
          bankY += lineHeight;
        }
        if (invoice.bankDetails.accountNumber) {
          doc.text(`A/C No: ${invoice.bankDetails.accountNumber}`, 330, bankY);
          bankY += lineHeight;
        }
        if (invoice.bankDetails.accountType) {
          doc.text(`Type: ${invoice.bankDetails.accountType}`, 330, bankY);
          bankY += lineHeight;
        }
        if (invoice.bankDetails.routingNumber) {
          doc.text(`Routing: ${invoice.bankDetails.routingNumber}`, 330, bankY);
          bankY += lineHeight;
        }
        if (invoice.bankDetails.swiftCode) {
          doc.text(`SWIFT: ${invoice.bankDetails.swiftCode}`, 330, bankY);
          bankY += lineHeight;
        }
      }

      // ==================== ITEMS TABLE ====================
      yPos = 235; // Reduced from 260
      
      // Table Header
      doc.fillColor('#E39A65')
         .rect(40, yPos - 5, 520, 16) // Reduced height from 20 to 16
         .fill();
      
      doc.fillColor('#FFFFFF')
         .fontSize(9) // Reduced from 10 to 9
         .font('Helvetica-Bold')
         .text('Product', 45, yPos)
         .text('Color', 190, yPos)
         .text('Sizes', 260, yPos)
         .text('Qty', 360, yPos, { width: 40, align: 'right' })
         .text('Price', 410, yPos, { width: 50, align: 'right' })
         .text('Total', 470, yPos, { width: 50, align: 'right' });

      yPos += 20; // Reduced from 25
      
      if (invoice.items && invoice.items.length > 0) {
        for (const item of invoice.items) {
          let firstColorForProduct = true;
          
          if (item.colors && item.colors.length > 0) {
            for (const color of item.colors) {
              const activeSizes = color.sizeQuantities?.filter(sq => sq.quantity > 0) || [];
              const sizesText = activeSizes.map(sq => `${sq.size}:${sq.quantity}`).join(', ');
              const colorQty = color.totalForColor || 0;
              const colorTotal = colorQty * (item.unitPrice || 0);
              
              if (yPos % 35 === 0) {
                doc.fillColor('#F9F9F9')
                   .rect(40, yPos - 3, 520, 16)
                   .fill();
              }
              
              if (firstColorForProduct) {
                doc.fillColor('#333333')
                   .fontSize(8) // Reduced from 9 to 8
                   .font('Helvetica-Bold')
                   .text(item.productName.substring(0, 22), 45, yPos);
              }
              
              doc.fillColor('#333333')
                 .fontSize(8) // Reduced from 9 to 8
                 .font('Helvetica');
              
              const colorCode = color.color?.code || '#CCCCCC';
              drawColorCircle(doc, 198, yPos + 3, colorCode);
              
              let colorName = color.color?.name || color.color?.code || 'Color';
              if (colorName.startsWith('#')) {
                colorName = 'Color';
              }
              doc.text(colorName, 205, yPos);
              
              doc.text(sizesText, 260, yPos, { width: 80 });
              
              doc.text(colorQty.toString(), 360, yPos, { width: 40, align: 'right' })
                 .text(formatPrice(item.unitPrice).replace('$', ''), 410, yPos, { width: 50, align: 'right' })
                 .text(formatPrice(colorTotal).replace('$', ''), 470, yPos, { width: 50, align: 'right' });
              
              yPos += 15; // Reduced from 18 to 15
              firstColorForProduct = false;
              
              if (yPos > 680) {
                doc.addPage();
                yPos = 40;
                
                doc.fillColor('#E39A65')
                   .rect(40, yPos - 5, 520, 16)
                   .fill();
                
                doc.fillColor('#FFFFFF')
                   .fontSize(9)
                   .font('Helvetica-Bold')
                   .text('Product', 45, yPos)
                   .text('Color', 190, yPos)
                   .text('Sizes', 260, yPos)
                   .text('Qty', 360, yPos, { width: 40, align: 'right' })
                   .text('Price', 410, yPos, { width: 50, align: 'right' })
                   .text('Total', 470, yPos, { width: 50, align: 'right' });
                
                yPos += 20;
              }
            }
          } else {
            if (yPos % 35 === 0) {
              doc.fillColor('#F9F9F9')
                 .rect(40, yPos - 3, 520, 16)
                 .fill();
            }
            
            doc.fillColor('#333333')
               .fontSize(8)
               .font('Helvetica')
               .text(item.productName.substring(0, 22), 45, yPos)
               .text('-', 190, yPos)
               .text('-', 260, yPos)
               .text((item.totalQuantity || 0).toString(), 360, yPos, { width: 40, align: 'right' })
               .text(formatPrice(item.unitPrice).replace('$', ''), 410, yPos, { width: 50, align: 'right' })
               .text(formatPrice(item.total || 0).replace('$', ''), 470, yPos, { width: 50, align: 'right' });
            
            yPos += 15;
          }
        }
      }

// ==================== SUMMARY - TABLE LAYOUT ====================
yPos += 20;

const subtotal = Number(invoice.subtotal || 0).toFixed(2);
const vatAmount = Number(invoice.vatAmount || 0).toFixed(2);
const discountAmount = Number(invoice.discountAmount || 0).toFixed(2);
const shippingCost = Number(invoice.shippingCost || 0).toFixed(2);
const finalTotal = Number(invoice.finalTotal || 0).toFixed(2);
const amountPaid = Number(invoice.amountPaid || 0).toFixed(2);
const dueAmount = Number(invoice.dueAmount || 0).toFixed(2);

const paidPercent = finalTotal > 0 ? ((amountPaid / finalTotal) * 100).toFixed(1) : '0';
const duePercent = finalTotal > 0 ? ((dueAmount / finalTotal) * 100).toFixed(1) : '0';

// Calculate how many lines we'll have
let lineCount = 2; // Subtotal + Total
if (invoice.vatPercentage > 0) lineCount++;
if (invoice.discountPercentage > 0) lineCount++;
if (parseFloat(shippingCost) > 0) lineCount++;
lineCount += 3; // Line + Paid + Due

// REDUCED HEIGHT - smaller line height and padding
const lineHeight = 10; // Reduced from 12 to 10
const boxHeight = (lineCount * lineHeight) + 10; // Reduced padding from 15 to 10

// Summary box
const summaryBoxX = 250;
const summaryBoxY = yPos - 8;
const summaryBoxWidth = 270;
const summaryBoxHeight = boxHeight;

doc.fillColor('#F5F5F5')
   .rect(summaryBoxX, summaryBoxY, summaryBoxWidth, summaryBoxHeight)
   .fill();

let summaryY = yPos;
const col1X = summaryBoxX + 10; // Slightly reduced left padding
const col2X = summaryBoxX + 175; // Adjusted right column position

doc.fillColor('#333333')
   .fontSize(8.5) // Slightly smaller font
   .font('Helvetica');

const formatPriceShort = (price) => {
  const num = parseFloat(price);
  return '$' + num.toFixed(2);
};

// Subtotal
doc.text('Subtotal:', col1X, summaryY);
doc.text(formatPriceShort(subtotal), col2X, summaryY);
summaryY += lineHeight;

// VAT
if (invoice.vatPercentage > 0) {
  doc.text(`VAT (${invoice.vatPercentage}%):`, col1X, summaryY);
  doc.text(formatPriceShort(vatAmount), col2X, summaryY);
  summaryY += lineHeight;
}

// Discount
if (invoice.discountPercentage > 0) {
  doc.text(`Discount (${invoice.discountPercentage}%):`, col1X, summaryY);
  doc.text(`-${formatPriceShort(discountAmount)}`, col2X, summaryY);
  summaryY += lineHeight;
}

// Shipping
if (parseFloat(shippingCost) > 0) {
  doc.text('Shipping:', col1X, summaryY);
  doc.text(formatPriceShort(shippingCost), col2X, summaryY);
  summaryY += lineHeight;
}

// Line - adjust position
doc.strokeColor('#CCCCCC')
   .lineWidth(0.5)
   .moveTo(col1X, summaryY - 2)
   .lineTo(summaryBoxX + summaryBoxWidth - 15, summaryY - 2)
   .stroke();
summaryY += 4; // Reduced from 5 to 4

// Total
doc.font('Helvetica-Bold')
   .fontSize(9.5) // Slightly smaller
   .text('TOTAL:', col1X, summaryY);
doc.text(formatPriceShort(finalTotal), col2X, summaryY);
summaryY += 12; // Reduced from 14 to 12

// Paid
doc.font('Helvetica')
   .fontSize(7.5); // Smaller font for paid/due
doc.fillColor('#22c55e')
   .text('Paid:', col1X, summaryY);
doc.text(`${formatPriceShort(amountPaid)} (${paidPercent}%)`, col2X, summaryY);
summaryY += 9; // Reduced from 10 to 9

// Due
doc.fillColor(parseFloat(dueAmount) > 0 ? '#ef4444' : '#22c55e')
   .text('Due:', col1X, summaryY);
doc.text(`${formatPriceShort(dueAmount)} (${duePercent}%)`, col2X, summaryY);

      // ==================== NOTES ====================
      if (invoice.notes || invoice.terms) {
        yPos = Math.max(yPos + 20, 550); // Adjusted
        
        if (invoice.notes) {
          doc.fillColor('#333333')
             .fontSize(10) // Reduced from 12 to 10
             .font('Helvetica-Bold')
             .text('Notes:', 40, yPos);
          yPos += 12;

          doc.fontSize(8) // Reduced from 9 to 8
             .font('Helvetica')
             .text(invoice.notes, 40, yPos, { width: 450 });
          yPos += doc.heightOfString(invoice.notes, { width: 450 }) + 8;
        }

        if (invoice.terms) {
          doc.fillColor('#333333')
             .fontSize(10)
             .font('Helvetica-Bold')
             .text('Terms & Conditions:', 40, yPos);
          yPos += 12;

          doc.fontSize(8)
             .font('Helvetica')
             .text(invoice.terms, 40, yPos, { width: 450 });
        }
      }

      console.log('📄 PDF generation complete - compact version');
      doc.end();

    } catch (error) {
      console.error('❌ PDF Generation Error:', error);
      reject(error);
    }
  });
};

module.exports = { generateInvoicePDF };
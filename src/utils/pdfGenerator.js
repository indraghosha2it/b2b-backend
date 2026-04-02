
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
       .circle(x, y, 3)
       .fill();
    
    doc.strokeColor('#888888')
       .lineWidth(0.3)
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
 * Generate Invoice PDF
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
        margin: 40,
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
      const logoSize = 55;
      const logoX = 40;
      const logoY = 35;
      
      if (companyLogoBuffer) {
        try {
          doc.image(companyLogoBuffer, logoX, logoY, { 
            width: logoSize, 
            height: logoSize,
            fit: [logoSize, logoSize],
            align: 'center',
            valign: 'center'
          });
        } catch (error) {
          const companyName = invoice.company?.companyName || 'Asian Clothify';
          const initials = getCompanyInitials(companyName);
          
          doc.fillColor('#E39A65')
             .rect(logoX, logoY, logoSize, logoSize)
             .fill();
          
          doc.fillColor('#FFFFFF')
             .fontSize(14)
             .font('Helvetica-Bold')
             .text(initials, logoX + logoSize/2 - 8, logoY + logoSize/2 - 7);
        }
      } else {
        const companyName = invoice.company?.companyName || 'Asian Clothify';
        const initials = getCompanyInitials(companyName);
        
        doc.fillColor('#E39A65')
           .rect(logoX, logoY, logoSize, logoSize)
           .fill();
        
        doc.fillColor('#FFFFFF')
           .fontSize(14)
           .font('Helvetica-Bold')
           .text(initials, logoX + logoSize/2 - 8, logoY + logoSize/2 - 7);
      }

          const companyX = logoX + logoSize + 15;
      
      doc.fillColor('#333333')
         .fontSize(14)
         .font('Helvetica-Bold')
         .text(invoice.company?.companyName || 'Asian Clothify', companyX, logoY);
      
      // Company contact details - all at 8.5pt font size
      doc.fontSize(8.5)
         .font('Helvetica')
         .fillColor('#666666');
      
      if (invoice.company?.contactPerson) {
        doc.font('Helvetica-Bold')
           .text('Contact: ', companyX, logoY + 20, { continued: true })
           .font('Helvetica')
           .fillColor('#666666')
           .text(invoice.company.contactPerson);
      }
      
      // Email - 8.5pt
      doc.fillColor('#666666')
         .text(invoice.company?.email || 'info@asianclothify.com', companyX, logoY + 32);
      
      // Phone - 8.5pt  
      doc.text(invoice.company?.phone || '+8801305-785685', companyX, logoY + 44);
      
      // Address - 8.5pt
      if (invoice.company?.address) {
        doc.text(invoice.company.address, companyX, logoY + 56, { width: 220 });
      }

      // Invoice details on right - compact spacing
      doc.fillColor('#E39A65')
         .fontSize(8)
         .font('Helvetica-Bold')
         .text(`Invoice No: ${invoice.invoiceNumber || 'N/A'}`, 450, 40, { align: 'right' });
      
      doc.fillColor('#333333')
         .fontSize(8)
         .font('Helvetica')
         .text(`Date: ${formatDate(invoice.invoiceDate)}`, 450, 52, { align: 'right' })
         .text(`Due Date: ${formatDate(invoice.dueDate)}`, 450, 64, { align: 'right' })
         .text(`Status: ${invoice.paymentStatus?.toUpperCase() || 'UNPAID'}`, 450, 76, { align: 'right' });

      // ==================== CUSTOMER INFO SECTION ====================
      // let yPos = 125;
      
      // // Customer Info Title
      // doc.fillColor('#333333')
      //    .fontSize(10)
      //    .font('Helvetica-Bold')
      //    .text('CUSTOMER INFO', 40, yPos);
      
      // yPos += 15;
      
      // // Customer details - compact
      // doc.fontSize(8.5)
      //    .font('Helvetica')
      //    .fillColor('#333333')
      //    .text(`Company: ${invoice.customer?.companyName || 'N/A'}`, 40, yPos);
      // yPos += 12;
      
      // doc.text(`Customer Name: ${invoice.customer?.contactPerson || 'N/A'}`, 40, yPos);
      // yPos += 12;
      
      // doc.text(`Phone: ${invoice.customer?.phone || 'N/A'}`, 40, yPos);
      // yPos += 12;
      
      // doc.text(`Email: ${invoice.customer?.email || 'N/A'}`, 40, yPos);
      
      //       // ==================== ADDRESS SECTION (Left-aligned, positioned on the right side) ====================
      // const billingAddress = [
      //   invoice.customer?.billingAddress,
      //   invoice.customer?.billingCity,
      //   invoice.customer?.billingZipCode,
      //   invoice.customer?.billingCountry
      // ].filter(Boolean).join(', ');
      
      // const shippingAddress = [
      //   invoice.customer?.shippingAddress,
      //   invoice.customer?.shippingCity,
      //   invoice.customer?.shippingZipCode,
      //   invoice.customer?.shippingCountry
      // ].filter(Boolean).join(', ');
      
      // const addressX = 250;
      // let addressY = 125;
      
      // // Title - left aligned
      // doc.fillColor('#333333')
      //    .fontSize(10)
      //    .font('Helvetica-Bold')
      //    .text('ADDRESS', addressX, addressY);
      
      // // Billing Address - compact spacing
      // addressY += 15;
      // doc.fontSize(8.5)
      //    .font('Helvetica-Bold')
      //    .fillColor('#555555')
      //    .text('Billing Address:', addressX, addressY);
      
      // addressY += 12;
      // const billingAddressText = billingAddress || 'No billing address provided';
      // doc.fontSize(8.5)
      //    .font('Helvetica')
      //    .fillColor('#333333')
      //    .text(billingAddressText, addressX, addressY, { width: 230 });
      
      // addressY += doc.heightOfString(billingAddressText, { width: 230, fontSize: 8.5 }) + 5;
      
      // // Shipping Address
      // doc.fontSize(8.5)
      //    .font('Helvetica-Bold')
      //    .fillColor('#555555')
      //    .text('Shipping Address:', addressX, addressY);
      
      // addressY += 12;
      
      // // Check if shipping address is same as billing address
      // if (shippingAddress && billingAddress && shippingAddress === billingAddress) {
      //   doc.fontSize(8.5)
      //      .font('Helvetica')
      //      .fillColor('#333333')
      //      .text('Same as billing address', addressX, addressY, { width: 230 });
      //   addressY += 12;
      // } else if (shippingAddress) {
      //   doc.fontSize(8.5)
      //      .font('Helvetica')
      //      .fillColor('#333333')
      //      .text(shippingAddress, addressX, addressY, { width: 230 });
      //   addressY += doc.heightOfString(shippingAddress, { width: 230, fontSize: 8.5 }) + 5;
      // } else {
      //   doc.fontSize(8.5)
      //      .font('Helvetica')
      //      .fillColor('#333333')
      //      .text('No shipping address provided', addressX, addressY, { width: 230 });
      //   addressY += 12;
      // }

                // ==================== CUSTOMER INFO & ADDRESS SECTION (50/50 split, background only, no border) ====================
      const billingAddress = [
        invoice.customer?.billingAddress,
        invoice.customer?.billingCity,
        invoice.customer?.billingZipCode,
        invoice.customer?.billingCountry
      ].filter(Boolean).join(', ');
      
      const shippingAddress = [
        invoice.customer?.shippingAddress,
        invoice.customer?.shippingCity,
        invoice.customer?.shippingZipCode,
        invoice.customer?.shippingCountry
      ].filter(Boolean).join(', ');
      
      // Draw a light background box for customer & address section (NO BORDER)
      const infoBoxX = 40;
      const infoBoxY = 115;
      const infoBoxWidth = 520;
      const infoBoxHeight = 105;
      
      doc.fillColor('#F9F9FC')
         .rect(infoBoxX, infoBoxY, infoBoxWidth, infoBoxHeight)
         .fill();
      
      // Draw separator line between left and right columns
      const separatorX = infoBoxX + 260;
      doc.strokeColor('#DDDDDD')
         .lineWidth(0.5)
         .moveTo(separatorX, infoBoxY + 8)
         .lineTo(separatorX, infoBoxY + infoBoxHeight - 8)
         .stroke();
      
      // ==================== LEFT COLUMN: CUSTOMER INFO ====================
      const customerX = infoBoxX + 15;
      let customerY = infoBoxY + 12;
      
      doc.fillColor('#E39A65')
         .fontSize(9)
         .font('Helvetica-Bold')
         .text('CUSTOMER INFO', customerX, customerY);
      
      customerY += 16;
      
      doc.fontSize(8.5)
         .font('Helvetica')
         .fillColor('#333333');
      
      doc.font('Helvetica-Bold')
         .text('Company: ', customerX, customerY, { continued: true })
         .font('Helvetica')
         .text(invoice.customer?.companyName || 'N/A');
      customerY += 12;
      
      doc.font('Helvetica-Bold')
         .text('Customer Name: ', customerX, customerY, { continued: true })
         .font('Helvetica')
         .text(invoice.customer?.contactPerson || 'N/A');
      customerY += 12;
      
      doc.font('Helvetica-Bold')
         .text('Phone: ', customerX, customerY, { continued: true })
         .font('Helvetica')
         .text(invoice.customer?.phone || 'N/A');
      customerY += 12;
      
      doc.font('Helvetica-Bold')
         .text('Email: ', customerX, customerY, { continued: true })
         .font('Helvetica')
         .text(invoice.customer?.email || 'N/A');
      
      // ==================== RIGHT COLUMN: ADDRESS ====================
      const addressX = separatorX + 15;
      let addressY = infoBoxY + 12;
      
      doc.fillColor('#E39A65')
         .fontSize(9)
         .font('Helvetica-Bold')
         .text('ADDRESS', addressX, addressY);
      
      addressY += 16;
      
      doc.fontSize(8.5)
         .font('Helvetica')
         .fillColor('#333333');
      
      // Billing Address
      doc.font('Helvetica-Bold')
         .fillColor('#555555')
         .text('Billing Address:', addressX, addressY);
      
      addressY += 12;
      const billingAddressText = billingAddress || 'No billing address provided';
      doc.font('Helvetica')
         .fillColor('#333333')
         .text(billingAddressText, addressX, addressY, { width: 230 });
      
      addressY += doc.heightOfString(billingAddressText, { width: 230, fontSize: 8.5 }) + 8;
      
      // Shipping Address
      doc.font('Helvetica-Bold')
         .fillColor('#555555')
         .text('Shipping Address:', addressX, addressY);
      
      addressY += 12;
      
      if (shippingAddress && billingAddress && shippingAddress === billingAddress) {
        doc.font('Helvetica')
           .fillColor('#333333')
           .text('Same as billing address', addressX, addressY, { width: 230 });
      } else if (shippingAddress) {
        doc.font('Helvetica')
           .fillColor('#333333')
           .text(shippingAddress, addressX, addressY, { width: 230 });
      } else {
        doc.font('Helvetica')
           .fillColor('#333333')
           .text('No shipping address provided', addressX, addressY, { width: 230 });
      }
      
      // Update yPos for items table based on the bottom of this box
      let yPos = infoBoxY + infoBoxHeight + 15;


      // ==================== ITEMS TABLE ====================
      // yPos = Math.max(yPos + 20, addressY + 20, 235);
      
      // Table Header
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
                   .fontSize(8)
                   .font('Helvetica-Bold')
                   .text(item.productName.substring(0, 22), 45, yPos);
              }
              
              doc.fillColor('#333333')
                 .fontSize(8)
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
              
              yPos += 15;
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

      // ==================== SUMMARY SECTION ====================
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

      const lineHeight = 10;
      const boxHeight = (lineCount * lineHeight) + 10;

      // Summary box
      const summaryBoxX = 250;
      const summaryBoxY = yPos - 8;
      const summaryBoxWidth = 270;
      const summaryBoxHeight = boxHeight;

      doc.fillColor('#F5F5F5')
         .rect(summaryBoxX, summaryBoxY, summaryBoxWidth, summaryBoxHeight)
         .fill();

      let summaryY = yPos;
      const col1X = summaryBoxX + 10;
      const col2X = summaryBoxX + 175;

      doc.fillColor('#333333')
         .fontSize(8.5)
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

      // Line
      doc.strokeColor('#CCCCCC')
         .lineWidth(0.5)
         .moveTo(col1X, summaryY - 2)
         .lineTo(summaryBoxX + summaryBoxWidth - 15, summaryY - 2)
         .stroke();
      summaryY += 4;

      // Total
      doc.font('Helvetica-Bold')
         .fontSize(9.5)
         .text('TOTAL:', col1X, summaryY);
      doc.text(formatPriceShort(finalTotal), col2X, summaryY);
      summaryY += 12;

      // Paid
      doc.font('Helvetica')
         .fontSize(7.5);
      doc.fillColor('#22c55e')
         .text('Paid:', col1X, summaryY);
      doc.text(`${formatPriceShort(amountPaid)} (${paidPercent}%)`, col2X, summaryY);
      summaryY += 9;

      // Due
      doc.fillColor(parseFloat(dueAmount) > 0 ? '#ef4444' : '#22c55e')
         .text('Due:', col1X, summaryY);
      doc.text(`${formatPriceShort(dueAmount)} (${duePercent}%)`, col2X, summaryY);

      // Reset color
      doc.fillColor('#333333');

      // ==================== BANK DETAILS (LEFT) & BANKING TERMS (RIGHT) ====================
      let bankingStartY = summaryBoxY + summaryBoxHeight + 15;
      
      const hasBankDetails = invoice.bankDetails && Object.values(invoice.bankDetails).some(v => v && v.toString().trim());
      const hasBankingTerms = invoice.bankingTerms && invoice.bankingTerms.length > 0 && 
                              invoice.bankingTerms.some(term => term.title?.trim() || term.value?.trim());
      
      if (hasBankDetails || hasBankingTerms) {
        // Draw a light background box for the entire banking section
        const bankingBoxX = 40;
        const bankingBoxY = bankingStartY;
        const bankingBoxWidth = 520;
        
        // Calculate dynamic heights based on content
        let leftColumnHeight = 25; // Minimum height for header
        let rightColumnHeight = 25; // Minimum height for header
        
        // Calculate left column height (Bank Details)
        if (hasBankDetails) {
          const bankDetails = invoice.bankDetails;
          let lineCount = 0;
          if (bankDetails.bankName && bankDetails.bankName.toString().trim()) lineCount++;
          if (bankDetails.accountName && bankDetails.accountName.toString().trim()) lineCount++;
          if (bankDetails.accountNumber && bankDetails.accountNumber.toString().trim()) lineCount++;
          if (bankDetails.accountType && bankDetails.accountType.toString().trim()) lineCount++;
          if (bankDetails.routingNumber && bankDetails.routingNumber.toString().trim()) lineCount++;
          if (bankDetails.swiftCode && bankDetails.swiftCode.toString().trim()) lineCount++;
          if (bankDetails.iban && bankDetails.iban.toString().trim()) lineCount++;
          if (bankDetails.bankAddress && bankDetails.bankAddress.toString().trim()) lineCount++;
          leftColumnHeight = Math.max(leftColumnHeight, (lineCount * 14) + 20);
        }
        
        // Calculate right column height (Banking Terms)
        if (hasBankingTerms) {
          const validTerms = invoice.bankingTerms.filter(term => term.title?.trim() || term.value?.trim());
          let totalHeight = 0;
          
          const measureTextHeight = (text, width, fontSize = 7.5) => {
            const charsPerLine = Math.floor(width / 4.5);
            const lines = Math.ceil(text.length / charsPerLine);
            return lines * 12;
          };
          
          validTerms.forEach(term => {
            if (term.title && term.value) {
              const titleText = `${term.title}: `;
              const fullText = titleText + term.value;
              const textHeight = measureTextHeight(fullText, 230, 7.5);
              totalHeight += Math.max(textHeight, 14);
            } else if (term.title) {
              const textHeight = measureTextHeight(term.title, 230, 7.5);
              totalHeight += Math.max(textHeight, 14);
            } else if (term.value) {
              const textHeight = measureTextHeight(term.value, 230, 7.5);
              totalHeight += Math.max(textHeight, 14);
            }
          });
          
          rightColumnHeight = Math.max(rightColumnHeight, totalHeight + 20);
        }
        
        const boxHeight = Math.max(leftColumnHeight, rightColumnHeight, 60) + 15;
        
        // Draw background box
        doc.fillColor('#F9F9FC')
           .rect(bankingBoxX, bankingBoxY, bankingBoxWidth, boxHeight)
           .fill();
        
        // Draw border
        doc.strokeColor('#E39A65')
           .lineWidth(0.8)
           .rect(bankingBoxX, bankingBoxY, bankingBoxWidth, boxHeight)
           .stroke();
        
        // Draw separator line between left and right columns
        const separatorX = bankingBoxX + 260;
        doc.strokeColor('#DDDDDD')
           .lineWidth(0.5)
           .moveTo(separatorX, bankingBoxY + 8)
           .lineTo(separatorX, bankingBoxY + boxHeight - 8)
           .stroke();
        
        // ==================== LEFT COLUMN: BANK DETAILS ====================
        const leftX = bankingBoxX + 15;
        let leftY = bankingBoxY + 12;
        
        // Header
        doc.fillColor('#E39A65')
           .fontSize(9)
           .font('Helvetica-Bold')
           .text('BANK DETAILS', leftX, leftY);
        
        leftY += 16;
        
        if (hasBankDetails) {
          doc.fontSize(7.5)
             .font('Helvetica')
             .fillColor('#333333');
          
          const bankDetails = invoice.bankDetails;
          
          const drawBankLine = (label, value, y) => {
            if (value && value.toString().trim()) {
              const labelText = `${label}: `;
              const fullText = labelText + value.toString();
              const textWidth = doc.widthOfString(fullText, { fontSize: 7.5 });
              
              if (textWidth <= 230) {
                doc.font('Helvetica-Bold')
                   .text(labelText, leftX, y, { continued: true })
                   .font('Helvetica')
                   .text(value.toString());
                return 12;
              } else {
                doc.font('Helvetica-Bold')
                   .text(labelText, leftX, y, { continued: true })
                   .font('Helvetica')
                   .text(value.toString(), { width: 230 });
                return doc.heightOfString(fullText, { width: 230 }) + 4;
              }
            }
            return 0;
          };
          
          if (bankDetails.bankName && bankDetails.bankName.toString().trim()) {
            const height = drawBankLine('Bank Name', bankDetails.bankName, leftY);
            leftY += height;
          }
          if (bankDetails.accountName && bankDetails.accountName.toString().trim()) {
            const height = drawBankLine('Account Name', bankDetails.accountName, leftY);
            leftY += height;
          }
          if (bankDetails.accountNumber && bankDetails.accountNumber.toString().trim()) {
            const height = drawBankLine('Account Number', bankDetails.accountNumber, leftY);
            leftY += height;
          }
          if (bankDetails.accountType && bankDetails.accountType.toString().trim()) {
            const height = drawBankLine('Account Type', bankDetails.accountType, leftY);
            leftY += height;
          }
          if (bankDetails.routingNumber && bankDetails.routingNumber.toString().trim()) {
            const height = drawBankLine('Routing Number', bankDetails.routingNumber, leftY);
            leftY += height;
          }
          if (bankDetails.swiftCode && bankDetails.swiftCode.toString().trim()) {
            const height = drawBankLine('SWIFT Code', bankDetails.swiftCode, leftY);
            leftY += height;
          }
          if (bankDetails.iban && bankDetails.iban.toString().trim()) {
            const height = drawBankLine('IBAN', bankDetails.iban, leftY);
            leftY += height;
          }
          if (bankDetails.bankAddress && bankDetails.bankAddress.toString().trim()) {
            const height = drawBankLine('Bank Address', bankDetails.bankAddress, leftY);
            leftY += height;
          }
        } else {
          doc.fillColor('#999999')
             .fontSize(7.5)
             .font('Helvetica')
             .text('No bank details provided', leftX, leftY);
        }
        
        // ==================== RIGHT COLUMN: BANKING TERMS ====================
        const rightX = separatorX + 15;
        let rightY = bankingBoxY + 12;
        
        // Header
        doc.fillColor('#E39A65')
           .fontSize(9)
           .font('Helvetica-Bold')
           .text('BANKING TERMS', rightX, rightY);
        
        rightY += 16;
        
        if (hasBankingTerms) {
          doc.fontSize(7.5)
             .font('Helvetica')
             .fillColor('#333333');
          
          const validTerms = invoice.bankingTerms.filter(term => term.title?.trim() || term.value?.trim());
          const regularTerms = validTerms.filter(term => term.title?.trim() && term.value?.trim());
          const titleOnlyTerms = validTerms.filter(term => term.title?.trim() && !term.value?.trim());
          const valueOnlyTerms = validTerms.filter(term => !term.title?.trim() && term.value?.trim());
          
          // Draw regular terms (title: value)
          regularTerms.forEach((term) => {
            const titleText = `${term.title}: `;
            const fullText = titleText + term.value;
            const textWidth = doc.widthOfString(fullText, { fontSize: 7.5 });
            
            if (textWidth <= 230) {
              doc.font('Helvetica-Bold')
                 .text(titleText, rightX, rightY, { continued: true })
                 .font('Helvetica')
                 .text(term.value);
              rightY += 12;
            } else {
              doc.font('Helvetica-Bold')
                 .text(titleText, rightX, rightY);
              rightY += 10;
              doc.font('Helvetica')
                 .text(term.value, rightX, rightY, { width: 230 });
              rightY += doc.heightOfString(term.value, { width: 230 }) + 4;
            }
          });
          
          // Draw title-only terms (long titles without values) - at the end
          if (titleOnlyTerms.length > 0) {
            if (regularTerms.length > 0) rightY += 4;
            
            titleOnlyTerms.forEach((term) => {
              doc.font('Helvetica-Bold')
                 .fillColor('#E39A65')
                 .text(term.title, rightX, rightY);
              rightY += 10;
              doc.fillColor('#333333');
            });
          }
          
          // Draw value-only terms
          if (valueOnlyTerms.length > 0) {
            if (regularTerms.length > 0 || titleOnlyTerms.length > 0) rightY += 4;
            
            valueOnlyTerms.forEach((term) => {
              doc.font('Helvetica')
                 .text(term.value, rightX, rightY, { width: 230 });
              rightY += doc.heightOfString(term.value, { width: 230 }) + 4;
            });
          }
        } else {
          doc.fillColor('#999999')
             .fontSize(7.5)
             .font('Helvetica')
             .text('No banking terms provided', rightX, rightY);
        }
        
        bankingStartY += boxHeight + 10;
      }
      
      // ==================== NOTES & TERMS ====================
      let notesStartY = bankingStartY;
      
      if (invoice.notes || invoice.terms) {
        if (notesStartY > 720) {
          doc.addPage();
          notesStartY = 40;
        }
        
        const notesBoxX = 40;
        const notesBoxY = notesStartY;
        const notesBoxWidth = 520;
        
        let notesBoxHeight = 15;
        if (invoice.notes) notesBoxHeight += doc.heightOfString(invoice.notes, { width: 500 }) + 20;
        if (invoice.terms) notesBoxHeight += doc.heightOfString(invoice.terms, { width: 500 }) + 20;
        
        if (notesBoxHeight > 15) {
          doc.fillColor('#FFF8F0')
             .rect(notesBoxX, notesBoxY, notesBoxWidth, notesBoxHeight)
             .fill();
          
          doc.strokeColor('#E39A65')
             .lineWidth(0.5)
             .rect(notesBoxX, notesBoxY, notesBoxWidth, notesBoxHeight)
             .stroke();
          
          let currentNotesY = notesBoxY + 12;
          
          if (invoice.notes) {
            doc.fillColor('#333333')
               .fontSize(9)
               .font('Helvetica-Bold')
               .text('NOTES:', notesBoxX + 10, currentNotesY);
            currentNotesY += 12;
            
            doc.fontSize(7.5)
               .font('Helvetica')
               .fillColor('#666666')
               .text(invoice.notes, notesBoxX + 10, currentNotesY, { width: 500 });
            currentNotesY += doc.heightOfString(invoice.notes, { width: 500 }) + 8;
          }
          
          if (invoice.terms) {
            doc.fillColor('#333333')
               .fontSize(9)
               .font('Helvetica-Bold')
               .text('TERMS & CONDITIONS:', notesBoxX + 10, currentNotesY);
            currentNotesY += 12;
            
            doc.fontSize(7.5)
               .font('Helvetica')
               .fillColor('#666666')
               .text(invoice.terms, notesBoxX + 10, currentNotesY, { width: 500 });
          }
        }
      }
      
      // ==================== FOOTER ====================
      // Force footer to be at the very bottom of the page
      const pageHeight = doc.page.height;
      const footerY = pageHeight - 35;
      
      // Draw line
      doc.strokeColor('#E39A65')
         .lineWidth(0.5)
         .moveTo(40, footerY - 8)
         .lineTo(550, footerY - 8)
         .stroke();
      
    

      console.log('📄 PDF generation complete');
      doc.end();

    } catch (error) {
      console.error('❌ PDF Generation Error:', error);
      reject(error);
    }
  });
};

module.exports = { generateInvoicePDF };
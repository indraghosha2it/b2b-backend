
// utils/invoiceEmailService.js
const nodemailer = require('nodemailer');
const { generateInvoicePDF } = require('./pdfGenerator');

// Create transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Invoice Email Service - Configuration error:', error.message);
  } else {
    console.log('✅ Invoice Email Service is ready');
    console.log(`📧 Using account: ${process.env.SMTP_USER}`);
  }
});

/**
 * Format currency
 */
const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(price || 0);
};

/**
 * Format date
 */
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Generate HTML for invoice items
 */
const generateInvoiceItemsHTML = (items) => {
  let html = '';
  
  items.forEach((item) => {
    let productImage = item.productImage || 'https://via.placeholder.com/60?text=No+Image';
    
    html += `
      <div style="margin-bottom: 20px; padding: 15px; background: #f9f9f9; border-left: 4px solid #E39A65; border-radius: 4px;">
        <div style="display: flex; align-items: flex-start; gap: 20px; margin-bottom: 15px;">
          <img src="${productImage}" alt="${item.productName}" 
               style="width: 70px; height: 70px; object-fit: cover; border-radius: 8px; border: 1px solid #ddd; display: block; margin-right: 15px;"
               onerror="this.onerror=null; this.src='https://via.placeholder.com/70?text=No+Image';">
          <div style="flex: 1;">
            <h4 style="margin: 0 0 8px 0; color: #333; font-size: 16px; font-weight: 600;">${item.productName}</h4>
            <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.5;">
              <span style="display: inline-block; min-width: 100px;">Total Quantity:</span> <strong>${item.totalQuantity} pcs</strong><br>
              <span style="display: inline-block; min-width: 100px;">Unit Price:</span> <strong style="color: #E39A65;">${formatPrice(item.unitPrice)}</strong>
            </p>
          </div>
        </div>
        
        <div style="margin-top: 15px;">
          <h5 style="margin: 0 0 12px 0; color: #555; font-size: 14px; font-weight: 600;">Colors & Sizes:</h5>
          ${item.colors.map(color => {
            let colorName = color.color.name || color.color.code || 'Color';
            if (colorName.startsWith('#')) {
              colorName = 'Color';
            }
            
            return `
            <div style="margin-bottom: 10px; padding: 10px; background: white; border-radius: 6px; border: 1px solid #eee;">
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                <div style="width: 22px; height: 22px; background-color: ${color.color.code}; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></div>
                <span style="font-weight: 600; color: #444;">${colorName}</span>
                <span style="color: #E39A65; font-weight: 700; margin-left: auto; background: #fef0e7; padding: 2px 10px; border-radius: 20px;">${color.totalForColor} pcs</span>
              </div>
              <div style="display: flex; flex-wrap: wrap; gap: 8px; padding-left: 32px;">
                ${color.sizeQuantities.map(sq => `
                  <span style="background: #f0f0f0; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;">
                    ${sq.size}: <strong>${sq.quantity}</strong>
                  </span>
                `).join('')}
              </div>
            </div>
          `}).join('')}
        </div>
      </div>
    `;
  });
  
  return html;
};

/**
 * Generate HTML for invoice summary
 */
const generateInvoiceSummaryHTML = (invoice) => {
  const statusColors = {
    paid: '#28a745',
    partial: '#ffc107',
    unpaid: '#dc3545',
    overpaid: '#6f42c1',
    cancelled: '#6c757d'
  };

  const statusColor = statusColors[invoice.paymentStatus] || '#6c757d';

  return `
    <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h2 style="margin-top: 0; margin-bottom: 15px; color: #333; font-size: 18px; display: flex; align-items: center; gap: 8px;">
        <span>📋</span> <span>Invoice Summary</span>
      </h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px 0; width: 140px;"><strong>Invoice #:</strong></td><td>${invoice.invoiceNumber}</td></tr>
        <tr><td style="padding: 8px 0;"><strong>Date:</strong></td><td>${formatDate(invoice.invoiceDate)}</td></tr>
        <tr><td style="padding: 8px 0;"><strong>Due Date:</strong></td><td>${formatDate(invoice.dueDate)}</td></tr>
        <tr><td style="padding: 8px 0;"><strong>Status:</strong></td><td><span style="color: ${statusColor}; font-weight: bold; text-transform: capitalize;">${invoice.paymentStatus}</span></td></tr>
        <tr><td style="padding: 8px 0;"><strong>Subtotal:</strong></td><td>${formatPrice(invoice.subtotal)}</td></tr>
        ${invoice.vatPercentage > 0 ? `
          <tr><td style="padding: 8px 0;"><strong>VAT (${invoice.vatPercentage}%):</strong></td><td>${formatPrice(invoice.vatAmount)}</td></tr>
        ` : ''}
        ${invoice.discountPercentage > 0 ? `
          <tr><td style="padding: 8px 0;"><strong>Discount (${invoice.discountPercentage}%):</strong></td><td>-${formatPrice(invoice.discountAmount)}</td></tr>
        ` : ''}
        ${invoice.shippingCost > 0 ? `
          <tr><td style="padding: 8px 0;"><strong>Shipping:</strong></td><td>${formatPrice(invoice.shippingCost)}</td></tr>
        ` : ''}
        <tr><td style="padding: 8px 0; border-top: 2px solid #ddd;"><strong>Final Total:</strong></td><td style="border-top: 2px solid #ddd;"><span style="color: #E39A65; font-size: 20px; font-weight: bold;">${formatPrice(invoice.finalTotal)}</span></td></tr>
      </table>
    </div>
  `;
};

/**
 * Generate payment breakdown HTML (without progress bars for admin)
 */
const generatePaymentBreakdownHTML = (invoice, includeBars = true) => {
  const paidPercentage = invoice.paidPercentage || 0;
  const unpaidPercentage = invoice.unpaidPercentage || 0;
  
  if (includeBars) {
    // Customer version with progress bars
    return `
      <div style="margin: 20px 0;">
        <h3 style="font-size: 16px; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
          <span>💰</span> <span>Payment Breakdown</span>
        </h3>
        
        <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-weight: 600; color: #2e7d32;">Paid Amount:</span>
            <span style="font-weight: 700; color: #2e7d32; font-size: 18px;">${formatPrice(invoice.amountPaid || 0)}</span>
          </div>
          <div style="width: 100%; height: 8px; background: #c8e6c9; border-radius: 4px; overflow: hidden;">
            <div style="width: ${paidPercentage}%; height: 100%; background: #2e7d32; border-radius: 4px;"></div>
          </div>
          <div style="text-align: right; margin-top: 5px; font-size: 13px; color: #2e7d32;">${paidPercentage.toFixed(1)}% paid</div>
        </div>
        
        <div style="background: #ffebee; padding: 15px; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-weight: 600; color: #c62828;">Due Amount:</span>
            <span style="font-weight: 700; color: #c62828; font-size: 18px;">${formatPrice(invoice.dueAmount || 0)}</span>
          </div>
          <div style="width: 100%; height: 8px; background: #ffcdd2; border-radius: 4px; overflow: hidden;">
            <div style="width: ${unpaidPercentage}%; height: 100%; background: #c62828; border-radius: 4px;"></div>
          </div>
          <div style="text-align: right; margin-top: 5px; font-size: 13px; color: #c62828;">${unpaidPercentage.toFixed(1)}% due</div>
        </div>
      </div>
    `;
  } else {
    // Admin version - just amounts and percentages (no bars)
    return `
      <div style="margin: 20px 0;">
        <h3 style="font-size: 16px; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
          <span>💰</span> <span>Payment Breakdown</span>
        </h3>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-weight: 600; color: #2e7d32;">Paid Amount:</span>
            <span style="font-weight: 700; color: #2e7d32; font-size: 18px;">${formatPrice(invoice.amountPaid || 0)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 14px; color: #2e7d32;">
            <span>Percentage:</span>
            <span><strong>${paidPercentage.toFixed(1)}%</strong></span>
          </div>
        </div>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-weight: 600; color: #c62828;">Due Amount:</span>
            <span style="font-weight: 700; color: #c62828; font-size: 18px;">${formatPrice(invoice.dueAmount || 0)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 14px; color: #c62828;">
            <span>Percentage:</span>
            <span><strong>${unpaidPercentage.toFixed(1)}%</strong></span>
          </div>
        </div>
      </div>
    `;
  }
};

/**
 * Generate company details HTML (for customer emails)
 */
const generateCompanyDetailsHTML = (company) => {
  return `
    <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h2 style="margin-top: 0; margin-bottom: 15px; font-size: 18px; display: flex; align-items: center; gap: 8px;">
        <span>🏢</span> <span>Company Details</span>
      </h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="width: 120px; padding: 5px 0;"><strong>Company:</strong></td><td>${company.companyName || 'Asian Clothify'}</td></tr>
        <tr><td style="padding: 5px 0;"><strong>Contact:</strong></td><td>${company.contactPerson || 'N/A'}</td></tr>
        <tr><td style="padding: 5px 0;"><strong>Email:</strong></td><td><a href="mailto:${company.email || process.env.SMTP_USER}" style="color: #E39A65;">${company.email || process.env.SMTP_USER}</a></td></tr>
        <tr><td style="padding: 5px 0;"><strong>Phone:</strong></td><td>${company.phone || '+8801305-785685'}</td></tr>
        <tr><td style="padding: 5px 0;"><strong>Address:</strong></td><td>${company.address || '49/10-C, Ground Floor, Genda, Savar, Dhaka, Bangladesh'}</td></tr>
      </table>
    </div>
  `;
};

/**
 * Generate customer details HTML (for admin emails)
 */
const generateCustomerDetailsHTML = (customer) => {
  return `
    <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h2 style="margin-top: 0; margin-bottom: 15px; font-size: 18px; display: flex; align-items: center; gap: 8px;">
        <span>👤</span> <span>Customer Details</span>
      </h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="width: 120px; padding: 5px 0;"><strong>Company:</strong></td><td>${customer.companyName || 'N/A'}</td></tr>
        <tr><td style="padding: 5px 0;"><strong>Contact:</strong></td><td>${customer.contactPerson || 'N/A'}</td></tr>
        <tr><td style="padding: 5px 0;"><strong>Email:</strong></td><td><a href="mailto:${customer.email}" style="color: #E39A65;">${customer.email || 'N/A'}</a></td></tr>
        <tr><td style="padding: 5px 0;"><strong>Phone:</strong></td><td>${customer.phone || 'N/A'}</td></tr>
        ${customer.whatsapp ? `<tr><td style="padding: 5px 0;"><strong>WhatsApp:</strong></td><td><a href="https://wa.me/${customer.whatsapp}" style="color: #25D366;">${customer.whatsapp}</a></td></tr>` : ''}
        <tr><td style="padding: 5px 0;"><strong>Billing Address:</strong></td><td>${customer.billingAddress || 'N/A'}, ${customer.billingCity || ''} ${customer.billingZipCode || ''}, ${customer.billingCountry || ''}</td></tr>
        ${customer.shippingAddress ? `<tr><td style="padding: 5px 0;"><strong>Shipping Address:</strong></td><td>${customer.shippingAddress}, ${customer.shippingCity || ''} ${customer.shippingZipCode || ''}, ${customer.shippingCountry || ''}</td></tr>` : ''}
      </table>
    </div>
  `;
};

/**
 * Generate bank details HTML
 */
const generateBankDetailsHTML = (bankDetails) => {
  if (!bankDetails || Object.keys(bankDetails).every(key => !bankDetails[key])) {
    return '';
  }
  
  return `
    <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h2 style="margin-top: 0; margin-bottom: 15px; font-size: 18px; display: flex; align-items: center; gap: 8px;">
        <span>🏦</span> <span>Bank Details</span>
      </h2>
      <table style="width: 100%; border-collapse: collapse;">
        ${bankDetails.bankName ? `<tr><td style="width: 140px; padding: 5px 0;"><strong>Bank Name:</strong></td><td>${bankDetails.bankName}</td></tr>` : ''}
        ${bankDetails.accountName ? `<tr><td style="padding: 5px 0;"><strong>Account Name:</strong></td><td>${bankDetails.accountName}</td></tr>` : ''}
        ${bankDetails.accountNumber ? `<tr><td style="padding: 5px 0;"><strong>Account Number:</strong></td><td>${bankDetails.accountNumber}</td></tr>` : ''}
        ${bankDetails.accountType ? `<tr><td style="padding: 5px 0;"><strong>Account Type:</strong></td><td>${bankDetails.accountType}</td></tr>` : ''}
        ${bankDetails.routingNumber ? `<tr><td style="padding: 5px 0;"><strong>Routing Number:</strong></td><td>${bankDetails.routingNumber}</td></tr>` : ''}
        ${bankDetails.swiftCode ? `<tr><td style="padding: 5px 0;"><strong>SWIFT Code:</strong></td><td>${bankDetails.swiftCode}</td></tr>` : ''}
        ${bankDetails.iban ? `<tr><td style="padding: 5px 0;"><strong>IBAN:</strong></td><td>${bankDetails.iban}</td></tr>` : ''}
        ${bankDetails.bankAddress ? `<tr><td style="padding: 5px 0;"><strong>Bank Address:</strong></td><td>${bankDetails.bankAddress}</td></tr>` : ''}
      </table>
    </div>
  `;
};

/**
 * Generate additional info HTML (notes, terms, custom fields)
 */
const generateAdditionalInfoHTML = (invoice) => {
  let html = '';
  
  if (invoice.notes || invoice.terms || (invoice.customFields && invoice.customFields.length > 0)) {
    html += `<div style="margin: 20px 0;">`;
    html += `<h3 style="font-size: 16px; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;"><span>📝</span> <span>Additional Information</span></h3>`;
    
    if (invoice.notes) {
      html += `
        <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <h4 style="margin: 0 0 8px 0; color: #E39A65; font-size: 15px;">Notes</h4>
          <p style="margin: 0; color: #555;">${invoice.notes}</p>
        </div>
      `;
    }
    
    if (invoice.terms) {
      html += `
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <h4 style="margin: 0 0 8px 0; color: #E39A65; font-size: 15px;">Terms & Conditions</h4>
          <p style="margin: 0; color: #555;">${invoice.terms}</p>
        </div>
      `;
    }
    
    if (invoice.customFields && invoice.customFields.length > 0) {
      html += `<div style="background: #f5f5f5; padding: 15px; border-radius: 8px;">`;
      html += `<h4 style="margin: 0 0 10px 0; color: #E39A65; font-size: 15px;">Custom Fields</h4>`;
      invoice.customFields.forEach(field => {
        html += `
          <div style="display: flex; margin-bottom: 5px;">
            <span style="width: 120px; font-weight: 600; color: #555;">${field.fieldName}:</span>
            <span style="color: #333;">${field.fieldValue}</span>
          </div>
        `;
      });
      html += `</div>`;
    }
    
    html += `</div>`;
  }
  
  return html;
};

/**
 * Generate status change HTML
 */
const generateStatusChangeHTML = (oldStatus, newStatus) => {
  const statusColors = {
    paid: '#28a745',
    partial: '#ffc107',
    unpaid: '#dc3545',
    overpaid: '#6f42c1',
    cancelled: '#6c757d'
  };

  return `
    <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center; border: 1px solid #e9ecef;">
      <div style="margin: 0 0 12px 0; font-size: 14px; color: #6c757d; text-transform: uppercase; letter-spacing: 1px; font-weight: 500;">Payment Status Changed</div>
      <div style="display: flex; align-items: center; justify-content: center; gap: 20px; flex-wrap: wrap;">
        <span style="padding: 12px 30px; border-radius: 40px; font-weight: 700; text-transform: uppercase; font-size: 16px; letter-spacing: 0.5px; min-width: 130px; text-align: center; background: #e9ecef; color: #495057; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">${oldStatus}</span>
        <span style="font-size: 28px; color: #adb5bd; font-weight: 300; line-height: 1;">→</span>
        <span style="padding: 12px 30px; border-radius: 40px; font-weight: 700; text-transform: uppercase; font-size: 16px; letter-spacing: 0.5px; min-width: 130px; text-align: center; background: ${statusColors[newStatus] || '#E39A65'}; color: white; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">${newStatus}</span>
      </div>
    </div>
  `;
};

/**
 * Get header configuration based on invoice status and email type
 */
const getHeaderConfig = (invoice, emailType = 'created') => {
  const statusColors = {
    paid: '#28a745',
    partial: '#E39A65',
    unpaid: '#E39A65',
    overpaid: '#6f42c1',
    cancelled: '#dc3545'
  };

  const statusHeaders = {
    created: {
      paid: { text: 'Invoice Paid', emoji: '✅' },
      partial: { text: 'Invoice Created', emoji: '🧾' },
      unpaid: { text: 'Invoice Created', emoji: '🧾' },
      overpaid: { text: 'Invoice Overpaid', emoji: '⚠️' },
      cancelled: { text: 'Invoice Cancelled', emoji: '❌' }
    },
    updated: {
      paid: { text: 'Invoice Paid', emoji: '✅' },
      partial: { text: 'Invoice Updated', emoji: '📝' },
      unpaid: { text: 'Invoice Updated', emoji: '📝' },
      overpaid: { text: 'Invoice Overpaid', emoji: '⚠️' },
      cancelled: { text: 'Invoice Cancelled', emoji: '❌' }
    },
    payment: {
      paid: { text: 'Payment Received', emoji: '✅' },
      partial: { text: 'Partial Payment', emoji: '💰' },
      unpaid: { text: 'Payment Pending', emoji: '⏳' },
      overpaid: { text: 'Overpayment', emoji: '⚠️' },
      cancelled: { text: 'Invoice Cancelled', emoji: '❌' }
    }
  };

  const status = invoice.paymentStatus || 'unpaid';
  const headerType = emailType === 'payment' ? 'payment' : 
                     (emailType === 'created' ? 'created' : 'updated');
  
  const config = statusHeaders[headerType][status] || statusHeaders[headerType].unpaid;
  const bgColor = statusColors[status] || '#E39A65';

  return {
    text: config.text,
    emoji: config.emoji,
    bgColor
  };
};

/**
 * Helper function to get intro message based on status and email type
 */
const getIntroMessage = (invoice, emailType, newStatus = null) => {
  const status = newStatus || invoice.paymentStatus;
  
  if (emailType === 'created') {
    if (status === 'paid') return 'Your payment has been received and an invoice has been generated.';
    if (status === 'cancelled') return 'An invoice has been created but has been cancelled.';
    return 'An invoice has been created for your inquiry. Please find the details below.';
  }
  
  if (emailType === 'updated') {
    if (status === 'paid') return 'Your invoice has been marked as paid. Thank you for your payment!';
    if (status === 'cancelled') return 'Your invoice has been cancelled.';
    return `Your invoice ${invoice.invoiceNumber} has been updated.`;
  }
  
  if (emailType === 'payment') {
    const statusMessages = {
      paid: 'Your payment has been successfully processed.',
      partial: 'A partial payment has been received.',
      unpaid: 'Your invoice is awaiting payment.',
      overpaid: 'You have overpaid this invoice.',
      cancelled: 'This invoice has been cancelled.'
    };
    return statusMessages[status] || 'The payment status of your invoice has been updated.';
  }
  
  return '';
};

/**
 * Helper function to get status message
 */
const getStatusMessage = (status) => {
  const messages = {
    paid: 'Your payment has been received. Thank you for your business!',
    partial: 'A partial payment has been received. Please complete the remaining payment.',
    unpaid: 'Your invoice is awaiting payment.',
    overpaid: 'You have overpaid this invoice. Please contact us for refund.',
    cancelled: 'This invoice has been cancelled.'
  };
  return messages[status] || 'Payment status updated.';
};

// ============================================
// INVOICE EMAIL SENDING FUNCTIONS
// ============================================

/**
 * Send invoice creation emails (customer + admin)
 */
const sendInvoiceCreationEmails = async (invoice, customerDetails) => {
  console.log('📧 Sending invoice creation emails...');
  console.log('📧 Customer email:', customerDetails?.email);
  
  try {
    if (!customerDetails?.email) {
      throw new Error('Customer email is missing');
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const itemsHTML = generateInvoiceItemsHTML(invoice.items);
    const summaryHTML = generateInvoiceSummaryHTML(invoice);
    const paymentHTML = generatePaymentBreakdownHTML(invoice, true); // Customer gets bars
    const companyHTML = generateCompanyDetailsHTML(invoice.company);
    const bankHTML = generateBankDetailsHTML(invoice.bankDetails);
    const additionalHTML = generateAdditionalInfoHTML(invoice);
    const customerInfoHTML = generateCustomerDetailsHTML(customerDetails);
    const adminPaymentHTML = generatePaymentBreakdownHTML(invoice, false); // Admin gets no bars

    // Get header configuration based on invoice status
    const headerConfig = getHeaderConfig(invoice, 'created');

    // 1. Send to customer - WITH DYNAMIC HEADER
    const customerTemplate = {
      subject: `🧾 Invoice ${invoice.invoiceNumber} - ${headerConfig.text} - Asian Clothify`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
            }
            .container {
              max-width: 700px;
              margin: 20px auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }
           // In each customer template, update the header section to this:

                .header {
                background: ${headerConfig.bgColor};
                padding: 25px 30px;
                text-align: center;
                }
                .header h1 {
                color: white;
                margin: 0;
                font-size: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 12px;
                width: 100%;
                text-align: center;
                }
                .header h1 span {
                display: inline-block;
                }
                .header h1 span:first-child {
                font-size: 32px;
                line-height: 1;
                }
            .content {
              padding: 35px 30px;
              text-align: left;
            }
            .section-title {
              font-size: 18px;
              font-weight: 600;
              margin: 25px 0 15px 0;
              display: flex;
              align-items: center;
              gap: 8px;
              color: #333;
            }
            .section-title span:first-child {
              font-size: 22px;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              text-align: left;
            }
            img {
              display: block !important;
              width: auto !important;
              max-width: 100% !important;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>
                <span>${headerConfig.emoji}</span>
                <span>${headerConfig.text}</span>
              </h1>
            </div>
            
            <div class="content">
              <p style="margin-bottom: 25px; font-size: 16px;">Dear <strong>${customerDetails.contactPerson || 'Valued Customer'}</strong>,</p>
              
              <p style="margin-bottom: 25px; font-size: 16px;">${getIntroMessage(invoice, 'created')}</p>
              
              ${companyHTML}
              ${summaryHTML}
              ${paymentHTML}
              
              <div class="section-title">
                <span>📦</span>
                <span>Products</span>
              </div>
              ${itemsHTML}
              
              ${bankHTML}
              ${additionalHTML}
              
              <div style="margin: 35px 0 25px; text-align: center;">
                <a href="${frontendUrl}/customer/invoices/${invoice._id}" style="background: #E39A65; color: white; padding: 14px 35px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                  View Invoice Details
                </a>
              </div>
              
              <div class="footer">
                <p style="margin-bottom: 5px; font-size: 16px;">Best regards,</p>
                <p style="margin: 0; font-weight: bold; color: #E39A65; font-size: 16px;">The Asian Clothify Team</p>
                <p style="font-size: 13px; color: #999; margin-top: 15px;">
                  📧 ${process.env.SMTP_USER}<br>
                  Need help? Reply to this email or contact us
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const customerResult = await transporter.sendMail({
      from: `"Asian Clothify" <${process.env.SMTP_USER}>`,
      to: customerDetails.email,
      subject: customerTemplate.subject,
      html: customerTemplate.html
    });
    console.log('✅ Customer invoice email sent:', customerResult.messageId);

    // 2. Send to admin - WITH CUSTOMER INFO and payment breakdown (no bars)
    const adminTemplate = {
      subject: `🧾 New Invoice Created: ${invoice.invoiceNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              margin: 0;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              max-width: 700px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #E39A65 0%, #d48b54 100%);
              padding: 25px 30px;
              text-align: center;
            }
            .header h1 {
              color: white;
              margin: 0;
              font-size: 28px;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 10px;
            }
            .content {
              padding: 35px 30px;
              text-align: left;
            }
            .button { 
              background: #E39A65; 
              color: white; 
              padding: 14px 35px; 
              text-decoration: none; 
              border-radius: 8px; 
              display: inline-block; 
              font-weight: bold;
              font-size: 16px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              text-align: left;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            td {
              padding: 8px 0;
            }
            .text-center {
              text-align: center;
            }
            .section-title {
              font-size: 18px;
              font-weight: 600;
              margin: 25px 0 15px 0;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            img {
              display: block !important;
              width: auto !important;
              max-width: 100% !important;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>
                <span>🧾</span>
                <span>New Invoice Created</span>
              </h1>
            </div>
            
            <div class="content">
              <p style="font-size: 16px; margin-bottom: 20px;">A new invoice has been created.</p>
              
              ${customerInfoHTML}
              ${summaryHTML}
              ${adminPaymentHTML}
              
              <div class="section-title">
                <span>📦</span>
                <span>Products</span>
              </div>
              ${itemsHTML}
              
              ${bankHTML}
              ${additionalHTML}
              
              <div class="text-center" style="margin: 30px 0;">
                <a href="${frontendUrl}/admin/invoices/${invoice._id}" class="button">
                  View in Dashboard
                </a>
              </div>
              
              <div class="footer">
                <p style="margin-bottom: 5px; font-size: 14px; color: #666;">This is an automated notification from Asian Clothify.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const adminResult = await transporter.sendMail({
      from: `"Asian Clothify System" <${process.env.SMTP_USER}>`,
      to: process.env.OWNER_EMAIL || process.env.SMTP_USER,
      subject: adminTemplate.subject,
      html: adminTemplate.html
    });
    console.log('✅ Admin invoice email sent:', adminResult.messageId);

    return { success: true };
  } catch (error) {
    console.error('❌ Invoice email error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send invoice update emails (customer + admin)
 */
const sendInvoiceUpdateEmails = async (invoice, customerDetails, changes = 'Invoice details have been updated.') => {
  console.log('📧 Sending invoice update emails...');
  console.log('📧 Invoice:', invoice.invoiceNumber);
  
  try {
    if (!customerDetails?.email) {
      throw new Error('Customer email is missing');
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const itemsHTML = generateInvoiceItemsHTML(invoice.items);
    const summaryHTML = generateInvoiceSummaryHTML(invoice);
    const paymentHTML = generatePaymentBreakdownHTML(invoice, true); // Customer gets bars
    const companyHTML = generateCompanyDetailsHTML(invoice.company);
    const bankHTML = generateBankDetailsHTML(invoice.bankDetails);
    const additionalHTML = generateAdditionalInfoHTML(invoice);
    const customerInfoHTML = generateCustomerDetailsHTML(customerDetails);
    const adminPaymentHTML = generatePaymentBreakdownHTML(invoice, false); // Admin gets no bars

    // Get header configuration based on invoice status
    const headerConfig = getHeaderConfig(invoice, 'updated');

    // 1. Send to customer - WITH DYNAMIC HEADER
    const customerTemplate = {
      subject: `📝 Invoice ${invoice.invoiceNumber} - ${headerConfig.text} - Asian Clothify`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
            }
            .container {
              max-width: 700px;
              margin: 20px auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }
            .header {
              background: ${headerConfig.bgColor};
              padding: 25px 30px;
              text-align: center;
            }
            .header h1 {
              color: white;
              margin: 0;
              font-size: 28px;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 12px;
            }
            .header h1 span:first-child {
              font-size: 32px;
              line-height: 1;
            }
            .content {
              padding: 35px 30px;
              text-align: left;
            }
            .section-title {
              font-size: 18px;
              font-weight: 600;
              margin: 25px 0 15px 0;
              display: flex;
              align-items: center;
              gap: 8px;
              color: #333;
            }
            .section-title span:first-child {
              font-size: 22px;
            }
            .changes-box {
              background: #fff3e0;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #E39A65;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              text-align: left;
            }
            img {
              display: block !important;
              width: auto !important;
              max-width: 100% !important;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>
                <span>${headerConfig.emoji}</span>
                <span>${headerConfig.text}</span>
              </h1>
            </div>
            
            <div class="content">
              <p style="margin-bottom: 25px; font-size: 16px;">Dear <strong>${customerDetails.contactPerson || 'Valued Customer'}</strong>,</p>
              
              <p style="margin-bottom: 25px; font-size: 16px;">${getIntroMessage(invoice, 'updated')}</p>
              
              <div class="changes-box">
                <h4 style="margin: 0 0 10px 0; color: #E39A65; font-size: 16px; display: flex; align-items: center; gap: 6px;">
                  <span>📋</span> <span>What's Updated</span>
                </h4>
                <p style="margin: 0; color: #555; font-size: 15px;">${changes}</p>
              </div>
              
              ${companyHTML}
              ${summaryHTML}
              ${paymentHTML}
              
              <div class="section-title">
                <span>📦</span>
                <span>Products</span>
              </div>
              ${itemsHTML}
              
              ${bankHTML}
              ${additionalHTML}
              
              <div style="margin: 35px 0 25px; text-align: center;">
                <a href="${frontendUrl}/customer/invoices/${invoice._id}" style="background: #E39A65; color: white; padding: 14px 35px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                  View Invoice Details
                </a>
              </div>
              
              <div class="footer">
                <p style="margin-bottom: 5px; font-size: 16px;">Best regards,</p>
                <p style="margin: 0; font-weight: bold; color: #E39A65; font-size: 16px;">The Asian Clothify Team</p>
                <p style="font-size: 13px; color: #999; margin-top: 15px;">
                  📧 ${process.env.SMTP_USER}<br>
                  Need help? Reply to this email or contact us
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const customerResult = await transporter.sendMail({
      from: `"Asian Clothify" <${process.env.SMTP_USER}>`,
      to: customerDetails.email,
      subject: customerTemplate.subject,
      html: customerTemplate.html,
       attachments: [
    {
      filename: `Invoice_${invoice.invoiceNumber}.pdf`,
      content: await generateInvoicePDF(invoice),
      contentType: 'application/pdf'
    }
  ]
    });
    console.log('✅ Customer invoice update email sent:', customerResult.messageId);

    // 2. Send to admin - WITH CUSTOMER INFO and payment breakdown (no bars)
    const adminTemplate = {
      subject: `📝 Invoice Updated: ${invoice.invoiceNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              margin: 0;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              max-width: 700px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #E39A65 0%, #d48b54 100%);
              padding: 25px 30px;
              text-align: center;
            }
            .header h1 {
              color: white;
              margin: 0;
              font-size: 28px;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 10px;
            }
            .content {
              padding: 35px 30px;
              text-align: left;
            }
            .button { 
              background: #E39A65; 
              color: white; 
              padding: 14px 35px; 
              text-decoration: none; 
              border-radius: 8px; 
              display: inline-block; 
              font-weight: bold;
              font-size: 16px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            .changes-box {
              background: #fff3e0;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #E39A65;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              text-align: left;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            td {
              padding: 8px 0;
            }
            .text-center {
              text-align: center;
            }
            .section-title {
              font-size: 18px;
              font-weight: 600;
              margin: 25px 0 15px 0;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            img {
              display: block !important;
              width: auto !important;
              max-width: 100% !important;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>
                <span>📝</span>
                <span>Invoice Updated</span>
              </h1>
            </div>
            
            <div class="content">
              <p style="font-size: 16px; margin-bottom: 20px;">Invoice <strong>${invoice.invoiceNumber}</strong> has been updated.</p>
              
              <div class="changes-box">
                <h4 style="margin: 0 0 10px 0; color: #E39A65; font-size: 16px; display: flex; align-items: center; gap: 6px;">
                  <span>📋</span> <span>Update Details</span>
                </h4>
                <p style="margin: 0; color: #555; font-size: 15px;">${changes}</p>
              </div>
              
              ${customerInfoHTML}
              ${summaryHTML}
              ${adminPaymentHTML}
              
              <div class="section-title">
                <span>📦</span>
                <span>Products</span>
              </div>
              ${itemsHTML}
              
              ${bankHTML}
              ${additionalHTML}
              
              <div class="text-center" style="margin: 30px 0;">
                <a href="${frontendUrl}/admin/invoices/${invoice._id}" class="button">
                  View in Dashboard
                </a>
              </div>
              
              <div class="footer">
                <p style="margin-bottom: 5px; font-size: 14px; color: #666;">This is an automated notification from Asian Clothify.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const adminResult = await transporter.sendMail({
      from: `"Asian Clothify System" <${process.env.SMTP_USER}>`,
      to: process.env.OWNER_EMAIL || process.env.SMTP_USER,
      subject: adminTemplate.subject,
      html: adminTemplate.html
    });
    console.log('✅ Admin invoice update email sent:', adminResult.messageId);

    return { success: true };
  } catch (error) {
    console.error('❌ Invoice update email error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send payment status update emails (customer + admin)
 */
const sendPaymentStatusUpdateEmails = async (invoice, customerDetails, oldStatus, newStatus) => {
  console.log('📧 Sending payment status update emails...');
  console.log('📧 Invoice:', invoice.invoiceNumber, `${oldStatus} → ${newStatus}`);
  
  try {
    if (!customerDetails?.email) {
      throw new Error('Customer email is missing');
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const itemsHTML = generateInvoiceItemsHTML(invoice.items);
    const summaryHTML = generateInvoiceSummaryHTML(invoice);
    const paymentHTML = generatePaymentBreakdownHTML(invoice, true); // Customer gets bars
    const companyHTML = generateCompanyDetailsHTML(invoice.company);
    const bankHTML = generateBankDetailsHTML(invoice.bankDetails);
    const additionalHTML = generateAdditionalInfoHTML(invoice);
    const customerInfoHTML = generateCustomerDetailsHTML(customerDetails);
    const adminPaymentHTML = generatePaymentBreakdownHTML(invoice, false); // Admin gets no bars
    const statusHTML = generateStatusChangeHTML(oldStatus, newStatus);

    // Get header configuration based on invoice status
    const headerConfig = getHeaderConfig(invoice, 'payment');

    // 1. Send to customer - WITH DYNAMIC HEADER
    const customerTemplate = {
      subject: `💰 Invoice ${invoice.invoiceNumber} - ${headerConfig.text} - Asian Clothify`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
            }
            .container {
              max-width: 700px;
              margin: 20px auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }
            .header {
              background: ${headerConfig.bgColor};
              padding: 25px 30px;
              text-align: center;
            }
            .header h1 {
              color: white;
              margin: 0;
              font-size: 28px;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 12px;
            }
            .header h1 span:first-child {
              font-size: 32px;
              line-height: 1;
            }
            .content {
              padding: 35px 30px;
              text-align: left;
            }
            .section-title {
              font-size: 18px;
              font-weight: 600;
              margin: 25px 0 15px 0;
              display: flex;
              align-items: center;
              gap: 8px;
              color: #333;
            }
            .section-title span:first-child {
              font-size: 22px;
            }
            .message-box {
              margin: 25px 0;
              padding: 20px;
              background: #f8f9fa;
              border-left: 4px solid ${headerConfig.bgColor};
              border-radius: 8px;
              font-size: 16px;
              color: #495057;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              text-align: left;
            }
            img {
              display: block !important;
              width: auto !important;
              max-width: 100% !important;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>
                <span>${headerConfig.emoji}</span>
                <span>${headerConfig.text}</span>
              </h1>
            </div>
            
            <div class="content">
              <p style="margin-bottom: 25px; font-size: 16px;">Dear <strong>${customerDetails.contactPerson || 'Valued Customer'}</strong>,</p>
              
              <p style="margin-bottom: 25px; font-size: 16px;">${getIntroMessage(invoice, 'payment', newStatus)}</p>
              
              ${statusHTML}
              
              <div class="message-box">
                <p style="margin: 0; font-size: 16px;">${getStatusMessage(newStatus)}</p>
              </div>
              
              ${companyHTML}
              ${summaryHTML}
              ${paymentHTML}
              
              <div class="section-title">
                <span>📦</span>
                <span>Products</span>
              </div>
              ${itemsHTML}
              
              ${bankHTML}
              ${additionalHTML}
              
              <div style="margin: 35px 0 25px; text-align: center;">
                <a href="${frontendUrl}/customer/invoices/${invoice._id}" style="background: #E39A65; color: white; padding: 14px 35px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                  View Invoice Details
                </a>
              </div>
              
              <div class="footer">
                <p style="margin-bottom: 5px; font-size: 16px;">Best regards,</p>
                <p style="margin: 0; font-weight: bold; color: #E39A65; font-size: 16px;">The Asian Clothify Team</p>
                <p style="font-size: 13px; color: #999; margin-top: 15px;">
                  📧 ${process.env.SMTP_USER}<br>
                  Need help? Reply to this email or contact us
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const customerResult = await transporter.sendMail({
      from: `"Asian Clothify" <${process.env.SMTP_USER}>`,
      to: customerDetails.email,
      subject: customerTemplate.subject,
      html: customerTemplate.html
    });
    console.log('✅ Customer payment status email sent:', customerResult.messageId);

    // 2. Send to admin - WITH CUSTOMER INFO and payment breakdown (no bars)
    const adminTemplate = {
      subject: `💰 Payment Status Update: ${invoice.invoiceNumber} - ${oldStatus} → ${newStatus}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              margin: 0;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              max-width: 700px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #E39A65 0%, #d48b54 100%);
              padding: 25px 30px;
              text-align: center;
            }
            .header h1 {
              color: white;
              margin: 0;
              font-size: 28px;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 10px;
            }
            .content {
              padding: 35px 30px;
              text-align: left;
            }
            .button { 
              background: #E39A65; 
              color: white; 
              padding: 14px 35px; 
              text-decoration: none; 
              border-radius: 8px; 
              display: inline-block; 
              font-weight: bold;
              font-size: 16px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              text-align: left;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            td {
              padding: 8px 0;
            }
            .text-center {
              text-align: center;
            }
            .section-title {
              font-size: 18px;
              font-weight: 600;
              margin: 25px 0 15px 0;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            img {
              display: block !important;
              width: auto !important;
              max-width: 100% !important;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>
                <span>💰</span>
                <span>Payment Status Updated</span>
              </h1>
            </div>
            
            <div class="content">
              <p style="font-size: 16px; margin-bottom: 20px;">Payment status updated for invoice <strong>${invoice.invoiceNumber}</strong>.</p>
              
              ${statusHTML}
              
              ${customerInfoHTML}
              ${summaryHTML}
              ${adminPaymentHTML}
              
              <div class="section-title">
                <span>📦</span>
                <span>Products</span>
              </div>
              ${itemsHTML}
              
              ${bankHTML}
              ${additionalHTML}
              
              <div class="text-center" style="margin: 30px 0;">
                <a href="${frontendUrl}/admin/invoices/${invoice._id}" class="button">
                  View in Dashboard
                </a>
              </div>
              
              <div class="footer">
                <p style="margin-bottom: 5px; font-size: 14px; color: #666;">This is an automated notification from Asian Clothify.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const adminResult = await transporter.sendMail({
      from: `"Asian Clothify System" <${process.env.SMTP_USER}>`,
      to: process.env.OWNER_EMAIL || process.env.SMTP_USER,
      subject: adminTemplate.subject,
      html: adminTemplate.html
    });
    console.log('✅ Admin payment status email sent:', adminResult.messageId);

    return { success: true };
  } catch (error) {
    console.error('❌ Payment status email error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendInvoiceCreationEmails,
  sendInvoiceUpdateEmails,
  sendPaymentStatusUpdateEmails
};
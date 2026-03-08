

// // utils/emailService.js
// const nodemailer = require('nodemailer');

// // Create transporter using environment variables
// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: parseInt(process.env.SMTP_PORT) || 465,
//   secure: true,
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASSWORD,
//   },
//   tls: {
//     rejectUnauthorized: false
//   }
// });

// // Verify connection
// transporter.verify((error, success) => {
//   if (error) {
//     console.error('❌ Email configuration error:', error.message);
//   } else {
//     console.log('✅ Email server is ready');
//     console.log(`📧 Using account: ${process.env.SMTP_USER}`);
//   }
// });

// /**
//  * Format currency
//  */
// const formatPrice = (price) => {
//   return new Intl.NumberFormat('en-US', {
//     style: 'currency',
//     currency: 'USD',
//     minimumFractionDigits: 2
//   }).format(price || 0);
// };

// /**
//  * Format date
//  */
// const formatDate = (dateString) => {
//   const date = new Date(dateString);
//   return date.toLocaleDateString('en-US', {
//     year: 'numeric',
//     month: 'long',
//     day: 'numeric',
//     hour: '2-digit',
//     minute: '2-digit'
//   });
// };

// /**
//  * Generate HTML for product items - WITH IMAGES and better spacing, WITHOUT color codes
//  */
// const generateItemsHTML = (items) => {
//   let html = '';
  
//   items.forEach((item) => {
//     // FIX: Better image path handling
//     let productImage = 'https://via.placeholder.com/60?text=No+Image';
    
//     // Check various possible image locations
//     if (item.productImage) {
//       productImage = item.productImage;
//     } else if (item.productId && typeof item.productId === 'object') {
//       if (item.productId.images && item.productId.images.length > 0) {
//         productImage = item.productId.images[0].url || item.productId.images[0];
//       }
//     } else if (item.imageUrl) {
//       productImage = item.imageUrl;
//     }
    
//     html += `
//       <div style="margin-bottom: 20px; padding: 15px; background: #f9f9f9; border-left: 4px solid #E39A65; border-radius: 4px;">
//         <div style="display: flex; align-items: flex-start; gap: 20px; margin-bottom: 15px;">
//           <img src="${productImage}" alt="${item.productName}" 
//                style="width: 70px; height: 70px; object-fit: cover; border-radius: 8px; border: 1px solid #ddd; display: block;  margin-right: 15px"
//                onerror="this.onerror=null; this.src='https://via.placeholder.com/70?text=No+Image';">
//           <div style="flex: 1;">
//             <h4 style="margin: 0 0 8px 0; color: #333; font-size: 16px; font-weight: 600;">${item.productName}</h4>
//             <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.5;">
//               <span style="display: inline-block; min-width: 100px;">Total Quantity:</span> <strong>${item.totalQuantity} pcs</strong><br>
//               <span style="display: inline-block; min-width: 100px;">Unit Price:</span> <strong style="color: #E39A65;">${formatPrice(item.unitPrice)}</strong>
//             </p>
//           </div>
//         </div>
        
//         <div style="margin-top: 15px;">
//           <h5 style="margin: 0 0 12px 0; color: #555; font-size: 14px; font-weight: 600;">Colors & Sizes:</h5>
//           ${item.colors.map(color => {
//             // Get color name (remove # code if it's just a hex code)
//             let colorName = color.color.name || color.color.code || 'Color';
//             // If colorName is a hex code (starts with #), just show "Color"
//             if (colorName.startsWith('#')) {
//               colorName = 'Color';
//             }
            
//             return `
//             <div style="margin-bottom: 10px; padding: 10px; background: white; border-radius: 6px; border: 1px solid #eee;">
//               <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
//                 <div style="width: 22px; height: 22px; background-color: ${color.color.code}; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></div>
//                 <span style="font-weight: 600; color: #444;">${colorName}</span>
//                 <span style="color: #E39A65; font-weight: 700; margin-left: auto; background: #fef0e7; padding: 2px 10px; border-radius: 20px;">${color.totalForColor} pcs</span>
//               </div>
//               <div style="display: flex; flex-wrap: wrap; gap: 8px; padding-left: 32px;">
//                 ${color.sizeQuantities.map(sq => `
//                   <span style="background: #f0f0f0; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;">
//                     ${sq.size}: <strong>${sq.quantity}</strong>
//                   </span>
//                 `).join('')}
//               </div>
//             </div>
//           `}).join('')}
//         </div>
        
//         ${item.specialInstructions ? `
//           <div style="margin-top: 12px; padding: 10px; background: #fff3e0; border-radius: 6px; font-size: 13px; border-left: 3px solid #E39A65;">
//             <span style="color: #E39A65; font-weight: 600; display: block; margin-bottom: 4px;">📝 Product Note:</span>
//             <span style="color: #555;">${item.specialInstructions}</span>
//           </div>
//         ` : ''}
//       </div>
//     `;
//   });
  
//   return html;
// };

// /**
//  * Generate HTML for attachments
//  */
// const generateAttachmentsHTML = (attachments) => {
//   if (!attachments || attachments.length === 0) return '';
  
//   return `
//     <div style="margin-top: 20px;">
//       <h3 style="color: #333; border-bottom: 2px solid #E39A65; padding-bottom: 5px;">📎 Attachments</h3>
//       <ul style="list-style: none; padding: 0;">
//         ${attachments.map(file => `
//           <li style="margin-bottom: 8px;">
//             <a href="${file.fileUrl}" style="color: #E39A65; text-decoration: none; display: flex; align-items: center; gap: 5px;">
//               📄 ${file.fileName} (${(file.fileSize / 1024).toFixed(1)} KB)
//             </a>
//           </li>
//         `).join('')}
//       </ul>
//     </div>
//   `;
// };

// /**
//  * Generate HTML for summary section (used in all emails)
//  */
// const generateSummaryHTML = (inquiry) => {
//   return `
//     <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
//       <h2 style="margin-top: 0; margin-bottom: 15px; color: #333;">📋 Summary</h2>
//       <table style="width: 100%; border-collapse: collapse;">
//         <tr><td style="padding: 5px 0; width: 120px;"><strong>Inquiry:</strong></td><td>${inquiry.inquiryNumber}</td></tr>
//         <tr><td style="padding: 5px 0;"><strong>Date:</strong></td><td>${formatDate(inquiry.createdAt)}</td></tr>
//         <tr><td style="padding: 5px 0;"><strong>Products:</strong></td><td>${inquiry.totalItems}</td></tr>
//         <tr><td style="padding: 5px 0;"><strong>Total Quantity:</strong></td><td>${inquiry.totalQuantity} pcs</td></tr>
//         <tr><td style="padding: 5px 0;"><strong>Total Value:</strong></td><td><span style="color: #E39A65; font-size: 18px; font-weight: bold;">${formatPrice(inquiry.subtotal)}</span></td></tr>
//       </table>
//     </div>
//   `;
// };

// /**
//  * Email Templates - Using FRONTEND_URL from .env
//  */

// // 1. Inquiry Submission Confirmation (Customer)
// const getInquirySubmissionTemplate = (inquiry, customerName) => {
//   const itemsHTML = generateItemsHTML(inquiry.items);
//   const attachmentsHTML = generateAttachmentsHTML(inquiry.attachments);
//   const summaryHTML = generateSummaryHTML(inquiry);
//   const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  
//   return {
//     subject: `✅ Inquiry Received: ${inquiry.inquiryNumber} - Asian Clothify`,
//     html: `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <style>
//           body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
//           .button { background: #E39A65; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; }
//           .button:hover { background: #d48b54; }
//         </style>
//       </head>
//       <body>
//         <div style="background: linear-gradient(135deg, #E39A65 0%, #d48b54 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
//           <h1 style="color: white; margin: 0;">Thank You for Your Inquiry!</h1>
//         </div>
        
//         <div style="background: #fff; padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 8px 8px;">
//           <p style="margin-bottom: 25px;">Dear <strong>${customerName || 'Valued Customer'}</strong>,</p>
          
//           <p style="margin-bottom: 25px;">We have received your inquiry <strong style="color: #E39A65;">${inquiry.inquiryNumber}</strong>. Our team will review and get back to you within 24-48 hours.</p>
          
//           ${summaryHTML}
          
//           <h3 style="margin-bottom: 15px;">📦 Products</h3>
//           ${itemsHTML}
          
//           ${inquiry.specialInstructions ? `
//             <div style="margin: 25px 0; padding: 15px; background: #fff3e0; border-radius: 8px;">
//               <h4 style="margin: 0 0 10px 0; color: #E39A65;">📝 Your Instructions</h4>
//               <p style="margin: 0;">${inquiry.specialInstructions}</p>
//             </div>
//           ` : ''}
          
//           ${attachmentsHTML}
          
//           <div style="margin: 30px 0; text-align: center;">
//             <p style="margin-bottom: 15px;">Track your inquiry status:</p>
//             <a href="${frontendUrl}/customer/inquiries/${inquiry._id}" class="button">
//               View Inquiry Status →
//             </a>
//           </div>
          
//           <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
//             <p style="margin-bottom: 5px;">Best regards,</p>
//             <p style="margin: 0; font-weight: bold; color: #E39A65;">The Asian Clothify Team</p>
//             <p style="font-size: 12px; color: #999; margin-top: 15px;">
//               📧 ${process.env.SMTP_USER}<br>
//               Need help? Reply to this email or chat with us on WhatsApp
//             </p>
//           </div>
//         </div>
//       </body>
//       </html>
//     `
//   };
// };

// // 2. New Inquiry Notification (Admin)
// const getNewInquiryAdminTemplate = (inquiry, customerDetails) => {
//   const itemsHTML = generateItemsHTML(inquiry.items);
//   const attachmentsHTML = generateAttachmentsHTML(inquiry.attachments);
//   const summaryHTML = generateSummaryHTML(inquiry);
//   const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  
//   return {
//     subject: `🚨 New Inquiry: ${inquiry.inquiryNumber} - Action Required`,
//     html: `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <style>
//           body { 
//             font-family: Arial, sans-serif; 
//             line-height: 1.6; 
//             color: #333; 
//             margin: 0;
//             padding: 20px;
//             background-color: #f4f4f4;
//           }
//           .container {
//             max-width: 600px;
//             margin: 0 auto;
//             background-color: #ffffff;
//             border-radius: 8px;
//             overflow: hidden;
//             box-shadow: 0 2px 10px rgba(0,0,0,0.1);
//           }
//           .header {
//             background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
//             padding: 20px;
//             text-align: center;
//           }
//           .header h1 {
//             color: white;
//             margin: 0;
//             font-size: 24px;
//           }
//           .content {
//             padding: 30px;
//             text-align: left;
//           }
//           .button { 
//             background: #E39A65; 
//             color: white; 
//             padding: 12px 30px; 
//             text-decoration: none; 
//             border-radius: 5px; 
//             display: inline-block; 
//             font-weight: bold;
//             margin: 5px;
//           }
//           .button-wa { 
//             background: #25D366; 
//             color: white; 
//             padding: 12px 30px; 
//             text-decoration: none; 
//             border-radius: 5px; 
//             display: inline-block; 
//             font-weight: bold;
//             margin: 5px;
//           }
//           .info-box {
//             background: #f0f8ff;
//             padding: 20px;
//             border-radius: 8px;
//             margin: 20px 0;
//           }
//           table {
//             width: 100%;
//             border-collapse: collapse;
//           }
//           td {
//             padding: 8px 0;
//           }
//           .text-center {
//             text-align: center;
//           }
//           img {
//             display: block !important;
//             width: auto !important;
//             max-width: 100% !important;
//           }
//         </style>
//       </head>
//       <body>
//         <div class="container">
//           <div class="header">
//             <h1>🚨 New Inquiry Received</h1>
//           </div>
          
//           <div class="content">
//             <p style="font-size: 16px; margin-bottom: 20px;">A new inquiry requires your attention.</p>
            
//             <div class="info-box">
//               <h2 style="margin-top: 0; margin-bottom: 15px;">👤 Customer Details</h2>
//               <table>
//                 <tr><td style="width: 120px;"><strong>Company:</strong></td><td>${customerDetails.companyName || 'N/A'}</td></tr>
//                 <tr><td><strong>Contact:</strong></td><td>${customerDetails.contactPerson || 'N/A'}</td></tr>
//                 <tr><td><strong>Email:</strong></td><td><a href="mailto:${customerDetails.email}" style="color: #E39A65;">${customerDetails.email || 'N/A'}</a></td></tr>
//                 <tr><td><strong>Phone:</strong></td><td>${customerDetails.phone || 'N/A'}</td></tr>
//                 <tr><td><strong>WhatsApp:</strong></td><td>${customerDetails.whatsapp ? `<a href="https://wa.me/${customerDetails.whatsapp}" style="color: #25D366;">${customerDetails.whatsapp}</a>` : 'N/A'}</td></tr>
//               </table>
//             </div>
            
//             ${summaryHTML}
            
//             <h3 style="margin-bottom: 15px;">📦 Products</h3>
//             ${itemsHTML}
            
//             ${inquiry.specialInstructions ? `
//               <div style="margin: 20px 0; padding: 15px; background: #fff3e0; border-radius: 8px;">
//                 <h4 style="margin: 0 0 10px 0; color: #E39A65;">📝 Customer Instructions</h4>
//                 <p style="margin: 0;">${inquiry.specialInstructions}</p>
//               </div>
//             ` : ''}
            
//             ${attachmentsHTML}
            
//             <div class="text-center" style="margin: 30px 0;">
//               <a href="${frontendUrl}/admin/inquiries/${inquiry._id}" class="button">
//                 View in Dashboard
//               </a>
//               ${customerDetails.whatsapp ? `
//                 <a href="https://wa.me/${customerDetails.whatsapp}" class="button-wa">
//                   WhatsApp Customer
//                 </a>
//               ` : ''}
//             </div>
//           </div>
//         </div>
//       </body>
//       </html>
//     `
//   };
// };

// // 3. Status Update Notification (Customer) - WITH FIXED ARROW ALIGNMENT
// // 3. Status Update Notification (Customer) - WITH FULL DETAILS and FIXED ARROW ALIGNMENT
// const getStatusUpdateCustomerTemplate = (inquiry, oldStatus, newStatus) => {
//   const statusMessages = {
//     submitted: { emoji: '📝', message: 'Your inquiry has been submitted and is pending review.' },
//     quoted: { emoji: '💰', message: 'A quotation has been prepared. Please review and accept it.' },
//     accepted: { emoji: '✅', message: 'You have accepted the quotation. We will prepare an invoice.' },
//     invoiced: { emoji: '📄', message: 'An invoice has been generated. You can view and pay it.' },
//     paid: { emoji: '🎉', message: 'Payment received! Thank you for your business.' },
//     cancelled: { emoji: '❌', message: 'Your inquiry has been cancelled.' }
//   };

//   const statusColors = {
//     submitted: '#ffc107',
//     quoted: '#17a2b8',
//     accepted: '#28a745',
//     invoiced: '#6f42c1',
//     paid: '#28a745',
//     cancelled: '#dc3545'
//   };

//   const currentStatus = statusMessages[newStatus] || statusMessages.submitted;
//   const itemsHTML = generateItemsHTML(inquiry.items);
//   const attachmentsHTML = generateAttachmentsHTML(inquiry.attachments);
//   const summaryHTML = generateSummaryHTML(inquiry);
//   const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  
//   return {
//     subject: `📢 Inquiry ${inquiry.inquiryNumber} Status Update: ${newStatus.toUpperCase()}`,
//     html: `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <style>
//           body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
//           .button { background: #E39A65; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; }
//           .button:hover { background: #d48b54; }
//           .status-container {
//             background: #f5f5f5;
//             padding: 25px;
//             border-radius: 8px;
//             margin: 20px 0;
//             text-align: center;
//           }
//           .status-row {
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             gap: 15px;
//             flex-wrap: wrap;
//           }
//           .status-badge {
//             padding: 10px 25px;
//             border-radius: 30px;
//             font-weight: bold;
//             text-transform: uppercase;
//             font-size: 16px;
//             min-width: 120px;
//             text-align: center;
//           }
//           .status-arrow {
//             font-size: 24px;
//             color: #999;
//             display: inline-block;
//             vertical-align: middle;
//           }
//         </style>
//       </head>
//       <body>
//         <div style="background: linear-gradient(135deg, ${statusColors[newStatus]} 0%, ${statusColors[newStatus]}dd 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
//           <h1 style="color: white; margin: 0;">${currentStatus.emoji} Status Update</h1>
//         </div>
        
//         <div style="background: #fff; padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 8px 8px;">
//           <p style="margin-bottom: 20px;">Dear Valued Customer,</p>
          
//           <p style="margin-bottom: 20px;">The status of your inquiry <strong style="color: #E39A65;">${inquiry.inquiryNumber}</strong> has been updated.</p>
          
//           <div class="status-container">
//             <p style="margin: 0 0 15px 0; font-size: 14px; color: #666;">Status changed from</p>
//             <div class="status-row">
//               <span class="status-badge" style="background: #f0f0f0; color: #666;">${oldStatus}</span>
//               <span class="status-arrow">→</span>
//               <span class="status-badge" style="background: ${statusColors[newStatus]}; color: white;">${newStatus}</span>
//             </div>
//           </div>
          
//           <div style="margin: 30px 0; padding: 20px; background: #f8f9fa; border-left: 4px solid ${statusColors[newStatus]}; border-radius: 4px;">
//             <p style="margin: 0; font-size: 16px;">${currentStatus.message}</p>
//           </div>
          
//           ${summaryHTML}
          
//           <h3 style="margin-bottom: 15px; margin-top: 30px;">📦 Products</h3>
//           ${itemsHTML}
          
//           ${inquiry.specialInstructions ? `
//             <div style="margin: 25px 0; padding: 15px; background: #fff3e0; border-radius: 8px;">
//               <h4 style="margin: 0 0 10px 0; color: #E39A65;">📝 Your Instructions</h4>
//               <p style="margin: 0;">${inquiry.specialInstructions}</p>
//             </div>
//           ` : ''}
          
//           ${attachmentsHTML}
          
//           <div style="margin: 30px 0; text-align: center;">
//             <a href="${frontendUrl}/customer/inquiries/${inquiry._id}" class="button">
//               View Details
//             </a>
//           </div>
          
//           <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
//             <p style="margin-bottom: 5px;">Best regards,</p>
//             <p style="margin: 0; font-weight: bold; color: #E39A65;">The Asian Clothify Team</p>
//             <p style="font-size: 12px; color: #999; margin-top: 15px;">
//               📧 ${process.env.SMTP_USER}<br>
//               Need help? Reply to this email or chat with us on WhatsApp
//             </p>
//           </div>
//         </div>
//       </body>
//       </html>
//     `
//   };
// };

// // 4. Status Update Notification (Admin)
// const getStatusUpdateAdminTemplate = (inquiry, customerDetails, oldStatus, newStatus) => {
//   const itemsHTML = generateItemsHTML(inquiry.items);
//   const attachmentsHTML = generateAttachmentsHTML(inquiry.attachments);
//   const summaryHTML = generateSummaryHTML(inquiry);
//   const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  
//   const statusColors = {
//     submitted: '#ffc107',
//     quoted: '#17a2b8',
//     accepted: '#28a745',
//     invoiced: '#6f42c1',
//     paid: '#28a745',
//     cancelled: '#dc3545'
//   };
  
//   return {
//     subject: `📢 Status Update: ${inquiry.inquiryNumber} - ${oldStatus} → ${newStatus}`,
//     html: `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <style>
//           body { 
//             font-family: Arial, sans-serif; 
//             line-height: 1.6; 
//             color: #333; 
//             margin: 0;
//             padding: 20px;
//             background-color: #f4f4f4;
//           }
//           .container {
//             max-width: 600px;
//             margin: 0 auto;
//             background-color: #ffffff;
//             border-radius: 8px;
//             overflow: hidden;
//             box-shadow: 0 2px 10px rgba(0,0,0,0.1);
//           }
//           .header {
//             background: linear-gradient(135deg, #E39A65 0%, #d48b54 100%);
//             padding: 20px;
//             text-align: center;
//           }
//           .header h1 {
//             color: white;
//             margin: 0;
//             font-size: 24px;
//           }
//           .content {
//             padding: 30px;
//             text-align: left;
//           }
//           .button { 
//             background: #E39A65; 
//             color: white; 
//             padding: 12px 30px; 
//             text-decoration: none; 
//             border-radius: 5px; 
//             display: inline-block; 
//             font-weight: bold;
//             margin: 5px;
//           }
//           .button-wa { 
//             background: #25D366; 
//             color: white; 
//             padding: 12px 30px; 
//             text-decoration: none; 
//             border-radius: 5px; 
//             display: inline-block; 
//             font-weight: bold;
//             margin: 5px;
//           }
//           .info-box {
//             background: #f0f8ff;
//             padding: 20px;
//             border-radius: 8px;
//             margin: 20px 0;
//           }
//           .status-container {
//             background: #f5f5f5;
//             padding: 20px;
//             border-radius: 8px;
//             margin: 20px 0;
//             text-align: center;
//           }
//           .status-row {
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             gap: 15px;
//             flex-wrap: wrap;
//           }
//           .status-badge {
//             padding: 8px 20px;
//             border-radius: 30px;
//             font-weight: bold;
//             text-transform: uppercase;
//             font-size: 14px;
//             min-width: 100px;
//             text-align: center;
//           }
//           .status-arrow {
//             font-size: 20px;
//             color: #999;
//           }
//           table {
//             width: 100%;
//             border-collapse: collapse;
//           }
//           td {
//             padding: 8px 0;
//           }
//           .text-center {
//             text-align: center;
//           }
//           img {
//             display: block !important;
//             width: auto !important;
//             max-width: 100% !important;
//           }
//         </style>
//       </head>
//       <body>
//         <div class="container">
//           <div class="header">
//             <h1>📢 Inquiry Status Updated</h1>
//           </div>
          
//           <div class="content">
//             <p style="font-size: 16px; margin-bottom: 20px;">The status of inquiry <strong>${inquiry.inquiryNumber}</strong> has been updated.</p>
            
//             <div class="info-box">
//               <h2 style="margin-top: 0; margin-bottom: 15px;">👤 Customer Details</h2>
//               <table>
//                 <tr><td style="width: 120px;"><strong>Company:</strong></td><td>${customerDetails.companyName || 'N/A'}</td></tr>
//                 <tr><td><strong>Contact:</strong></td><td>${customerDetails.contactPerson || 'N/A'}</td></tr>
//                 <tr><td><strong>Email:</strong></td><td><a href="mailto:${customerDetails.email}" style="color: #E39A65;">${customerDetails.email || 'N/A'}</a></td></tr>
//                 <tr><td><strong>Phone:</strong></td><td>${customerDetails.phone || 'N/A'}</td></tr>
//                 <tr><td><strong>WhatsApp:</strong></td><td>${customerDetails.whatsapp ? `<a href="https://wa.me/${customerDetails.whatsapp}" style="color: #25D366;">${customerDetails.whatsapp}</a>` : 'N/A'}</td></tr>
//               </table>
//             </div>
            
//             <div class="status-container">
//               <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Status changed from</p>
//               <div class="status-row">
//                 <span class="status-badge" style="background: #f0f0f0; color: #666;">${oldStatus}</span>
//                 <span class="status-arrow">→</span>
//                 <span class="status-badge" style="background: ${statusColors[newStatus] || '#E39A65'}; color: white;">${newStatus}</span>
//               </div>
//             </div>
            
//             ${summaryHTML}
            
//             <h3 style="margin-bottom: 15px;">📦 Products</h3>
//             ${itemsHTML}
            
//             ${inquiry.specialInstructions ? `
//               <div style="margin: 20px 0; padding: 15px; background: #fff3e0; border-radius: 8px;">
//                 <h4 style="margin: 0 0 10px 0; color: #E39A65;">📝 Customer Instructions</h4>
//                 <p style="margin: 0;">${inquiry.specialInstructions}</p>
//               </div>
//             ` : ''}
            
//             ${attachmentsHTML}
            
//             <div class="text-center" style="margin: 30px 0;">
//               <a href="${frontendUrl}/admin/inquiries/${inquiry._id}" class="button">
//                 View in Dashboard
//               </a>
//               ${customerDetails.whatsapp ? `
//                 <a href="https://wa.me/${customerDetails.whatsapp}" class="button-wa">
//                   WhatsApp Customer
//                 </a>
//               ` : ''}
//             </div>
//           </div>
//         </div>
//       </body>
//       </html>
//     `
//   };
// };

// /**
//  * Email Sending Functions
//  */

// const sendInquirySubmissionEmails = async (inquiry, customerDetails) => {
//   console.log('📧 Sending inquiry submission emails...');
//   console.log('📧 Customer email:', customerDetails?.email);
  
//   try {
//     if (!customerDetails?.email) {
//       throw new Error('Customer email is missing');
//     }

//     // Send to customer
//     const customerTemplate = getInquirySubmissionTemplate(inquiry, customerDetails.contactPerson);
//     const customerResult = await transporter.sendMail({
//       from: `"Asian Clothify" <${process.env.SMTP_USER}>`,
//       to: customerDetails.email,
//       subject: customerTemplate.subject,
//       html: customerTemplate.html
//     });
//     console.log('✅ Customer email sent:', customerResult.messageId);

//     // Send to admin
//     const adminTemplate = getNewInquiryAdminTemplate(inquiry, customerDetails);
//     const adminResult = await transporter.sendMail({
//       from: `"Asian Clothify System" <${process.env.SMTP_USER}>`,
//       to: process.env.OWNER_EMAIL || process.env.SMTP_USER,
//       subject: adminTemplate.subject,
//       html: adminTemplate.html
//     });
//     console.log('✅ Admin email sent:', adminResult.messageId);

//     return { success: true };
//   } catch (error) {
//     console.error('❌ Email error:', error.message);
//     return { success: false, error: error.message };
//   }
// };

// const sendStatusUpdateEmail = async (inquiry, oldStatus, newStatus) => {
//   console.log('📧 Sending status update emails...');
//   console.log('📧 Inquiry:', inquiry.inquiryNumber, `${oldStatus} → ${newStatus}`);
  
//   try {
//     if (!inquiry.userDetails?.email) {
//       throw new Error('Customer email is missing');
//     }

//     // Send to customer - WITH FULL DETAILS
//     const customerTemplate = getStatusUpdateCustomerTemplate(inquiry, oldStatus, newStatus);
//     const customerResult = await transporter.sendMail({
//       from: `"Asian Clothify" <${process.env.SMTP_USER}>`,
//       to: inquiry.userDetails.email,
//       subject: customerTemplate.subject,
//       html: customerTemplate.html
//     });
//     console.log('✅ Customer status email sent:', customerResult.messageId);

//     // Send to admin
//     const adminTemplate = getStatusUpdateAdminTemplate(inquiry, inquiry.userDetails, oldStatus, newStatus);
//     const adminResult = await transporter.sendMail({
//       from: `"Asian Clothify System" <${process.env.SMTP_USER}>`,
//       to: process.env.OWNER_EMAIL || process.env.SMTP_USER,
//       subject: `📢 Status Update: ${inquiry.inquiryNumber} - ${oldStatus} → ${newStatus}`,
//       html: adminTemplate.html
//     });
//     console.log('✅ Admin status email sent:', adminResult.messageId);

//     return { success: true };
//   } catch (error) {
//     console.error('❌ Status update email error:', error.message);
//     return { success: false, error: error.message };
//   }
// };

// module.exports = {
//   sendInquirySubmissionEmails,
//   sendStatusUpdateEmail,
//   sendInvoiceGeneratedEmail: async () => ({ success: true }), // Placeholder
//   sendPaymentConfirmationEmail: async () => ({ success: true }), // Placeholder
//   sendCustomEmail: async (to, subject, html) => {
//     try {
//       await transporter.sendMail({
//         from: `"Asian Clothify" <${process.env.SMTP_USER}>`,
//         to,
//         subject,
//         html
//       });
//       return { success: true };
//     } catch (error) {
//       return { success: false, error: error.message };
//     }
//   }
// };

// utils/emailService.js
const nodemailer = require('nodemailer');

// Create transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  },
    family: 4, // force IPv4
  connectionTimeout: 60000
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email configuration error:', error.message);
  } else {
    console.log('✅ Email server is ready');
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
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Generate HTML for product items - WITH IMAGES and better spacing, WITHOUT color codes
 */
const generateItemsHTML = (items) => {
  let html = '';
  
  items.forEach((item) => {
    // FIX: Better image path handling
    let productImage = 'https://via.placeholder.com/60?text=No+Image';
    
    // Check various possible image locations
    if (item.productImage) {
      productImage = item.productImage;
    } else if (item.productId && typeof item.productId === 'object') {
      if (item.productId.images && item.productId.images.length > 0) {
        productImage = item.productId.images[0].url || item.productId.images[0];
      }
    } else if (item.imageUrl) {
      productImage = item.imageUrl;
    }
    
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
            // Get color name (remove # code if it's just a hex code)
            let colorName = color.color.name || color.color.code || 'Color';
            // If colorName is a hex code (starts with #), just show "Color"
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
        
        ${item.specialInstructions ? `
          <div style="margin-top: 12px; padding: 10px; background: #fff3e0; border-radius: 6px; font-size: 13px; border-left: 3px solid #E39A65;">
            <span style="color: #E39A65; font-weight: 600; display: block; margin-bottom: 4px;">📝 Product Note:</span>
            <span style="color: #555;">${item.specialInstructions}</span>
          </div>
        ` : ''}
      </div>
    `;
  });
  
  return html;
};

/**
 * Generate HTML for attachments
 */
const generateAttachmentsHTML = (attachments) => {
  if (!attachments || attachments.length === 0) return '';
  
  return `
    <div style="margin-top: 20px;">
      <h3 style="color: #333; border-bottom: 2px solid #E39A65; padding-bottom: 5px;">📎 Attachments</h3>
      <ul style="list-style: none; padding: 0;">
        ${attachments.map(file => `
          <li style="margin-bottom: 8px;">
            <a href="${file.fileUrl}" style="color: #E39A65; text-decoration: none; display: flex; align-items: center; gap: 5px;">
              📄 ${file.fileName} (${(file.fileSize / 1024).toFixed(1)} KB)
            </a>
          </li>
        `).join('')}
      </ul>
    </div>
  `;
};

/**
 * Generate HTML for summary section (used in all emails)
 */
const generateSummaryHTML = (inquiry) => {
  return `
    <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h2 style="margin-top: 0; margin-bottom: 15px; color: #333; font-size: 18px;">Summary</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px 0; width: 120px;"><strong>Inquiry:</strong></td><td>${inquiry.inquiryNumber}</td></tr>
        <tr><td style="padding: 8px 0;"><strong>Date:</strong></td><td>${formatDate(inquiry.createdAt)}</td></tr>
        <tr><td style="padding: 8px 0;"><strong>Products:</strong></td><td>${inquiry.totalItems}</td></tr>
        <tr><td style="padding: 8px 0;"><strong>Total Quantity:</strong></td><td>${inquiry.totalQuantity} pcs</td></tr>
        <tr><td style="padding: 8px 0;"><strong>Total Value:</strong></td><td><span style="color: #E39A65; font-size: 18px; font-weight: bold;">${formatPrice(inquiry.subtotal)}</span></td></tr>
      </table>
    </div>
  `;
};

/**
 * Generate status section HTML (used in status update emails)
 */
const generateStatusHTML = (oldStatus, newStatus, statusColors) => {
  return `
    <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center; border: 1px solid #e9ecef;">
      <div style="margin: 0 0 12px 0; font-size: 14px; color: #6c757d; text-transform: uppercase; letter-spacing: 1px; font-weight: 500;">Status Changed From</div>
      <div style="display: flex; align-items: center; justify-content: center; gap: 20px; flex-wrap: wrap;">
        <span style="padding: 12px 30px; border-radius: 40px; font-weight: 700; text-transform: uppercase; font-size: 16px; letter-spacing: 0.5px; min-width: 130px; text-align: center; background: #e9ecef; color: #495057; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">${oldStatus}</span>
        <span style="font-size: 28px; color: #adb5bd; font-weight: 300; line-height: 1;">→</span>
        <span style="padding: 12px 30px; border-radius: 40px; font-weight: 700; text-transform: uppercase; font-size: 16px; letter-spacing: 0.5px; min-width: 130px; text-align: center; background: ${statusColors[newStatus]}; color: white; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">${newStatus}</span>
      </div>
    </div>
  `;
};

/**
 * Email Templates - Using FRONTEND_URL from .env
 */

// 1. Inquiry Submission Confirmation (Customer)
const getInquirySubmissionTemplate = (inquiry, customerName) => {
  const itemsHTML = generateItemsHTML(inquiry.items);
  const attachmentsHTML = generateAttachmentsHTML(inquiry.attachments);
  const summaryHTML = generateSummaryHTML(inquiry);
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  
  return {
    subject: `✅ Inquiry Received: ${inquiry.inquiryNumber} - Asian Clothify`,
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
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #E39A65 0%, #d48b54 100%);
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            color: white;
            margin: 0;
            font-size: 28px;
          }
          .content {
            padding: 30px;
            text-align: left;
          }
          .button { 
            background: #E39A65; 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            display: inline-block; 
            font-weight: bold;
            margin: 5px;
          }
          .button:hover { 
            background: #d48b54; 
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
            <h1>Thank You for Your Inquiry!</h1>
          </div>
          
          <div class="content">
            <p style="margin-bottom: 25px; font-size: 16px;">Dear <strong>${customerName || 'Valued Customer'}</strong>,</p>
            
            <p style="margin-bottom: 25px; font-size: 16px;">We have received your inquiry <strong style="color: #E39A65;">${inquiry.inquiryNumber}</strong>. Our team will review and get back to you within 24-48 hours.</p>
            
            ${summaryHTML}
            
            <h3 style="margin-bottom: 15px; font-size: 18px;"> Products</h3>
            ${itemsHTML}
            
            ${inquiry.specialInstructions ? `
              <div style="margin: 25px 0; padding: 15px; background: #fff3e0; border-radius: 8px;">
                <h4 style="margin: 0 0 10px 0; color: #E39A65; font-size: 16px;">📝 Your Instructions</h4>
                <p style="margin: 0; color: #555;">${inquiry.specialInstructions}</p>
              </div>
            ` : ''}
            
            ${attachmentsHTML}
            
            <div style="margin: 35px 0 25px; text-align: center;">
              <a href="${frontendUrl}" class="button" style="font-size: 16px;">
                View Inquiry Status →
              </a>
            </div>
            
            <div class="footer">
              <p style="margin-bottom: 5px; font-size: 16px;">Best regards,</p>
              <p style="margin: 0; font-weight: bold; color: #E39A65; font-size: 16px;">The Asian Clothify Team</p>
              <p style="font-size: 13px; color: #999; margin-top: 15px;">
                📧 ${process.env.SMTP_USER}<br>
                Need help? Reply to this email or chat with us on WhatsApp
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

// 2. New Inquiry Notification (Admin)
const getNewInquiryAdminTemplate = (inquiry, customerDetails) => {
  const itemsHTML = generateItemsHTML(inquiry.items);
  const attachmentsHTML = generateAttachmentsHTML(inquiry.attachments);
  const summaryHTML = generateSummaryHTML(inquiry);
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  
  return {
    subject: `🚨 New Inquiry: ${inquiry.inquiryNumber} - Action Required`,
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
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            color: white;
            margin: 0;
            font-size: 28px;
          }
          .content {
            padding: 30px;
            text-align: left;
          }
          .button { 
            background: #E39A65; 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            display: inline-block; 
            font-weight: bold;
            margin: 5px;
          }
          .button-wa { 
            background: #25D366; 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            display: inline-block; 
            font-weight: bold;
            margin: 5px;
          }
          .info-box {
            background: #f0f8ff;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
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
            <h1>🚨 New Inquiry Received</h1>
          </div>
          
          <div class="content">
            <p style="font-size: 16px; margin-bottom: 20px;">A new inquiry requires your attention.</p>
            
            <div class="info-box">
              <h2 style="margin-top: 0; margin-bottom: 15px; font-size: 18px;">👤 Customer Details</h2>
              <table>
                <tr><td style="width: 120px;"><strong>Company:</strong></td><td>${customerDetails.companyName || 'N/A'}</td></tr>
                <tr><td><strong>Contact:</strong></td><td>${customerDetails.contactPerson || 'N/A'}</td></tr>
                <tr><td><strong>Email:</strong></td><td><a href="mailto:${customerDetails.email}" style="color: #E39A65;">${customerDetails.email || 'N/A'}</a></td></tr>
                <tr><td><strong>Phone:</strong></td><td>${customerDetails.phone || 'N/A'}</td></tr>
                <tr><td><strong>WhatsApp:</strong></td><td>${customerDetails.whatsapp ? `<a href="https://wa.me/${customerDetails.whatsapp}" style="color: #25D366;">${customerDetails.whatsapp}</a>` : 'N/A'}</td></tr>
              </table>
            </div>
            
            ${summaryHTML}
            
            <h3 style="margin-bottom: 15px; font-size: 18px;">📦 Products</h3>
            ${itemsHTML}
            
            ${inquiry.specialInstructions ? `
              <div style="margin: 20px 0; padding: 15px; background: #fff3e0; border-radius: 8px;">
                <h4 style="margin: 0 0 10px 0; color: #E39A65; font-size: 16px;">📝 Customer Instructions</h4>
                <p style="margin: 0; color: #555;">${inquiry.specialInstructions}</p>
              </div>
            ` : ''}
            
            ${attachmentsHTML}
            
            <div class="text-center" style="margin: 30px 0;">
              <a href="${frontendUrl}" class="button">
                View in Dashboard
              </a>
              ${customerDetails.whatsapp ? `
                <a href="https://wa.me/${customerDetails.whatsapp}" class="button-wa">
                  WhatsApp Customer
                </a>
              ` : ''}
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
};

// 3. Status Update Notification (Customer) - WITH FULL DETAILS and CONSISTENT DESIGN
const getStatusUpdateCustomerTemplate = (inquiry, oldStatus, newStatus) => {
  const statusMessages = {
    submitted: { emoji: '📝', message: 'Your inquiry has been submitted and is pending review.' },
    quoted: { emoji: '💰', message: 'A quotation has been prepared. Please review and accept it.' },
    accepted: { emoji: '✅', message: 'You have accepted the quotation. We will prepare an invoice.' },
    invoiced: { emoji: '📄', message: 'An invoice has been generated. You can view and pay it.' },
    paid: { emoji: '🎉', message: 'Payment received! Thank you for your business.' },
    cancelled: { emoji: '❌', message: 'Your inquiry has been cancelled.' }
  };

  const statusColors = {
    submitted: '#ffc107',
    quoted: '#17a2b8',
    accepted: '#28a745',
    invoiced: '#6f42c1',
    paid: '#28a745',
    cancelled: '#dc3545'
  };

  const currentStatus = statusMessages[newStatus] || statusMessages.submitted;
  const itemsHTML = generateItemsHTML(inquiry.items);
  const attachmentsHTML = generateAttachmentsHTML(inquiry.attachments);
  const summaryHTML = generateSummaryHTML(inquiry);
  const statusHTML = generateStatusHTML(oldStatus, newStatus, statusColors);
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  
  return {
    subject: `📢 Inquiry ${inquiry.inquiryNumber} Status Update: ${newStatus.toUpperCase()}`,
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
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, ${statusColors[newStatus]} 0%, ${statusColors[newStatus]}dd 100%);
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            color: white;
            margin: 0;
            font-size: 28px;
          }
          .content {
            padding: 30px;
            text-align: left;
          }
          .button { 
            background: #E39A65; 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            display: inline-block; 
            font-weight: bold;
            margin: 5px;
          }
          .button:hover { 
            background: #d48b54; 
          }
          .message-box {
            margin: 25px 0;
            padding: 20px;
            background: #f8f9fa;
            border-left: 4px solid ${statusColors[newStatus]};
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
  <h1 style="color: white; margin: 0; font-size: 28px; text-align: center;">
    <span style="display: inline-block; vertical-align: middle; margin-right: 10px;">${currentStatus.emoji}</span>
    <span style="display: inline-block; vertical-align: middle;">Status Update</span>
  </h1>
</div>
          
          <div class="content">
            <p style="margin-bottom: 20px; font-size: 16px;">Dear Valued Customer,</p>
            
            <p style="margin-bottom: 20px; font-size: 16px;">The status of your inquiry <strong style="color: #E39A65;">${inquiry.inquiryNumber}</strong> has been updated.</p>
            
            ${statusHTML}
            
            <div class="message-box">
              <p style="margin: 0; font-size: 16px;">${currentStatus.message}</p>
            </div>
            
            ${summaryHTML}
            
            <h3 style="margin-bottom: 15px; font-size: 18px;"> Products</h3>
            ${itemsHTML}
            
            ${inquiry.specialInstructions ? `
              <div style="margin: 25px 0; padding: 15px; background: #fff3e0; border-radius: 8px;">
                <h4 style="margin: 0 0 10px 0; color: #E39A65; font-size: 16px;">📝 Your Instructions</h4>
                <p style="margin: 0; color: #555;">${inquiry.specialInstructions}</p>
              </div>
            ` : ''}
            
            ${attachmentsHTML}
            
            <div style="margin: 35px 0 25px; text-align: center;">
              <a href="${frontendUrl}" class="button" style="font-size: 16px; color: #ffffff;">
                View Details
              </a>
            </div>
            
            <div class="footer">
              <p style="margin-bottom: 5px; font-size: 16px;">Best regards,</p>
              <p style="margin: 0; font-weight: bold; color: #E39A65; font-size: 16px;">The Asian Clothify Team</p>
              <p style="font-size: 13px; color: #999; margin-top: 15px;">
                📧 ${process.env.SMTP_USER}<br>
                Need help? Reply to this email or chat with us on WhatsApp
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

// 4. Status Update Notification (Admin) - WITH CONSISTENT DESIGN
const getStatusUpdateAdminTemplate = (inquiry, customerDetails, oldStatus, newStatus) => {
  const itemsHTML = generateItemsHTML(inquiry.items);
  const attachmentsHTML = generateAttachmentsHTML(inquiry.attachments);
  const summaryHTML = generateSummaryHTML(inquiry);
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  
  const statusColors = {
    submitted: '#ffc107',
    quoted: '#17a2b8',
    accepted: '#28a745',
    invoiced: '#6f42c1',
    paid: '#28a745',
    cancelled: '#dc3545'
  };
  
  const statusHTML = generateStatusHTML(oldStatus, newStatus, statusColors);
  
  return {
    subject: `📢 Status Update: ${inquiry.inquiryNumber} - ${oldStatus} → ${newStatus}`,
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
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #E39A65 0%, #d48b54 100%);
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            color: white;
            margin: 0;
            font-size: 28px;
          }
          .content {
            padding: 30px;
            text-align: left;
          }
          .button { 
            background: #E39A65; 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            display: inline-block; 
            font-weight: bold;
            margin: 5px;
          }
          .button-wa { 
            background: #25D366; 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            display: inline-block; 
            font-weight: bold;
            margin: 5px;
          }
          .info-box {
            background: #f0f8ff;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
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
            <h1>📢 Inquiry Status Updated</h1>
          </div>
          
          <div class="content">
            <p style="font-size: 16px; margin-bottom: 20px;">The status of inquiry <strong>${inquiry.inquiryNumber}</strong> has been updated.</p>
            
            <div class="info-box">
              <h2 style="margin-top: 0; margin-bottom: 15px; font-size: 18px;">👤 Customer Details</h2>
              <table>
                <tr><td style="width: 120px;"><strong>Company:</strong></td><td>${customerDetails.companyName || 'N/A'}</td></tr>
                <tr><td><strong>Contact:</strong></td><td>${customerDetails.contactPerson || 'N/A'}</td></tr>
                <tr><td><strong>Email:</strong></td><td><a href="mailto:${customerDetails.email}" style="color: #E39A65;">${customerDetails.email || 'N/A'}</a></td></tr>
                <tr><td><strong>Phone:</strong></td><td>${customerDetails.phone || 'N/A'}</td></tr>
                <tr><td><strong>WhatsApp:</strong></td><td>${customerDetails.whatsapp ? `<a href="https://wa.me/${customerDetails.whatsapp}" style="color: #25D366;">${customerDetails.whatsapp}</a>` : 'N/A'}</td></tr>
              </table>
            </div>
            
            ${statusHTML}
            
            ${summaryHTML}
            
            <h3 style="margin-bottom: 15px; font-size: 18px;">📦 Products</h3>
            ${itemsHTML}
            
            ${inquiry.specialInstructions ? `
              <div style="margin: 20px 0; padding: 15px; background: #fff3e0; border-radius: 8px;">
                <h4 style="margin: 0 0 10px 0; color: #E39A65; font-size: 16px;">📝 Customer Instructions</h4>
                <p style="margin: 0; color: #555;">${inquiry.specialInstructions}</p>
              </div>
            ` : ''}
            
            ${attachmentsHTML}
            
            <div class="text-center" style="margin: 30px 0;">
              <a href="${frontendUrl}" class="button">
                View in Dashboard
              </a>
              ${customerDetails.whatsapp ? `
                <a href="https://wa.me/${customerDetails.whatsapp}" class="button-wa">
                  WhatsApp Customer
                </a>
              ` : ''}
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
};

/**
 * Email Sending Functions
 */

const sendInquirySubmissionEmails = async (inquiry, customerDetails) => {
  console.log('📧 Sending inquiry submission emails...');
  console.log('📧 Customer email:', customerDetails?.email);
  
  try {
    if (!customerDetails?.email) {
      throw new Error('Customer email is missing');
    }

    // Send to customer
    const customerTemplate = getInquirySubmissionTemplate(inquiry, customerDetails.contactPerson);
    const customerResult = await transporter.sendMail({
      from: `"Asian Clothify" <${process.env.SMTP_USER}>`,
      to: customerDetails.email,
      subject: customerTemplate.subject,
      html: customerTemplate.html
    });
    console.log('✅ Customer email sent:', customerResult.messageId);

    // Send to admin
    const adminTemplate = getNewInquiryAdminTemplate(inquiry, customerDetails);
    const adminResult = await transporter.sendMail({
      from: `"Asian Clothify System" <${process.env.SMTP_USER}>`,
      to: process.env.OWNER_EMAIL || process.env.SMTP_USER,
      subject: adminTemplate.subject,
      html: adminTemplate.html
    });
    console.log('✅ Admin email sent:', adminResult.messageId);

    return { success: true };
  } catch (error) {
    console.error('❌ Email error:', error.message);
    return { success: false, error: error.message };
  }
};

const sendStatusUpdateEmail = async (inquiry, oldStatus, newStatus) => {
  console.log('📧 Sending status update emails...');
  console.log('📧 Inquiry:', inquiry.inquiryNumber, `${oldStatus} → ${newStatus}`);
  
  try {
    if (!inquiry.userDetails?.email) {
      throw new Error('Customer email is missing');
    }

    // Send to customer - WITH FULL DETAILS
    const customerTemplate = getStatusUpdateCustomerTemplate(inquiry, oldStatus, newStatus);
    const customerResult = await transporter.sendMail({
      from: `"Asian Clothify" <${process.env.SMTP_USER}>`,
      to: inquiry.userDetails.email,
      subject: customerTemplate.subject,
      html: customerTemplate.html
    });
    console.log('✅ Customer status email sent:', customerResult.messageId);

    // Send to admin
    const adminTemplate = getStatusUpdateAdminTemplate(inquiry, inquiry.userDetails, oldStatus, newStatus);
    const adminResult = await transporter.sendMail({
      from: `"Asian Clothify System" <${process.env.SMTP_USER}>`,
      to: process.env.OWNER_EMAIL || process.env.SMTP_USER,
      subject: `📢 Status Update: ${inquiry.inquiryNumber} - ${oldStatus} → ${newStatus}`,
      html: adminTemplate.html
    });
    console.log('✅ Admin status email sent:', adminResult.messageId);

    return { success: true };
  } catch (error) {
    console.error('❌ Status update email error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendInquirySubmissionEmails,
  sendStatusUpdateEmail,
  sendInvoiceGeneratedEmail: async () => ({ success: true }), // Placeholder
  sendPaymentConfirmationEmail: async () => ({ success: true }), // Placeholder
  sendCustomEmail: async (to, subject, html) => {
    try {
      await transporter.sendMail({
        from: `"Asian Clothify" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};
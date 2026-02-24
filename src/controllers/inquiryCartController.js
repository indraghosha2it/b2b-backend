const InquiryCart = require('../models/InquiryCart');
const Inquiry = require('../models/Inquiry');
const Product = require('../models/Product');

// @desc    Get user's inquiry cart
// @route   GET /api/inquiry-cart
// @access  Private
// @desc    Get user's inquiry cart
// @route   GET /api/inquiry-cart
// @access  Private
const getCart = async (req, res) => {
  try {
    let cart = await InquiryCart.findOne({ userId: req.user.id });
    
    if (!cart) {
      cart = await InquiryCart.create({
        userId: req.user.id,
        items: []
      });
    }

    console.log(`Cart for user ${req.user.id} has ${cart.items.length} items`); // Debug log

    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching cart'
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/inquiry-cart/add
// @access  Private


// @desc    Add item to cart (groups all colors under one product)
// @route   POST /api/inquiry-cart/add
// @access  Private
// const addToCart = async (req, res) => {
//   try {
//     const { productId, productName, colors, totalQuantity, unitPrice, moq, productImage } = req.body;

//     console.log('📦 Add to cart request received:', { 
//       userId: req.user.id, 
//       productId, 
//       colorsCount: colors?.length, 
//       totalQuantity,
//       colorsData: JSON.stringify(colors)
//     });

//     // Get product details to verify
//     const product = await Product.findById(productId);
//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         error: 'Product not found'
//       });
//     }

//     // Validate quantity
//     if (totalQuantity <= 0) {
//       return res.status(400).json({
//         success: false,
//         error: 'Quantity must be greater than 0'
//       });
//     }

//     // Validate colors array
//     if (!colors || !Array.isArray(colors) || colors.length === 0) {
//       return res.status(400).json({
//         success: false,
//         error: 'At least one color with quantities is required'
//       });
//     }

//     // Find or create cart
//     let cart = await InquiryCart.findOne({ userId: req.user.id });
//     if (!cart) {
//       cart = new InquiryCart({ userId: req.user.id, items: [] });
//       console.log('🆕 Created new cart for user');
//     }

//     // Format colors data properly
//     const formattedColors = colors.map(colorItem => {
//       // Ensure color object exists with code
//       const colorObj = colorItem.color || {};
      
//       // Process size quantities - ensure it's an array
//       let sizeQuantitiesArray = [];
      
//       if (colorItem.sizeQuantities) {
//         if (Array.isArray(colorItem.sizeQuantities)) {
//           sizeQuantitiesArray = colorItem.sizeQuantities.map(sq => ({
//             size: sq.size || '',
//             quantity: parseInt(sq.quantity) || 0
//           }));
//         } else if (typeof colorItem.sizeQuantities === 'object') {
//           sizeQuantitiesArray = Object.entries(colorItem.sizeQuantities).map(([size, qty]) => ({
//             size: size,
//             quantity: parseInt(qty) || 0
//           }));
//         }
//       }
      
//       // Filter out entries with empty size
//       sizeQuantitiesArray = sizeQuantitiesArray.filter(sq => sq.size && sq.size.trim() !== '');
      
//       // Calculate total for this color
//       const colorTotal = colorItem.totalQuantity || 
//         sizeQuantitiesArray.reduce((sum, sq) => sum + (sq.quantity || 0), 0);

//       return {
//         color: {
//           code: colorObj.code || '#CCCCCC',
//           name: colorObj.name || colorObj.code || 'Unknown Color'
//         },
//         sizeQuantities: sizeQuantitiesArray,
//         totalQuantity: colorTotal,
//         totalForColor: colorTotal // Add this field to match your schema
//       };
//     }).filter(colorItem => colorItem.sizeQuantities.length > 0);

//     console.log('🎨 Formatted colors:', JSON.stringify(formattedColors, null, 2));

//     if (formattedColors.length === 0) {
//       return res.status(400).json({
//         success: false,
//         error: 'No valid colors with quantities provided'
//       });
//     }

//     // CRITICAL FIX: Check if product already exists in cart by productId ONLY
//     // Not by _id, because _id changes when creating new items
//     const existingItemIndex = cart.items.findIndex(item => 
//       item.productId.toString() === productId
//     );

//     console.log('🔍 Looking for existing product. Found at index:', existingItemIndex);

//     const newItem = {
//       productId,
//       productName: product.productName,
//       colors: formattedColors,
//       totalQuantity,
//       unitPrice,
//       moq,
//       productImage: productImage || (product.images && product.images.length > 0 ? product.images[0].url : null)
//     };

//     if (existingItemIndex > -1) {
//       // IMPORTANT: Get the existing item's _id to preserve it
//       const existingItemId = cart.items[existingItemIndex]._id;
      
//       // Update existing product item - replace colors completely but KEEP THE SAME _id
//       cart.items[existingItemIndex] = {
//         ...newItem,
//         _id: existingItemId // Preserve the original _id
//       };
      
//       console.log('🔄 Updated existing product at index', existingItemIndex, 'with ID:', existingItemId);
      
//       // Mark the colors path as modified
//       cart.markModified(`items.${existingItemIndex}.colors`);
//     } else {
//       // Add new product item
//       cart.items.push(newItem);
//       console.log('➕ Added new product, total items:', cart.items.length);
//     }

//     await cart.save();
//     console.log('✅ Cart saved successfully. Total products:', cart.items.length);
//     console.log('📊 Final items in cart:', cart.items.map(item => ({
//       id: item._id,
//       productId: item.productId,
//       colorsCount: item.colors?.length || 0,
//       totalQty: item.totalQuantity
//     })));

//     res.json({
//       success: true,
//       data: cart,
//       message: existingItemIndex > -1 ? 'Cart updated successfully' : 'Product added to cart successfully'
//     });
//   } catch (error) {
//     console.error('❌ Add to cart error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Error adding item to cart'
//     });
//   }
// };

// @desc    Add item to cart (groups all colors under one product)
// @route   POST /api/inquiry-cart/add
// @access  Private
const addToCart = async (req, res) => {
  try {
    const { productId, productName, colors, unitPrice, moq, productImage, specialInstructions } = req.body;

    console.log('📦 Add to cart request received:', { 
      userId: req.user.id, 
      productId, 
      colorsCount: colors?.length,
      specialInstructions, // Log this to debug
      colorsData: JSON.stringify(colors)
    });

    // Get product details to verify
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Validate colors array
    if (!colors || !Array.isArray(colors) || colors.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one color with quantities is required'
      });
    }

    // Find or create cart
    let cart = await InquiryCart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = new InquiryCart({ userId: req.user.id, items: [] });
      console.log('🆕 Created new cart for user');
    }

    // Format colors data properly and calculate totals
    let formattedColors = [];
    let calculatedTotalQuantity = 0;
    
    formattedColors = colors.map(colorItem => {
      // Ensure color object exists with code
      const colorObj = colorItem.color || {};
      
      // Process size quantities - ensure it's an array
      let sizeQuantitiesArray = [];
      
      if (colorItem.sizeQuantities) {
        if (Array.isArray(colorItem.sizeQuantities)) {
          sizeQuantitiesArray = colorItem.sizeQuantities.map(sq => ({
            size: sq.size || '',
            quantity: parseInt(sq.quantity) || 0
          }));
        } else if (typeof colorItem.sizeQuantities === 'object') {
          sizeQuantitiesArray = Object.entries(colorItem.sizeQuantities).map(([size, qty]) => ({
            size: size,
            quantity: parseInt(qty) || 0
          }));
        }
      }
      
      // Filter out entries with empty size
      sizeQuantitiesArray = sizeQuantitiesArray.filter(sq => sq.size && sq.size.trim() !== '');
      
      // Calculate total for this color
      const colorTotal = sizeQuantitiesArray.reduce((sum, sq) => sum + (sq.quantity || 0), 0);
      
      // Add to overall total
      calculatedTotalQuantity += colorTotal;

      return {
        color: {
          code: colorObj.code || '#CCCCCC',
          name: colorObj.name || colorObj.code || 'Unknown Color'
        },
        sizeQuantities: sizeQuantitiesArray,
        totalQuantity: colorTotal,
        totalForColor: colorTotal
      };
    }).filter(colorItem => colorItem.sizeQuantities.length > 0);

    console.log('🎨 Formatted colors:', JSON.stringify(formattedColors, null, 2));
    console.log('📊 Calculated total quantity:', calculatedTotalQuantity);

    if (formattedColors.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid colors with quantities provided'
      });
    }

    // Determine the correct unit price based on the calculated total quantity
    let updatedUnitPrice = unitPrice || product.pricePerUnit;
    
    // Check if product has bulk pricing tiers
    if (product.quantityBasedPricing && product.quantityBasedPricing.length > 0) {
      const sortedTiers = [...product.quantityBasedPricing].sort((a, b) => {
        const aMin = parseInt(a.range.split('-')[0] || a.range.replace('+', ''));
        const bMin = parseInt(b.range.split('-')[0] || b.range.replace('+', ''));
        return aMin - bMin;
      });
      
      // Find the applicable tier based on calculatedTotalQuantity
      for (const tier of sortedTiers) {
        const range = tier.range;
        if (range.includes('-')) {
          const [min, max] = range.split('-').map(Number);
          if (calculatedTotalQuantity >= min && calculatedTotalQuantity <= max) {
            updatedUnitPrice = tier.price;
            break;
          }
        } else if (range.includes('+')) {
          const minQty = parseInt(range.replace('+', ''));
          if (calculatedTotalQuantity >= minQty) {
            updatedUnitPrice = tier.price;
            break;
          }
        }
      }
    }

    // Check if product already exists in cart by productId ONLY
    const existingItemIndex = cart.items.findIndex(item => 
      item.productId.toString() === productId
    );

    console.log('🔍 Looking for existing product. Found at index:', existingItemIndex);

    const newItem = {
      productId,
      productName: product.productName,
      colors: formattedColors,
      totalQuantity: calculatedTotalQuantity, // Use calculated total, not received total
      unitPrice: updatedUnitPrice, // Use updated unit price based on bulk tier
      moq,
      productImage: productImage || (product.images && product.images.length > 0 ? product.images[0].url : null),
       specialInstructions: specialInstructions || '' // ADD THIS

    };

    if (existingItemIndex > -1) {
      // IMPORTANT: Get the existing item's _id to preserve it
      const existingItemId = cart.items[existingItemIndex]._id;
      
      // Update existing product item - replace colors completely but KEEP THE SAME _id
      cart.items[existingItemIndex] = {
        ...newItem,
        _id: existingItemId // Preserve the original _id
      };
      
      console.log('🔄 Updated existing product at index', existingItemIndex, 'with ID:', existingItemId);
      console.log('📊 New total quantity:', calculatedTotalQuantity);
      console.log('📊 New unit price:', updatedUnitPrice);
      
      // Mark the colors path as modified
      cart.markModified(`items.${existingItemIndex}.colors`);
    } else {
      // Add new product item
      cart.items.push(newItem);
      console.log('➕ Added new product, total items:', cart.items.length);
    }

    await cart.save();
    console.log('✅ Cart saved successfully. Total products:', cart.items.length);
    console.log('📊 Final items in cart:', cart.items.map(item => ({
      id: item._id,
      productId: item.productId,
      colorsCount: item.colors?.length || 0,
      totalQty: item.totalQuantity,
      unitPrice: item.unitPrice,
       specialInstructions: item.specialInstructions // Log this
    })));

    res.json({
      success: true,
      data: cart,
      message: existingItemIndex > -1 ? 'Cart updated successfully' : 'Product added to cart successfully'
    });
  } catch (error) {
    console.error('❌ Add to cart error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error adding item to cart'
    });
  }
};
// @desc    Update cart item
// @route   PUT /api/inquiry-cart/item/:itemId
// @access  Private
const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { sizeQuantities, totalQuantity } = req.body;

    const cart = await InquiryCart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      });
    }

    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Item not found in cart'
      });
    }

    // Update item
    if (sizeQuantities) cart.items[itemIndex].sizeQuantities = sizeQuantities;
    if (totalQuantity) cart.items[itemIndex].totalQuantity = totalQuantity;

    await cart.save();

    res.json({
      success: true,
      data: cart,
      message: 'Cart updated successfully'
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error updating cart'
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/inquiry-cart/item/:itemId
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await InquiryCart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      });
    }

    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    await cart.save();

    res.json({
      success: true,
      data: cart,
      message: 'Item removed from cart'
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error removing item'
    });
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/inquiry-cart/clear
// @access  Private
const clearCart = async (req, res) => {
  try {
    const cart = await InquiryCart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      });
    }

    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error clearing cart'
    });
  }
};

// @desc    Submit inquiry from cart
// @route   POST /api/inquiry-cart/submit
// @access  Private
const submitInquiry = async (req, res) => {
  try {
    const { specialInstructions, attachments } = req.body;

    // Get user's cart
    const cart = await InquiryCart.findOne({ userId: req.user.id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Cart is empty'
      });
    }

    // Get user details from req.user (set by auth middleware)
    const userDetails = {
      companyName: req.user.companyName,
      contactPerson: req.user.contactPerson,
      email: req.user.email,
      phone: req.user.phone,
      whatsapp: req.user.whatsapp,
      country: req.user.country,
      address: req.user.address,
      city: req.user.city,
      zipCode: req.user.zipCode
    };

    // Create inquiry
    const inquiry = await Inquiry.create({
      userId: req.user.id,
      userDetails,
      items: cart.items,
      specialInstructions: specialInstructions || '',
      attachments: attachments || [],
      totalItems: cart.totalItems,
      totalQuantity: cart.totalQuantity,
      subtotal: cart.estimatedTotal
    });

    // Clear the cart after successful submission
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      data: inquiry,
      message: 'Inquiry submitted successfully'
    });
  } catch (error) {
    console.error('Submit inquiry error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error submitting inquiry'
    });
  }
};

// @desc    Upload attachment for inquiry
// @route   POST /api/inquiry-cart/upload
// @access  Private
const uploadAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const attachment = {
      fileName: req.file.originalname,
      fileUrl: req.file.path,
      fileType: req.file.mimetype
    };

    res.json({
      success: true,
      data: attachment,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error uploading file'
    });
  }
};
// @desc    Remove a specific color from a cart item
// @route   DELETE /api/inquiry-cart/item/:itemId/color/:colorIndex
// @access  Private
// @desc    Remove a specific color from a cart item
// @route   DELETE /api/inquiry-cart/item/:itemId/color/:colorIndex
// @access  Private
// @desc    Remove a specific color from a cart item
// @route   DELETE /api/inquiry-cart/item/:itemId/color/:colorIndex
// @access  Private
const removeColorFromItem = async (req, res) => {
  try {
    const { itemId, colorIndex } = req.params;
    const index = parseInt(colorIndex);

    const cart = await InquiryCart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      });
    }

    // Find the item
    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Item not found in cart'
      });
    }

    const item = cart.items[itemIndex];
    
    // Check if color index is valid
    if (!item.colors || index < 0 || index >= item.colors.length) {
      return res.status(400).json({
        success: false,
        error: 'Invalid color index'
      });
    }

    // Remove the color at the specified index
    const removedColor = item.colors[index];
    item.colors.splice(index, 1);

    // Calculate total quantity for this item from remaining colors
    let newTotalQuantity = 0;
    if (item.colors.length > 0) {
      newTotalQuantity = item.colors.reduce((sum, color) => {
        // Calculate total for this color from its sizeQuantities
        const colorTotal = color.sizeQuantities.reduce(
          (colorSum, sq) => colorSum + (sq.quantity || 0), 
          0
        );
        return sum + colorTotal;
      }, 0);
      
      // Update each color's totalForColor field
      item.colors.forEach(color => {
        color.totalForColor = color.sizeQuantities.reduce(
          (sum, sq) => sum + (sq.quantity || 0), 
          0
        );
        color.totalQuantity = color.totalForColor;
      });
    }

    // Update item total quantity
    item.totalQuantity = newTotalQuantity;

    // Get product details to check bulk pricing
    const product = await Product.findById(item.productId);
    
    // Recalculate unit price based on new total quantity and bulk pricing tiers
    if (product && product.quantityBasedPricing && product.quantityBasedPricing.length > 0 && newTotalQuantity > 0) {
      const sortedTiers = [...product.quantityBasedPricing].sort((a, b) => {
        const aMin = parseInt(a.range.split('-')[0] || a.range.replace('+', ''));
        const bMin = parseInt(b.range.split('-')[0] || b.range.replace('+', ''));
        return aMin - bMin;
      });
      
      // Find the applicable tier based on newTotalQuantity
      for (const tier of sortedTiers) {
        const range = tier.range;
        if (range.includes('-')) {
          const [min, max] = range.split('-').map(Number);
          if (newTotalQuantity >= min && newTotalQuantity <= max) {
            item.unitPrice = tier.price;
            break;
          }
        } else if (range.includes('+')) {
          const minQty = parseInt(range.replace('+', ''));
          if (newTotalQuantity >= minQty) {
            item.unitPrice = tier.price;
            break;
          }
        }
      }
    }

    // If no colors left, remove the entire item
    if (item.colors.length === 0) {
      cart.items.splice(itemIndex, 1);
    }

    // Recalculate cart totals
    cart.totalItems = cart.items.length;
    cart.totalQuantity = cart.items.reduce((sum, item) => sum + (item.totalQuantity || 0), 0);
    cart.estimatedTotal = cart.items.reduce((sum, item) => {
      return sum + (item.totalQuantity * item.unitPrice);
    }, 0);

    await cart.save();

    console.log(`🗑️ Removed color ${removedColor.color?.code} from item ${itemId}`);
    console.log(`📊 New total quantity: ${newTotalQuantity}`);
    console.log(`💰 New unit price: ${item.unitPrice}`);

    res.json({
      success: true,
      data: cart,
      message: 'Color removed successfully'
    });
  } catch (error) {
    console.error('❌ Remove color error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error removing color'
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  submitInquiry,
  uploadAttachment,
  removeColorFromItem
};
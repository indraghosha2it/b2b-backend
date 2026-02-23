const InquiryCart = require('../models/InquiryCart');
const Inquiry = require('../models/Inquiry');
const Product = require('../models/Product');

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
const addToCart = async (req, res) => {
  try {
    const { productId, color, sizeQuantities, totalQuantity } = req.body;

    // Get product details
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Validate quantity meets MOQ
    if (totalQuantity < product.moq) {
      return res.status(400).json({
        success: false,
        error: `Minimum order quantity is ${product.moq} pieces`
      });
    }

    // Get unit price
    let unitPrice = product.pricePerUnit;

    // Find or create cart
    let cart = await InquiryCart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = new InquiryCart({ userId: req.user.id, items: [] });
    }

    // Check if item already exists with same product and color
    const existingItemIndex = cart.items.findIndex(item => 
      item.productId.toString() === productId && 
      item.color?.code === color?.code
    );

    const newItem = {
      productId,
      productName: product.productName,
      color,
      sizeQuantities,
      totalQuantity,
      unitPrice,
      moq: product.moq,
      productImage: product.images[0]?.url
    };

    if (existingItemIndex > -1) {
      // Update existing item
      cart.items[existingItemIndex] = newItem;
    } else {
      // Add new item
      cart.items.push(newItem);
    }

    await cart.save();

    res.json({
      success: true,
      data: cart,
      message: 'Item added to cart successfully'
    });
  } catch (error) {
    console.error('Add to cart error:', error);
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

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  submitInquiry,
  uploadAttachment
};
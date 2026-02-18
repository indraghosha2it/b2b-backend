const Product = require('../models/Product');
const Category = require('../models/Category');
const { cloudinary } = require('../config/cloudinary');


// @access  Private (Moderator/Admin)
const createProduct = async (req, res) => {
  try {
    console.log('Create product request received');
    console.log('Body:', req.body);
    console.log('Files:', req.files);

    const {
      productName,
      description,
      category,
      fabric,
      moq,
      pricePerUnit,
      quantityBasedPricing,
      sizes,
      colors
    } = req.body;

    // Validation
    if (!productName) {
      return res.status(400).json({
        success: false,
        error: 'Product name is required'
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        error: 'Category is required'
      });
    }

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category'
      });
    }

    // Check if at least one image is uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one product image is required'
      });
    }

    // Parse JSON fields
    let parsedQuantityPricing = [];
    let parsedSizes = [];
    let parsedColors = [];

    try {
      parsedQuantityPricing = typeof quantityBasedPricing === 'string' 
        ? JSON.parse(quantityBasedPricing) 
        : quantityBasedPricing;
      
      parsedSizes = typeof sizes === 'string' 
        ? JSON.parse(sizes) 
        : sizes;
      
      parsedColors = typeof colors === 'string' 
        ? JSON.parse(colors) 
        : colors;
    } catch (error) {
      console.error('Error parsing JSON fields:', error);
      return res.status(400).json({
        success: false,
        error: 'Invalid data format for sizes, colors, or pricing'
      });
    }

    // Validate sizes
    if (!parsedSizes || parsedSizes.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one size is required'
      });
    }

    // Validate colors
    if (!parsedColors || parsedColors.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one color is required'
      });
    }

    // Process images from Cloudinary
    const images = req.files.map((file, index) => ({
      url: file.path,
      publicId: file.filename,
      isPrimary: index === 0 // First image is primary
    }));

    // Determine approval status based on user role
    const isApproved = req.user.role === 'admin'; // Admin products auto-approved

    // Create product
    const product = await Product.create({
      productName,
      description: description || '',
      category,
      fabric,
      moq: parseInt(moq),
      pricePerUnit: parseFloat(pricePerUnit),
      quantityBasedPricing: parsedQuantityPricing,
      sizes: parsedSizes,
      colors: parsedColors,
      images,
      createdBy: req.user.id,
      isApproved,
      approvedBy: isApproved ? req.user.id : null,
      approvedAt: isApproved ? new Date() : null
    });

    // Populate references
    await product.populate([
      { path: 'category', select: 'name slug' },
      { path: 'createdBy', select: 'contactPerson email role' }
    ]);

    res.status(201).json({
      success: true,
      data: product,
      message: isApproved 
        ? 'Product created and approved successfully' 
        : 'Product created successfully. Waiting for admin approval.'
    });
  } catch (error) {
    console.error('Create product error:', error);
    
    // If there are uploaded files, delete them from Cloudinary
    if (req.files && req.files.length > 0) {
      try {
        for (const file of req.files) {
          await cloudinary.uploader.destroy(file.filename);
        }
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
      }
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while creating product'
    });
  }
};



// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      search, 
      minPrice, 
      maxPrice,
      fabric,
      sort = '-createdAt',
      includeInactive = false,
      includeUnapproved = false
    } = req.query;

    // Build query
    const query = {};
    
    // Only show active products to public
    if (!includeInactive) {
      query.isActive = true;
    }
    
    // Only show approved products to public
    if (!includeUnapproved) {
      query.isApproved = true;
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Search by text
    if (search) {
      query.$text = { $search: search };
    }

    // Filter by fabric
    if (fabric) {
      query.fabric = { $regex: fabric, $options: 'i' };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.pricePerUnit = {};
      if (minPrice) query.pricePerUnit.$gte = parseFloat(minPrice);
      if (maxPrice) query.pricePerUnit.$lte = parseFloat(maxPrice);
    }

    // Parse sort
    let sortOption = {};
    if (sort === 'price_asc') {
      sortOption = { pricePerUnit: 1 };
    } else if (sort === 'price_desc') {
      sortOption = { pricePerUnit: -1 };
    } else if (sort === 'name_asc') {
      sortOption = { productName: 1 };
    } else if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    } else {
      sortOption = { createdAt: -1 };
    }

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .populate('createdBy', 'contactPerson')
      .sort(sortOption)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching products'
    });
  }
};

// @desc    Get single product by ID or slug
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if id is MongoDB ObjectId or slug
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    
    let query = {};
    if (isObjectId) {
      query = { _id: id };
    } else {
      query = { slug: id };
    }

    const product = await Product.findOne(query)
      .populate('category', 'name slug')
      .populate('createdBy', 'contactPerson')
      .populate('approvedBy', 'contactPerson');

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Increment view count
    product.views += 1;
    await product.save();

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching product'
    });
  }
};


// @access  Private (Moderator/Admin)
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Check permissions
    // Admin can update any product, moderator can only update their own unapproved products
    if (req.user.role !== 'admin') {
      if (product.createdBy.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'You can only update your own products'
        });
      }
      
      if (product.isApproved) {
        return res.status(403).json({
          success: false,
          error: 'Approved products cannot be edited. Contact admin.'
        });
      }
    }

    const {
      productName,
      description,
      category,
      fabric,
      moq,
      pricePerUnit,
      quantityBasedPricing,
      sizes,
      colors
    } = req.body;

    // Update fields if provided
    if (productName) product.productName = productName;
    if (description !== undefined) product.description = description;
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          error: 'Invalid category'
        });
      }
      product.category = category;
    }
    if (fabric) product.fabric = fabric;
    if (moq) product.moq = parseInt(moq);
    if (pricePerUnit) product.pricePerUnit = parseFloat(pricePerUnit);

    // Parse and update JSON fields if provided
    if (quantityBasedPricing) {
      try {
        const parsed = typeof quantityBasedPricing === 'string' 
          ? JSON.parse(quantityBasedPricing) 
          : quantityBasedPricing;
        product.quantityBasedPricing = parsed;
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid quantity based pricing format'
        });
      }
    }

    if (sizes) {
      try {
        const parsed = typeof sizes === 'string' 
          ? JSON.parse(sizes) 
          : sizes;
        if (parsed.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'At least one size is required'
          });
        }
        product.sizes = parsed;
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid sizes format'
        });
      }
    }

    if (colors) {
      try {
        const parsed = typeof colors === 'string' 
          ? JSON.parse(colors) 
          : colors;
        if (parsed.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'At least one color is required'
          });
        }
        product.colors = parsed;
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid colors format'
        });
      }
    }

    // If admin updates a moderator's product, auto-approve it
    if (req.user.role === 'admin' && !product.isApproved) {
      product.isApproved = true;
      product.approvedBy = req.user.id;
      product.approvedAt = new Date();
    }

    // Handle new images if uploaded
    if (req.files && req.files.length > 0) {
      // Delete old images from Cloudinary
      for (const image of product.images) {
        if (image.publicId) {
          await cloudinary.uploader.destroy(image.publicId);
        }
      }

      // Add new images
      const newImages = req.files.map((file, index) => ({
        url: file.path,
        publicId: file.filename,
        isPrimary: index === 0
      }));
      
      product.images = newImages;
    }

    await product.save();
    await product.populate([
      { path: 'category', select: 'name slug' },
      { path: 'createdBy', select: 'contactPerson' }
    ]);

    res.json({
      success: true,
      data: product,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Update product error:', error);
    
    // If there are newly uploaded files, delete them
    if (req.files && req.files.length > 0) {
      try {
        for (const file of req.files) {
          await cloudinary.uploader.destroy(file.filename);
        }
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
      }
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while updating product'
    });
  }
};




// @access  Private (Admin only)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only admins can delete products'
      });
    }

    // Delete images from Cloudinary
    for (const image of product.images) {
      if (image.publicId) {
        await cloudinary.uploader.destroy(image.publicId);
      }
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while deleting product'
    });
  }
};



// @desc    Approve product (Admin only)
// @route   PUT /api/products/:id/approve
// @access  Private (Admin only)
const approveProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    if (product.isApproved) {
      return res.status(400).json({
        success: false,
        error: 'Product is already approved'
      });
    }

    product.isApproved = true;
    product.approvedBy = req.user.id;
    product.approvedAt = new Date();
    
    await product.save();

    res.json({
      success: true,
      data: product,
      message: 'Product approved successfully'
    });
  } catch (error) {
    console.error('Approve product error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while approving product'
    });
  }
};

// @desc    Toggle product active status
// @route   PUT /api/products/:id/toggle
// @access  Private (Admin only)
const toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    product.isActive = !product.isActive;
    await product.save();

    res.json({
      success: true,
      data: product,
      message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Toggle product error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while toggling product status'
    });
  }
};


// @desc    Get products by category
// @route   GET /api/products/category/:categoryId
// @access  Public
const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 12 } = req.query;

    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    const query = { 
      category: categoryId,
      isActive: true,
      isApproved: true 
    };

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .populate('createdBy', 'contactPerson')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: {
        category,
        products,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching products by category'
    });
  }
};

// Don't forget to export it
module.exports = {
  createProduct,
  getProducts,
  getProductById,
  getProductsByCategory, // Add this
  updateProduct,
  deleteProduct,
  approveProduct,
  toggleProductStatus
};


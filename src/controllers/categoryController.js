const Category = require('../models/Category');
const { cloudinary } = require('../config/cloudinary');

// @desc    Create new category
// @route   POST /api/categories
// @access  Private (Moderator/Admin)
const createCategory = async (req, res) => {
  try {
    console.log('Create category request:', req.body);
    console.log('File:', req.file);

    const { name, description } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Category name is required'
      });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });
    
    if (existingCategory) {
      // If there's an uploaded file, delete it from Cloudinary
      if (req.file) {
        await cloudinary.uploader.destroy(req.file.filename);
      }
      return res.status(400).json({
        success: false,
        error: 'Category with this name already exists'
      });
    }

    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Category image is required'
      });
    }

    // Create category
    const category = await Category.create({
      name,
      description: description || '',
      image: {
        url: req.file.path,
        publicId: req.file.filename
      },
      createdBy: req.user.id
    });

    // Populate createdBy info
    await category.populate('createdBy', 'contactPerson email');

    res.status(201).json({
      success: true,
      data: category,
      message: 'Category created successfully'
    });
  } catch (error) {
    console.error('Create category error:', error);
    
    // If there's an uploaded file, delete it from Cloudinary
    if (req.file) {
      try {
        await cloudinary.uploader.destroy(req.file.filename);
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
      }
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while creating category'
    });
  }
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = { isActive: true };

    // Search by name
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const categories = await Category.find(query)
      .populate('createdBy', 'contactPerson')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Category.countDocuments(query);

    res.json({
      success: true,
      data: categories,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching categories'
    });
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('createdBy', 'contactPerson email');

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching category'
    });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Moderator/Admin)
const updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Check if name is being changed and if it already exists
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          error: 'Category with this name already exists'
        });
      }
      category.name = name;
    }

    // Update description if provided
    if (description !== undefined) {
      category.description = description;
    }

    // Update image if new one uploaded
    if (req.file) {
      // Delete old image from Cloudinary
      if (category.image.publicId) {
        await cloudinary.uploader.destroy(category.image.publicId);
      }
      
      // Set new image
      category.image = {
        url: req.file.path,
        publicId: req.file.filename
      };
    }

    await category.save();
    await category.populate('createdBy', 'contactPerson email');

    res.json({
      success: true,
      data: category,
      message: 'Category updated successfully'
    });
  } catch (error) {
    console.error('Update category error:', error);
    
    // If there's an uploaded file, delete it from Cloudinary
    if (req.file) {
      await cloudinary.uploader.destroy(req.file.filename);
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while updating category'
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin only)
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Delete image from Cloudinary
    if (category.image.publicId) {
      await cloudinary.uploader.destroy(category.image.publicId);
    }

    await category.deleteOne();

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while deleting category'
    });
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
};
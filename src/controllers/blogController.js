// controllers/blogController.js
const Blog = require('../models/Blog');
const { cloudinary, extractPublicIdFromUrl } = require('../config/cloudinary');

// controllers/blogController.js - Update the createBlog function

// @desc    Create new blog post
// @route   POST /api/blogs
// @access  Private (Moderator/Admin)
const createBlog = async (req, res) => {
  try {
    console.log('Create blog request received');
    console.log('Body:', req.body);
    console.log('Files:', req.files);

    const {
      title,
      author,
      category,
      publishDate,
      excerpt,
      content,
      tags,
      featured,
      paragraphs,
      metaTitle,
      metaDescription,
      metaKeywords
    } = req.body;

    // Validation
    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Blog title is required'
      });
    }

    if (!author) {
      return res.status(400).json({
        success: false,
        error: 'Author name is required'
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        error: 'Category is required'
      });
    }

    if (!excerpt) {
      return res.status(400).json({
        success: false,
        error: 'Excerpt is required'
      });
    }

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Main content is required'
      });
    }

    // Check if featured image is uploaded
    if (!req.files || !req.files['featuredImage'] || req.files['featuredImage'].length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Featured image is required'
      });
    }

    // Parse JSON fields
    let parsedTags = [];
    let parsedParagraphs = [];

    try {
      if (tags) {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      }
      
      if (paragraphs) {
        parsedParagraphs = typeof paragraphs === 'string' ? JSON.parse(paragraphs) : paragraphs;
      }
    } catch (error) {
      console.error('Error parsing JSON fields:', error);
      return res.status(400).json({
        success: false,
        error: 'Invalid data format for tags or paragraphs'
      });
    }

    // Validate paragraphs
    if (parsedParagraphs && parsedParagraphs.length > 0) {
      for (const [index, para] of parsedParagraphs.entries()) {
        if (!para.header || !para.header.trim()) {
          return res.status(400).json({
            success: false,
            error: `Section ${index + 1}: Header is required`
          });
        }
        if (!para.description || !para.description.trim()) {
          return res.status(400).json({
            success: false,
            error: `Section ${index + 1}: Description is required`
          });
        }
      }
    }

    // Process featured image
    const featuredImageFile = req.files['featuredImage'][0];
    const featuredImage = {
      url: featuredImageFile.path,
      publicId: featuredImageFile.filename
    };

    // Process thumbnail images (if any)
    const thumbnailImages = [];
    if (req.files['thumbnailImages'] && req.files['thumbnailImages'].length > 0) {
      req.files['thumbnailImages'].forEach(file => {
        thumbnailImages.push({
          url: file.path,
          publicId: file.filename
        });
      });
    }

    // Process paragraph images (if any)
    const paragraphImages = [];
    if (req.files['paragraphImages'] && req.files['paragraphImages'].length > 0) {
      req.files['paragraphImages'].forEach(file => {
        paragraphImages.push(file.path);
      });
    }

    // Add image URLs to paragraphs
    const paragraphsWithImages = parsedParagraphs.map((paragraph, index) => ({
      header: paragraph.header,
      description: paragraph.description,
      image: paragraphImages[index] || null
    }));

    // Create blog post
    const blog = await Blog.create({
      title,
      author,
      category,
      publishDate: publishDate || new Date(),
      excerpt,
      content,
      tags: parsedTags,
      featured: featured === 'true' || featured === true,
      paragraphs: paragraphsWithImages,
      featuredImage: featuredImage.url,
      featuredImagePublicId: featuredImage.publicId,
      thumbnailImages,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || excerpt,
      metaKeywords: metaKeywords || '',
      createdBy: req.user.id,
      isActive: true
    });

    // Populate createdBy for response
    await blog.populate('createdBy', 'contactPerson email role');

    res.status(201).json({
      success: true,
      data: blog,
      message: 'Blog post created successfully'
    });
  } catch (error) {
    console.error('Create blog error:', error);
    
    // If there are uploaded files, delete them from Cloudinary
    if (req.files) {
      try {
        // Delete featured image
        if (req.files['featuredImage'] && req.files['featuredImage'][0]) {
          await cloudinary.uploader.destroy(req.files['featuredImage'][0].filename);
        }
        
        // Delete thumbnail images
        if (req.files['thumbnailImages']) {
          for (const file of req.files['thumbnailImages']) {
            await cloudinary.uploader.destroy(file.filename);
          }
        }
        
        // Delete paragraph images
        if (req.files['paragraphImages']) {
          for (const file of req.files['paragraphImages']) {
            await cloudinary.uploader.destroy(file.filename);
          }
        }
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
      }
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while creating blog post'
    });
  }
};

// @desc    Get all blog posts
// @route   GET /api/blogs
// @access  Public
const getBlogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      search, 
      featured,
      sort = '-publishDate'
    } = req.query;

    // Build query
    const query = { isActive: true }; // Only show active blogs to public

    // Filter by category
    if (category) {
      if (Array.isArray(category)) {
        query.category = { $in: category };
      } else {
        query.category = category;
      }
    }

    // Filter by featured
    if (featured === 'true') {
      query.featured = true;
    }

    // Search by text
    if (search) {
      query.$text = { $search: search };
    }

    // Parse sort
    let sortOption = {};
    if (sort === 'newest') {
      sortOption = { publishDate: -1 };
    } else if (sort === 'oldest') {
      sortOption = { publishDate: 1 };
    } else if (sort === 'popular') {
      sortOption = { views: -1 };
    } else {
      sortOption = { publishDate: -1 };
    }

    const blogs = await Blog.find(query)
      .populate('createdBy', 'contactPerson email role')
      .sort(sortOption)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Blog.countDocuments(query);

    res.json({
      success: true,
      data: blogs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching blogs'
    });
  }
};

// @desc    Get all blog posts (Admin/Moderator view - includes inactive)
// @route   GET /api/admin/blogs
// @access  Private (Moderator/Admin)
// const getAllBlogsAdmin = async (req, res) => {
//   try {
//     const { 
//       page = 1, 
//       limit = 20, 
//       category, 
//       search,
//       status,
//       sort = '-createdAt'
//     } = req.query;

//     // Build query
//     const query = {};

//     // Filter by category
//     if (category) {
//       query.category = category;
//     }

//     // Filter by status (active/inactive)
//     if (status === 'active') {
//       query.isActive = true;
//     } else if (status === 'inactive') {
//       query.isActive = false;
//     }

//     // Search by text
//     if (search) {
//       query.$text = { $search: search };
//     }

//     const blogs = await Blog.find(query)
//       .populate('createdBy', 'contactPerson email role')
//       .populate('updatedBy', 'contactPerson email role')
//       .sort(sort)
//       .limit(parseInt(limit))
//       .skip((parseInt(page) - 1) * parseInt(limit));

//     const total = await Blog.countDocuments(query);

//     res.json({
//       success: true,
//       data: blogs,
//       pagination: {
//         total,
//         page: parseInt(page),
//         pages: Math.ceil(total / parseInt(limit)),
//         limit: parseInt(limit)
//       }
//     });
//   } catch (error) {
//     console.error('Get admin blogs error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while fetching blogs'
//     });
//   }
// };

// @desc    Get all blog posts (Admin/Moderator view - includes inactive)
// @route   GET /api/admin/blogs
// @access  Private (Moderator/Admin)
const getAllBlogsAdmin = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      search,
      status,
      sort = '-createdAt'
    } = req.query;

    // Build query
    const query = {};

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by status (active/inactive)
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    // Search by text - FIXED VERSION
    if (search && search.trim()) {
      // Option 1: Using regex search (more flexible, doesn't require text index)
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { author: searchRegex },
        { excerpt: searchRegex },
        { content: searchRegex },
        { tags: { $in: [searchRegex] } }
      ];
      
      // Option 2: If you prefer text search (requires text index)
      // query.$text = { $search: search };
    }

    console.log('Blog search query:', { search, query }); // Debug log

    const blogs = await Blog.find(query)
      .populate('createdBy', 'contactPerson email role')
      .populate('updatedBy', 'contactPerson email role')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Blog.countDocuments(query);

    res.json({
      success: true,
      data: blogs,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Get admin blogs error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching blogs'
    });
  }
};

// @desc    Get single blog post by slug or ID
// @route   GET /api/blogs/:id
// @access  Public
const getBlogById = async (req, res) => {
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
    
    // Only show active blogs to public
    query.isActive = true;

    const blog = await Blog.findOne(query)
      .populate('createdBy', 'contactPerson email role');

    if (!blog) {
      return res.status(404).json({
        success: false,
        error: 'Blog post not found'
      });
    }

    // Increment view count
    blog.views += 1;
    await blog.save();

    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching blog'
    });
  }
};

// @desc    Get single blog post for editing (Admin/Moderator)
// @route   GET /api/admin/blogs/:id
// @access  Private (Moderator/Admin)
const getBlogForEdit = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('createdBy', 'contactPerson email role')
      .populate('updatedBy', 'contactPerson email role');

    if (!blog) {
      return res.status(404).json({
        success: false,
        error: 'Blog post not found'
      });
    }

    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error('Get blog for edit error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching blog'
    });
  }
};

// @desc    Update blog post
// @desc    Update blog post
// @route   PUT /api/admin/blogs/:id
// @access  Private (Moderator/Admin)
const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        error: 'Blog post not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to update blogs'
      });
    }

    const {
      title,
      author,
      category,
      publishDate,
      excerpt,
      content,
      tags,
      featured,
      paragraphs,
      metaTitle,
      metaDescription,
      metaKeywords,
      isActive,
      existingThumbnails // ✅ NEW: Receive existing thumbnails that should be kept
    } = req.body;

    // Update fields if provided
    if (title) blog.title = title;
    if (author) blog.author = author;
    if (category) blog.category = category;
    if (publishDate) blog.publishDate = publishDate;
    if (excerpt) blog.excerpt = excerpt;
    if (content) blog.content = content;
    if (featured !== undefined) blog.featured = featured === 'true' || featured === true;
    if (isActive !== undefined) blog.isActive = isActive === 'true' || isActive === true;
    if (metaTitle !== undefined) blog.metaTitle = metaTitle;
    if (metaDescription !== undefined) blog.metaDescription = metaDescription;
    if (metaKeywords !== undefined) blog.metaKeywords = metaKeywords;

    // Parse and update tags
    if (tags) {
      try {
        const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
        blog.tags = parsedTags;
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid tags format'
        });
      }
    }

    // Parse and update paragraphs
    if (paragraphs) {
      try {
        const parsedParagraphs = typeof paragraphs === 'string' ? JSON.parse(paragraphs) : paragraphs;
        
        // Validate paragraphs
        if (parsedParagraphs && parsedParagraphs.length > 0) {
          for (const [index, para] of parsedParagraphs.entries()) {
            if (!para.header || !para.header.trim()) {
              return res.status(400).json({
                success: false,
                error: `Section ${index + 1}: Header is required`
              });
            }
            if (!para.description || !para.description.trim()) {
              return res.status(400).json({
                success: false,
                error: `Section ${index + 1}: Description is required`
              });
            }
          }
        }
        
        // Handle paragraph images if new ones are uploaded
        if (req.files && req.files['paragraphImages'] && req.files['paragraphImages'].length > 0) {
          const paragraphImages = req.files['paragraphImages'].map(f => f.path);
          blog.paragraphs = parsedParagraphs.map((p, i) => ({
            ...p,
            image: paragraphImages[i] || p.image
          }));
        } else {
          blog.paragraphs = parsedParagraphs;
        }
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid paragraphs format'
        });
      }
    }

    // Handle new featured image
    if (req.files && req.files['featuredImage'] && req.files['featuredImage'][0]) {
      // Delete old featured image from Cloudinary
      if (blog.featuredImagePublicId) {
        await cloudinary.uploader.destroy(blog.featuredImagePublicId);
      }
      
      const newImage = req.files['featuredImage'][0];
      blog.featuredImage = newImage.path;
      blog.featuredImagePublicId = newImage.filename;
    }

    // ========== FIXED THUMBNAIL HANDLING ==========
    
    // Parse existing thumbnails that should be kept
   // In updateBlog controller, update the thumbnail handling section:

// Parse existing thumbnails that should be kept
let parsedExistingThumbnails = [];
if (existingThumbnails) {
  try {
    parsedExistingThumbnails = typeof existingThumbnails === 'string' 
      ? JSON.parse(existingThumbnails) 
      : existingThumbnails;
    
    // Ensure each thumbnail has the correct structure
    parsedExistingThumbnails = parsedExistingThumbnails.map(thumb => {
      if (typeof thumb === 'string') {
        // Convert string URL to object
        return {
          url: thumb,
          publicId: extractPublicIdFromUrl(thumb)
        };
      }
      return thumb;
    });
  } catch (error) {
    console.error('Error parsing existing thumbnails:', error);
    parsedExistingThumbnails = [];
  }
}

    // Find thumbnails that were removed
    const removedThumbnails = blog.thumbnailImages.filter(oldThumb => {
      return !parsedExistingThumbnails.some(newThumb => 
        (newThumb.url === oldThumb.url) || (newThumb === oldThumb.url)
      );
    });

    // Delete removed thumbnails from Cloudinary
    for (const thumb of removedThumbnails) {
      if (thumb.publicId) {
        await cloudinary.uploader.destroy(thumb.publicId);
      }
    }

    // Start with the existing thumbnails that were kept
    let updatedThumbnails = [...parsedExistingThumbnails];

    // Add new thumbnail images if uploaded
    if (req.files && req.files['thumbnailImages'] && req.files['thumbnailImages'].length > 0) {
      const newThumbnails = req.files['thumbnailImages'].map(file => ({
        url: file.path,
        publicId: file.filename
      }));
      
      // Append new thumbnails to the kept ones
      updatedThumbnails = [...updatedThumbnails, ...newThumbnails];
    }

    // Update blog with final thumbnail list
    blog.thumbnailImages = updatedThumbnails;

    blog.updatedBy = req.user.id;
    await blog.save();

    await blog.populate([
      { path: 'createdBy', select: 'contactPerson email role' },
      { path: 'updatedBy', select: 'contactPerson email role' }
    ]);

    res.json({
      success: true,
      data: blog,
      message: 'Blog post updated successfully'
    });
  } catch (error) {
    console.error('Update blog error:', error);
    
    // If there are newly uploaded files, delete them
    if (req.files) {
      try {
        if (req.files['featuredImage'] && req.files['featuredImage'][0]) {
          await cloudinary.uploader.destroy(req.files['featuredImage'][0].filename);
        }
        if (req.files['thumbnailImages']) {
          for (const file of req.files['thumbnailImages']) {
            await cloudinary.uploader.destroy(file.filename);
          }
        }
        if (req.files['paragraphImages']) {
          for (const file of req.files['paragraphImages']) {
            await cloudinary.uploader.destroy(file.filename);
          }
        }
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
      }
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while updating blog'
    });
  }
};

// @desc    Delete blog post
// @route   DELETE /api/admin/blogs/:id
// @access  Private (Admin only)
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        error: 'Blog post not found'
      });
    }

    // Check permissions - Admin only for delete
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only admins can delete blog posts'
      });
    }

    // Delete all images from Cloudinary
    // Delete featured image
    if (blog.featuredImagePublicId) {
      await cloudinary.uploader.destroy(blog.featuredImagePublicId);
    }

    // Delete thumbnail images
    for (const thumb of blog.thumbnailImages) {
      if (thumb.publicId) {
        await cloudinary.uploader.destroy(thumb.publicId);
      }
    }

    // Delete paragraph images
    for (const para of blog.paragraphs) {
      if (para.image) {
        const publicId = extractPublicIdFromUrl(para.image);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }
    }

    await blog.deleteOne();

    res.json({
      success: true,
      message: 'Blog post deleted successfully'
    });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while deleting blog'
    });
  }
};

// @desc    Toggle blog active status
// @route   PUT /api/admin/blogs/:id/toggle
// @access  Private (Admin only)
const toggleBlogStatus = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        error: 'Blog post not found'
      });
    }

    // Check permissions - Admin only
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only admins can toggle blog status'
      });
    }

    blog.isActive = !blog.isActive;
    blog.updatedBy = req.user.id;
    await blog.save();

    res.json({
      success: true,
      data: blog,
      message: `Blog ${blog.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Toggle blog error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while toggling blog status'
    });
  }
};

module.exports = {
  createBlog,
  getBlogs,
  getAllBlogsAdmin,
  getBlogById,
  getBlogForEdit,
  updateBlog,
  deleteBlog,
  toggleBlogStatus
};
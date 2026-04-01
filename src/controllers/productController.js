



const Product = require('../models/Product');
const Category = require('../models/Category');
const { cloudinary } = require('../config/cloudinary');



// @desc    Create new product
// @route   POST /api/products
// @access  Private (Moderator/Admin)
// const createProduct = async (req, res) => {
//   try {
//     console.log('Create product request received');
//     console.log('Body:', req.body);
//     console.log('Files:', req.files);

//     const {
//       productName,
//       description,
//       category,
//       targetedCustomer,
//       fabric,
//       moq,
//       pricePerUnit,
//       quantityBasedPricing,
//       sizes,
//       colors,
//       additionalInfo // New field
//     } = req.body;

//     console.log('Targeted customer received:', targetedCustomer);
//     console.log('Additional info received:', additionalInfo);

//     // Validation
//     if (!productName) {
//       return res.status(400).json({
//         success: false,
//         error: 'Product name is required'
//       });
//     }

//     if (!category) {
//       return res.status(400).json({
//         success: false,
//         error: 'Category is required'
//       });
//     }

//     // Check if category exists
//     const categoryExists = await Category.findById(category);
//     if (!categoryExists) {
//       return res.status(400).json({
//         success: false,
//         error: 'Invalid category'
//       });
//     }

//     // Check if at least one image is uploaded
//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({
//         success: false,
//         error: 'At least one product image is required'
//       });
//     }

//     // Parse JSON fields
//     let parsedQuantityPricing = [];
//     let parsedSizes = [];
//     let parsedColors = [];
//     let parsedAdditionalInfo = []; // New parsed field

//     try {
//       parsedQuantityPricing = typeof quantityBasedPricing === 'string' 
//         ? JSON.parse(quantityBasedPricing) 
//         : quantityBasedPricing;
      
//       parsedSizes = typeof sizes === 'string' 
//         ? JSON.parse(sizes) 
//         : sizes;
      
//       parsedColors = typeof colors === 'string' 
//         ? JSON.parse(colors) 
//         : colors;
      
//       // Parse additional info if provided
//       if (additionalInfo) {
//         parsedAdditionalInfo = typeof additionalInfo === 'string' 
//           ? JSON.parse(additionalInfo) 
//           : additionalInfo;
//       }
//     } catch (error) {
//       console.error('Error parsing JSON fields:', error);
//       return res.status(400).json({
//         success: false,
//         error: 'Invalid data format for sizes, colors, pricing, or additional info'
//       });
//     }

//     // Validate sizes
//     if (!parsedSizes || parsedSizes.length === 0) {
//       return res.status(400).json({
//         success: false,
//         error: 'At least one size is required'
//       });
//     }

//     // Validate colors
//     if (!parsedColors || parsedColors.length === 0) {
//       return res.status(400).json({
//         success: false,
//         error: 'At least one color is required'
//       });
//     }

//     // Validate additional info (optional, but validate if provided)
//     if (parsedAdditionalInfo && parsedAdditionalInfo.length > 0) {
//       for (const info of parsedAdditionalInfo) {
//         if (!info.fieldName || !info.fieldName.trim()) {
//           return res.status(400).json({
//             success: false,
//             error: 'Field name is required for additional information'
//           });
//         }
//         if (!info.fieldValue || !info.fieldValue.trim()) {
//           return res.status(400).json({
//             success: false,
//             error: 'Field value is required for additional information'
//           });
//         }
//       }
//     }

//     // Process images from Cloudinary
//     const images = req.files.map((file, index) => ({
//       url: file.path,
//       publicId: file.filename,
//       isPrimary: index === 0 // First image is primary
//     }));

//     // Create product in Product collection with additionalInfo
//     const product = await Product.create({
//       productName,
//       description: description || '',
//       category,
//       targetedCustomer: targetedCustomer || 'unisex',
//       fabric,
//       moq: parseInt(moq),
//       pricePerUnit: parseFloat(pricePerUnit),
//       quantityBasedPricing: parsedQuantityPricing,
//       sizes: parsedSizes,
//       colors: parsedColors,
//       additionalInfo: parsedAdditionalInfo, // New field
//       images,
//       createdBy: req.user.id,
//       isActive: true // Set active by default
//     });

//     // Prepare embedded product data for category
//     const embeddedProduct = {
//       productId: product._id,
//       productName: product.productName,
//       slug: product.slug,
//       description: product.description,
//       targetedCustomer: product.targetedCustomer,
//       fabric: product.fabric,
//       images: product.images,
//       sizes: product.sizes,
//       colors: product.colors,
//       moq: product.moq,
//       pricePerUnit: product.pricePerUnit,
//       quantityBasedPricing: product.quantityBasedPricing,
//       additionalInfo: product.additionalInfo, // Include in embedded product
//       isActive: product.isActive,
//       createdBy: product.createdBy,
//       createdAt: product.createdAt
//     };

//     // Add product to category's products array
//     await Category.findByIdAndUpdate(
//       category,
//       {
//         $push: { products: embeddedProduct },
//         $inc: { productCount: 1 }
//       },
//       { new: true }
//     );

//     // Populate references for response
//     await product.populate([
//       { path: 'category', select: 'name slug' },
//       { path: 'createdBy', select: 'contactPerson email role' }
//     ]);

//     res.status(201).json({
//       success: true,
//       data: product,
//       message: 'Product created successfully'
//     });
//   } catch (error) {
//     console.error('Create product error:', error);
    
//     // If there are uploaded files, delete them from Cloudinary
//     if (req.files && req.files.length > 0) {
//       try {
//         for (const file of req.files) {
//           await cloudinary.uploader.destroy(file.filename);
//         }
//       } catch (cloudinaryError) {
//         console.error('Error deleting from Cloudinary:', cloudinaryError);
//       }
//     }
    
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while creating product'
//     });
//   }
// };
// @desc    Create new product - UPDATE THIS
// @route   POST /api/products
// @access  Private (Moderator/Admin)
// const createProduct = async (req, res) => {
//   try {
//     console.log('Create product request received');
//     console.log('Body:', req.body);
//     console.log('Files:', req.files);

//     const {
//       productName,
//       description,
//        instruction,
//       category,
//       targetedCustomer,
//       fabric,
//       moq,
//       pricePerUnit,
//       quantityBasedPricing,
//       sizes,
//       colors,
//       additionalInfo,
//       // NEW FIELDS
//       isFeatured,
//       tags,
//       metaSettings
//     } = req.body;
// console.log('Instruction received:', instruction); 

//     // Validation
//     if (!productName) {
//       return res.status(400).json({
//         success: false,
//         error: 'Product name is required'
//       });
//     }

//     if (!category) {
//       return res.status(400).json({
//         success: false,
//         error: 'Category is required'
//       });
//     }

//     // Check if category exists
//     const categoryExists = await Category.findById(category);
//     if (!categoryExists) {
//       return res.status(400).json({
//         success: false,
//         error: 'Invalid category'
//       });
//     }

//     // Check if at least one image is uploaded
//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({
//         success: false,
//         error: 'At least one product image is required'
//       });
//     }

//     // Parse JSON fields
//     let parsedQuantityPricing = [];
//     let parsedSizes = [];
//     let parsedColors = [];
//     let parsedAdditionalInfo = [];
//     let parsedTags = [];
//     let parsedMetaSettings = {};

//     try {
//       parsedQuantityPricing = typeof quantityBasedPricing === 'string' 
//         ? JSON.parse(quantityBasedPricing) 
//         : quantityBasedPricing;
      
//       parsedSizes = typeof sizes === 'string' 
//         ? JSON.parse(sizes) 
//         : sizes;
      
//       parsedColors = typeof colors === 'string' 
//         ? JSON.parse(colors) 
//         : colors;
      
//       if (additionalInfo) {
//         parsedAdditionalInfo = typeof additionalInfo === 'string' 
//           ? JSON.parse(additionalInfo) 
//           : additionalInfo;
//       }

//       // Parse new fields
//       if (tags) {
//         parsedTags = typeof tags === 'string' 
//           ? JSON.parse(tags) 
//           : tags;
//       }

//       if (metaSettings) {
//         parsedMetaSettings = typeof metaSettings === 'string' 
//           ? JSON.parse(metaSettings) 
//           : metaSettings;
//       }
//     } catch (error) {
//       console.error('Error parsing JSON fields:', error);
//       return res.status(400).json({
//         success: false,
//         error: 'Invalid data format for sizes, colors, pricing, tags, or meta settings'
//       });
//     }

//     // Validate sizes
//     if (!parsedSizes || parsedSizes.length === 0) {
//       return res.status(400).json({
//         success: false,
//         error: 'At least one size is required'
//       });
//     }

//     // Validate colors
//     if (!parsedColors || parsedColors.length === 0) {
//       return res.status(400).json({
//         success: false,
//         error: 'At least one color is required'
//       });
//     }

//     // Validate tags if provided
//     if (parsedTags && parsedTags.length > 0) {
//       const validTags = [
//         'Top Ranking', 'New Arrival', 'Top Deal', 'Best Seller',
//         'Summer Collection', 'Winter Collection', 'Limited Edition', 'Trending'
//       ];
      
//       for (const tag of parsedTags) {
//         if (!validTags.includes(tag)) {
//           return res.status(400).json({
//             success: false,
//             error: `Invalid tag: ${tag}`
//           });
//         }
//       }
//     }

//     // Validate meta title length
//     if (parsedMetaSettings.metaTitle && parsedMetaSettings.metaTitle.length > 70) {
//       return res.status(400).json({
//         success: false,
//         error: 'Meta title should not exceed 70 characters'
//       });
//     }

//     // Validate meta description length
//     if (parsedMetaSettings.metaDescription && parsedMetaSettings.metaDescription.length > 160) {
//       return res.status(400).json({
//         success: false,
//         error: 'Meta description should not exceed 160 characters'
//       });
//     }

//     // Process images from Cloudinary
//     const images = req.files.map((file, index) => ({
//       url: file.path,
//       publicId: file.filename,
//       isPrimary: index === 0
//     }));

//     // Create product with all fields
//     const product = await Product.create({
//       productName,
//       description: description || '',
//         instruction: instruction || '',
//       category,
//       targetedCustomer: targetedCustomer || 'unisex',
//       fabric,
//       moq: parseInt(moq),
//       pricePerUnit: parseFloat(pricePerUnit),
//       quantityBasedPricing: parsedQuantityPricing,
//       sizes: parsedSizes,
//       colors: parsedColors,
//       additionalInfo: parsedAdditionalInfo,
//       // New fields
//       isFeatured: isFeatured === 'true' || isFeatured === true,
//       tags: parsedTags,
//       metaSettings: parsedMetaSettings,
//       images,
//       createdBy: req.user.id,
//       isActive: true
//     });

//     // Prepare embedded product data for category
//     const embeddedProduct = {
//       productId: product._id,
//       productName: product.productName,
//       slug: product.slug,
//       description: product.description,
//       instruction: product.instruction,
//       targetedCustomer: product.targetedCustomer,
//       fabric: product.fabric,
//       images: product.images,
//       sizes: product.sizes,
//       colors: product.colors,
//       moq: product.moq,
//       pricePerUnit: product.pricePerUnit,
//       quantityBasedPricing: product.quantityBasedPricing,
//       additionalInfo: product.additionalInfo,
//       isFeatured: product.isFeatured, // NEW
//       tags: product.tags, // NEW
//       isActive: product.isActive,
//       createdBy: product.createdBy,
//       createdAt: product.createdAt
//     };

//     // Add product to category's products array
//     await Category.findByIdAndUpdate(
//       category,
//       {
//         $push: { products: embeddedProduct },
//         $inc: { productCount: 1 }
//       },
//       { new: true }
//     );

//     // Populate references for response
//     await product.populate([
//       { path: 'category', select: 'name slug' },
//       { path: 'createdBy', select: 'contactPerson email role' }
//     ]);

//     res.status(201).json({
//       success: true,
//       data: product,
//       message: 'Product created successfully'
//     });
//   } catch (error) {
//     console.error('Create product error:', error);
    
//     // If there are uploaded files, delete them from Cloudinary
//     if (req.files && req.files.length > 0) {
//       try {
//         for (const file of req.files) {
//           await cloudinary.uploader.destroy(file.filename);
//         }
//       } catch (cloudinaryError) {
//         console.error('Error deleting from Cloudinary:', cloudinaryError);
//       }
//     }
    
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while creating product'
//     });
//   }
// };



// @desc    Create new product - MODIFIED to accept JSON with image URLs
// @route   POST /api/products
// @access  Private (Moderator/Admin)
// controllers/productController.js

const createProduct = async (req, res) => {
  try {
    console.log('Create product request received');
    console.log('Body:', req.body);

    const {
      productName,
      description,
      instruction,
      category,
      targetedCustomer,
      fabric,
      moq,
      pricePerUnit,
      quantityBasedPricing,
      sizes,
      colors,
      additionalInfo,
      isFeatured,
      tags,
      metaSettings,
      images // This is now an array of image URLs from Cloudinary
    } = req.body;

    console.log('Images received:', images);
    console.log('Images array length:', images?.length);

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

    // CRITICAL: Check if at least one image URL is provided
    if (!images || !Array.isArray(images) || images.length === 0) {
      console.log('No images provided. Images:', images);
      return res.status(400).json({
        success: false,
        error: 'At least one product image is required'
      });
    }

    // Validate image URLs
    if (!Array.isArray(images) || images.some(img => typeof img !== 'string')) {
      return res.status(400).json({
        success: false,
        error: 'Images must be an array of valid URLs'
      });
    }

    // Parse JSON fields (if they come as strings)
    let parsedQuantityPricing = [];
    let parsedSizes = [];
    let parsedColors = [];
    let parsedAdditionalInfo = [];
    let parsedTags = [];
    let parsedMetaSettings = {};

    try {
      parsedQuantityPricing = typeof quantityBasedPricing === 'string' 
        ? JSON.parse(quantityBasedPricing) 
        : quantityBasedPricing || [];
      
      parsedSizes = typeof sizes === 'string' 
        ? JSON.parse(sizes) 
        : sizes || [];
      
      parsedColors = typeof colors === 'string' 
        ? JSON.parse(colors) 
        : colors || [];
      
      if (additionalInfo) {
        parsedAdditionalInfo = typeof additionalInfo === 'string' 
          ? JSON.parse(additionalInfo) 
          : additionalInfo;
      }

      if (tags) {
        parsedTags = typeof tags === 'string' 
          ? JSON.parse(tags) 
          : tags || [];
      }

      if (metaSettings) {
        parsedMetaSettings = typeof metaSettings === 'string' 
          ? JSON.parse(metaSettings) 
          : metaSettings || {};
      }
    } catch (error) {
      console.error('Error parsing JSON fields:', error);
      return res.status(400).json({
        success: false,
        error: 'Invalid data format for sizes, colors, pricing, tags, or meta settings'
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

    // Process images - Convert URLs to the format expected by the schema
    const processedImages = images.map((url, index) => ({
      url: url,
      publicId: extractPublicIdFromUrl(url),
      isPrimary: index === 0
    }));

    console.log('Processed images:', processedImages);

    // Create product with all fields
    const product = await Product.create({
      productName,
      description: description || '',
      instruction: instruction || '',
      category,
      targetedCustomer: targetedCustomer || 'unisex',
      fabric,
      moq: parseInt(moq) || 100,
      pricePerUnit: parseFloat(pricePerUnit) || 0,
      quantityBasedPricing: parsedQuantityPricing,
      sizes: parsedSizes,
      colors: parsedColors,
      additionalInfo: parsedAdditionalInfo,
      isFeatured: isFeatured === true || isFeatured === 'true',
      tags: parsedTags,
      metaSettings: parsedMetaSettings,
      images: processedImages,
      createdBy: req.user.id,
      isActive: true
    });

    // Prepare embedded product data for category
    const embeddedProduct = {
      productId: product._id,
      productName: product.productName,
      slug: product.slug,
      description: product.description,
      instruction: product.instruction,
      targetedCustomer: product.targetedCustomer,
      fabric: product.fabric,
      images: product.images,
      sizes: product.sizes,
      colors: product.colors,
      moq: product.moq,
      pricePerUnit: product.pricePerUnit,
      quantityBasedPricing: product.quantityBasedPricing,
      additionalInfo: product.additionalInfo,
      isFeatured: product.isFeatured,
      tags: product.tags,
      isActive: product.isActive,
      createdBy: product.createdBy,
      createdAt: product.createdAt
    };

    // Add product to category's products array
    await Category.findByIdAndUpdate(
      category,
      {
        $push: { products: embeddedProduct },
        $inc: { productCount: 1 }
      },
      { new: true }
    );

    // Populate references for response
    await product.populate([
      { path: 'category', select: 'name slug' },
      { path: 'createdBy', select: 'contactPerson email role' }
    ]);

    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while creating product'
    });
  }
};

// Helper function to extract public ID from Cloudinary URL
const extractPublicIdFromUrl = (url) => {
  if (!url) return null;
  
  try {
    // Extract public_id from Cloudinary URL
    // Example URL: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/b2b-products/abc123.jpg
    const parts = url.split('/');
    const uploadIndex = parts.findIndex(part => part === 'upload');
    if (uploadIndex !== -1 && uploadIndex + 2 < parts.length) {
      // Skip the version part (v1234567890)
      const publicIdWithExt = parts.slice(uploadIndex + 2).join('/');
      // Remove file extension
      const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.'));
      return publicId;
    }
  } catch (error) {
    console.error('Error extracting public ID from URL:', error);
  }
  
  return null;
};



// @desc    Update product - MODIFIED to accept JSON with image URLs
// @route   PUT /api/products/:id
// @access  Private (Moderator/Admin) fix one
// const updateProduct = async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id);

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         error: 'Product not found'
//       });
//     }

//     // Check permissions
//     if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
//       return res.status(403).json({
//         success: false,
//         error: 'You do not have permission to update products'
//       });
//     }

//     const {
//       productName,
//       description,
//       instruction,
//       category,
//       targetedCustomer,
//       fabric,
//       moq,
//       pricePerUnit,
//       quantityBasedPricing,
//       sizes,
//       colors,
//       additionalInfo,
//       isFeatured,
//       tags,
//       metaSettings,
//       images // Array of image URLs
//     } = req.body;

//     const oldCategory = product.category.toString();
//     const newCategory = category || oldCategory;

//     // Check if category is being changed
//     if (category && category !== oldCategory) {
//       const categoryExists = await Category.findById(category);
//       if (!categoryExists) {
//         return res.status(400).json({
//           success: false,
//           error: 'Invalid category'
//         });
//       }
//     }

//     // Update basic fields
//     if (productName) product.productName = productName;
//     if (description !== undefined) product.description = description;
//     if (instruction !== undefined) product.instruction = instruction;
//     if (category) product.category = category;
//     if (targetedCustomer) product.targetedCustomer = targetedCustomer;
//     if (fabric) product.fabric = fabric;
//     if (moq) product.moq = parseInt(moq);
//     if (pricePerUnit) product.pricePerUnit = parseFloat(pricePerUnit);

//     // Update new fields
//     if (isFeatured !== undefined) {
//       product.isFeatured = isFeatured === 'true' || isFeatured === true;
//     }

//     // Parse and update quantity based pricing
//     if (quantityBasedPricing) {
//       try {
//         const parsed = typeof quantityBasedPricing === 'string' 
//           ? JSON.parse(quantityBasedPricing) 
//           : quantityBasedPricing;
//         product.quantityBasedPricing = parsed;
//       } catch (error) {
//         return res.status(400).json({
//           success: false,
//           error: 'Invalid quantity based pricing format'
//         });
//       }
//     }

//     // Parse and update sizes
//     if (sizes) {
//       try {
//         const parsed = typeof sizes === 'string' 
//           ? JSON.parse(sizes) 
//           : sizes;
//         if (parsed.length === 0) {
//           return res.status(400).json({
//             success: false,
//             error: 'At least one size is required'
//           });
//         }
//         product.sizes = parsed;
//       } catch (error) {
//         return res.status(400).json({
//           success: false,
//           error: 'Invalid sizes format'
//         });
//       }
//     }

//     // Parse and update colors
//     if (colors) {
//       try {
//         const parsed = typeof colors === 'string' 
//           ? JSON.parse(colors) 
//           : colors;
//         if (parsed.length === 0) {
//           return res.status(400).json({
//             success: false,
//             error: 'At least one color is required'
//           });
//         }
//         product.colors = parsed;
//       } catch (error) {
//         return res.status(400).json({
//           success: false,
//           error: 'Invalid colors format'
//         });
//       }
//     }

//     // Parse and update additional info
//     if (additionalInfo) {
//       try {
//         const parsed = typeof additionalInfo === 'string' 
//           ? JSON.parse(additionalInfo) 
//           : additionalInfo;
        
//         if (parsed && parsed.length > 0) {
//           for (const info of parsed) {
//             if (!info.fieldName || !info.fieldName.trim()) {
//               return res.status(400).json({
//                 success: false,
//                 error: 'Field name is required for additional information'
//               });
//             }
//             if (!info.fieldValue || !info.fieldValue.trim()) {
//               return res.status(400).json({
//                 success: false,
//                 error: 'Field value is required for additional information'
//               });
//             }
//           }
//         }
        
//         product.additionalInfo = parsed;
//       } catch (error) {
//         return res.status(400).json({
//           success: false,
//           error: 'Invalid additional info format'
//         });
//       }
//     }

//     // Parse and update tags
//     if (tags) {
//       try {
//         const parsed = typeof tags === 'string' 
//           ? JSON.parse(tags) 
//           : tags;
        
//         if (parsed && parsed.length > 0) {
//           const validTags = [
//             'Top Ranking', 'New Arrival', 'Top Deal', 'Best Seller',
//             'Summer Collection', 'Winter Collection', 'Limited Edition', 'Trending'
//           ];
          
//           for (const tag of parsed) {
//             if (!validTags.includes(tag)) {
//               return res.status(400).json({
//                 success: false,
//                 error: `Invalid tag: ${tag}`
//               });
//             }
//           }
//         }
        
//         product.tags = parsed;
//       } catch (error) {
//         return res.status(400).json({
//           success: false,
//           error: 'Invalid tags format'
//         });
//       }
//     }

//     // Parse and update meta settings
//     if (metaSettings) {
//       try {
//         const parsed = typeof metaSettings === 'string' 
//           ? JSON.parse(metaSettings) 
//           : metaSettings;
        
//         if (parsed.metaTitle && parsed.metaTitle.length > 70) {
//           return res.status(400).json({
//             success: false,
//             error: 'Meta title should not exceed 70 characters'
//           });
//         }

//         if (parsed.metaDescription && parsed.metaDescription.length > 160) {
//           return res.status(400).json({
//             success: false,
//             error: 'Meta description should not exceed 160 characters'
//           });
//         }

//         product.metaSettings = {
//           ...product.metaSettings,
//           ...parsed
//         };
//       } catch (error) {
//         return res.status(400).json({
//           success: false,
//           error: 'Invalid meta settings format'
//         });
//       }
//     }

//     // Update images if provided
//     if (images && Array.isArray(images) && images.length > 0) {
//       // Delete old images from Cloudinary
//       for (const image of product.images) {
//         if (image.publicId) {
//           try {
//             await cloudinary.uploader.destroy(image.publicId);
//           } catch (cloudinaryError) {
//             console.error('Error deleting image from Cloudinary:', cloudinaryError);
//           }
//         }
//       }

//       // Process new images
//       const processedImages = images.map((url, index) => ({
//         url: url,
//         publicId: extractPublicIdFromUrl(url),
//         isPrimary: index === 0
//       }));
      
//       product.images = processedImages;
//     }

//     await product.save();

//     // Prepare update data for embedded product in category
//     const updateData = {
//       productName: product.productName,
//       description: product.description,
//       instruction: product.instruction,
//       targetedCustomer: product.targetedCustomer,
//       fabric: product.fabric,
//       sizes: product.sizes,
//       colors: product.colors,
//       moq: product.moq,
//       pricePerUnit: product.pricePerUnit,
//       quantityBasedPricing: product.quantityBasedPricing,
//       additionalInfo: product.additionalInfo || [],
//       images: product.images,
//       isActive: product.isActive,
//       isFeatured: product.isFeatured,
//       tags: product.tags,
//       updatedAt: new Date()
//     };

//     // If category changed, remove from old and add to new
//     if (category && category !== oldCategory) {
//       await removeEmbeddedProductFromCategory(oldCategory, product._id);
      
//       const embeddedProduct = {
//         productId: product._id,
//         ...updateData,
//         createdBy: product.createdBy,
//         createdAt: product.createdAt
//       };
      
//       await Category.findByIdAndUpdate(
//         newCategory,
//         {
//           $push: { products: embeddedProduct },
//           $inc: { productCount: 1 }
//         }
//       );
//     } else {
//       await updateEmbeddedProductInCategory(newCategory, product._id, updateData);
//     }

//     await product.populate([
//       { path: 'category', select: 'name slug' },
//       { path: 'createdBy', select: 'contactPerson' }
//     ]);

//     res.json({
//       success: true,
//       data: product,
//       message: 'Product updated successfully'
//     });
//   } catch (error) {
//     console.error('Update product error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while updating product'
//     });
//   }
// };

// Keep all other functions (getProducts, getProductById, deleteProduct, etc.) exactly as they are
// They don't need to be modified







// @desc    Get all products - FIXED with proper partial search
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
      targetedCustomer,
      isFeatured,
      tags,
      isActive,
      sort = '-createdAt',
      includeInactive = false
    } = req.query;

    // Build query
    const query = {};
    
    // Handle active/inactive filtering
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    } 
    else if (!includeInactive) {
      query.isActive = true;
    }

    // Filter by featured
    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured === 'true';
    }

    // Filter by tags
    if (tags) {
      if (Array.isArray(tags)) {
        query.tags = { $in: tags };
      } else {
        query.tags = tags;
      }
    }

    // Filter by category
    if (category) {
      if (Array.isArray(category)) {
        query.category = { $in: category };
      } else {
        query.category = category;
      }
    }

    // Filter by targetedCustomer
    if (targetedCustomer) {
      if (Array.isArray(targetedCustomer)) {
        query.targetedCustomer = { $in: targetedCustomer };
      } else {
        query.targetedCustomer = targetedCustomer;
      }
    }

    // FIXED: Search with partial matching using regex
    if (search && search.trim() !== '') {
      const searchTerm = search.trim();
      // Create a regex pattern that matches the search term anywhere in the string
      // Case insensitive and escapes special regex characters
      const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedSearchTerm, 'i');
      
      query.$or = [
        { productName: regex },
        { fabric: regex },
        { description: regex }
      ];
    }

    // Filter by fabric (if not already in search)
    if (fabric && !search) {
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
    let useCollation = false;
    
    if (sort === 'price_asc') {
      sortOption = { pricePerUnit: 1 };
    } else if (sort === 'price_desc') {
      sortOption = { pricePerUnit: -1 };
    } else if (sort === 'name_asc') {
      sortOption = { productName: 1 };
      useCollation = true;
    } else if (sort === 'featured') {
      sortOption = { isFeatured: -1, createdAt: -1 };
    } else if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    } else {
      sortOption = { createdAt: -1 };
    }

    console.log('Search query:', search); // Debug log
    console.log('MongoDB query:', JSON.stringify(query)); // Debug log

    // Build the query
    let productsQuery = Product.find(query)
      .populate('category', 'name slug')
      .populate('createdBy', 'contactPerson');

    // Apply case-insensitive collation for name sorting
    if (useCollation) {
      productsQuery = productsQuery.collation({ locale: 'en', strength: 2 });
    }

    // Apply sort and pagination
    const products = await productsQuery
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
      .populate('createdBy', 'companyName contactPerson email role'); // Added more fields

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


// Helper function to update embedded product in category - UPDATE THIS
const updateEmbeddedProductInCategory = async (categoryId, productId, updateData) => {
  try {
    await Category.findOneAndUpdate(
      { 
        _id: categoryId,
        'products.productId': productId 
      },
      {
        $set: {
          'products.$.productName': updateData.productName,
          'products.$.description': updateData.description,
           'products.$.instruction': updateData.instruction,
          'products.$.targetedCustomer': updateData.targetedCustomer,
          'products.$.fabric': updateData.fabric,
          'products.$.sizes': updateData.sizes,
          'products.$.colors': updateData.colors,
          'products.$.moq': updateData.moq,
          'products.$.pricePerUnit': updateData.pricePerUnit,
          'products.$.quantityBasedPricing': updateData.quantityBasedPricing,
          'products.$.additionalInfo': updateData.additionalInfo,
          'products.$.images': updateData.images,
          'products.$.isActive': updateData.isActive,
          'products.$.isFeatured': updateData.isFeatured, // NEW
          'products.$.tags': updateData.tags, // NEW
          'products.$.updatedAt': new Date()
        }
      }
    );
  } catch (error) {
    console.error('Error updating embedded product:', error);
    throw error;
  }
};


// Helper function to remove embedded product from category
const removeEmbeddedProductFromCategory = async (categoryId, productId) => {
  try {
    await Category.findByIdAndUpdate(
      categoryId,
      {
        $pull: { products: { productId: productId } },
        $inc: { productCount: -1 }
      }
    );
  } catch (error) {
    console.error('Error removing embedded product:', error);
    throw error;
  }
};



// const updateProduct = async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id);

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         error: 'Product not found'
//       });
//     }

//     // Check permissions
//     if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
//       return res.status(403).json({
//         success: false,
//         error: 'You do not have permission to update products'
//       });
//     }

//     const {
//       productName,
//       description,
//       category,
//       targetedCustomer,
//       fabric,
//       moq,
//       pricePerUnit,
//       quantityBasedPricing,
//       sizes,
//       colors,
//       additionalInfo,
//       // NEW FIELDS
//       isFeatured,
//       tags,
//       metaSettings
//     } = req.body;

//     const oldCategory = product.category.toString();
//     const newCategory = category || oldCategory;

//     // Check if category is being changed
//     if (category && category !== oldCategory) {
//       const categoryExists = await Category.findById(category);
//       if (!categoryExists) {
//         return res.status(400).json({
//           success: false,
//           error: 'Invalid category'
//         });
//       }
//     }

//     // Update basic fields
//     if (productName) product.productName = productName;
//     if (description !== undefined) product.description = description;
//     if (category) product.category = category;
//     if (targetedCustomer) product.targetedCustomer = targetedCustomer;
//     if (fabric) product.fabric = fabric;
//     if (moq) product.moq = parseInt(moq);
//     if (pricePerUnit) product.pricePerUnit = parseFloat(pricePerUnit);

//     // Update new fields
//     if (isFeatured !== undefined) {
//       product.isFeatured = isFeatured === 'true' || isFeatured === true;
//     }

//     // Parse and update quantity based pricing
//     if (quantityBasedPricing) {
//       try {
//         const parsed = typeof quantityBasedPricing === 'string' 
//           ? JSON.parse(quantityBasedPricing) 
//           : quantityBasedPricing;
//         product.quantityBasedPricing = parsed;
//       } catch (error) {
//         return res.status(400).json({
//           success: false,
//           error: 'Invalid quantity based pricing format'
//         });
//       }
//     }

//     // Parse and update sizes
//     if (sizes) {
//       try {
//         const parsed = typeof sizes === 'string' 
//           ? JSON.parse(sizes) 
//           : sizes;
//         if (parsed.length === 0) {
//           return res.status(400).json({
//             success: false,
//             error: 'At least one size is required'
//           });
//         }
//         product.sizes = parsed;
//       } catch (error) {
//         return res.status(400).json({
//           success: false,
//           error: 'Invalid sizes format'
//         });
//       }
//     }

//     // Parse and update colors
//     if (colors) {
//       try {
//         const parsed = typeof colors === 'string' 
//           ? JSON.parse(colors) 
//           : colors;
//         if (parsed.length === 0) {
//           return res.status(400).json({
//             success: false,
//             error: 'At least one color is required'
//           });
//         }
//         product.colors = parsed;
//       } catch (error) {
//         return res.status(400).json({
//           success: false,
//           error: 'Invalid colors format'
//         });
//       }
//     }

//     // Parse and update additional info
//     if (additionalInfo) {
//       try {
//         const parsed = typeof additionalInfo === 'string' 
//           ? JSON.parse(additionalInfo) 
//           : additionalInfo;
        
//         if (parsed && parsed.length > 0) {
//           for (const info of parsed) {
//             if (!info.fieldName || !info.fieldName.trim()) {
//               return res.status(400).json({
//                 success: false,
//                 error: 'Field name is required for additional information'
//               });
//             }
//             if (!info.fieldValue || !info.fieldValue.trim()) {
//               return res.status(400).json({
//                 success: false,
//                 error: 'Field value is required for additional information'
//               });
//             }
//           }
//         }
        
//         product.additionalInfo = parsed;
//       } catch (error) {
//         return res.status(400).json({
//           success: false,
//           error: 'Invalid additional info format'
//         });
//       }
//     }

//     // Parse and update tags
//     if (tags) {
//       try {
//         const parsed = typeof tags === 'string' 
//           ? JSON.parse(tags) 
//           : tags;
        
//         // Validate tags
//         if (parsed && parsed.length > 0) {
//           const validTags = [
//             'Top Ranking', 'New Arrival', 'Top Deal', 'Best Seller',
//             'Summer Collection', 'Winter Collection', 'Limited Edition', 'Trending'
//           ];
          
//           for (const tag of parsed) {
//             if (!validTags.includes(tag)) {
//               return res.status(400).json({
//                 success: false,
//                 error: `Invalid tag: ${tag}`
//               });
//             }
//           }
//         }
        
//         product.tags = parsed;
//       } catch (error) {
//         return res.status(400).json({
//           success: false,
//           error: 'Invalid tags format'
//         });
//       }
//     }

//     // Parse and update meta settings
//     if (metaSettings) {
//       try {
//         const parsed = typeof metaSettings === 'string' 
//           ? JSON.parse(metaSettings) 
//           : metaSettings;
        
//         // Validate meta title length
//         if (parsed.metaTitle && parsed.metaTitle.length > 70) {
//           return res.status(400).json({
//             success: false,
//             error: 'Meta title should not exceed 70 characters'
//           });
//         }

//         // Validate meta description length
//         if (parsed.metaDescription && parsed.metaDescription.length > 160) {
//           return res.status(400).json({
//             success: false,
//             error: 'Meta description should not exceed 160 characters'
//           });
//         }

//         // Update only provided fields
//         product.metaSettings = {
//           ...product.metaSettings,
//           ...parsed
//         };
//       } catch (error) {
//         return res.status(400).json({
//           success: false,
//           error: 'Invalid meta settings format'
//         });
//       }
//     }

//     // Handle new images
//     if (req.files && req.files.length > 0) {
//       // Delete old images from Cloudinary
//       for (const image of product.images) {
//         if (image.publicId) {
//           await cloudinary.uploader.destroy(image.publicId);
//         }
//       }

//       // Add new images
//       const newImages = req.files.map((file, index) => ({
//         url: file.path,
//         publicId: file.filename,
//         isPrimary: index === 0
//       }));
      
//       product.images = newImages;
//     }

//     await product.save();

//     // Prepare update data for embedded product in category
//     const updateData = {
//       productName: product.productName,
//       description: product.description,
//       targetedCustomer: product.targetedCustomer,
//       fabric: product.fabric,
//       sizes: product.sizes,
//       colors: product.colors,
//       moq: product.moq,
//       pricePerUnit: product.pricePerUnit,
//       quantityBasedPricing: product.quantityBasedPricing,
//       additionalInfo: product.additionalInfo || [],
//       images: product.images,
//       isActive: product.isActive,
//       isFeatured: product.isFeatured, // NEW
//       tags: product.tags, // NEW
//       updatedAt: new Date()
//     };

//     // If category changed, remove from old and add to new
//     if (category && category !== oldCategory) {
//       await removeEmbeddedProductFromCategory(oldCategory, product._id);
      
//       const embeddedProduct = {
//         productId: product._id,
//         ...updateData,
//         createdBy: product.createdBy,
//         createdAt: product.createdAt
//       };
      
//       await Category.findByIdAndUpdate(
//         newCategory,
//         {
//           $push: { products: embeddedProduct },
//           $inc: { productCount: 1 }
//         }
//       );
//     } else {
//       await updateEmbeddedProductInCategory(newCategory, product._id, updateData);
//     }

//     await product.populate([
//       { path: 'category', select: 'name slug' },
//       { path: 'createdBy', select: 'contactPerson' }
//     ]);

//     res.json({
//       success: true,
//       data: product,
//       message: 'Product updated successfully'
//     });
//   } catch (error) {
//     console.error('Update product error:', error);
    
//     if (req.files && req.files.length > 0) {
//       try {
//         for (const file of req.files) {
//           await cloudinary.uploader.destroy(file.filename);
//         }
//       } catch (cloudinaryError) {
//         console.error('Error deleting from Cloudinary:', cloudinaryError);
//       }
//     }
    
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while updating product'
//     });
//   }
// };

// @desc    Update product
// @route   PUT /api/products/:id
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
    if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to update products'
      });
    }

    const {
      productName,
      description,
      instruction, // NEW: Add instruction field
      category,
      targetedCustomer,
      fabric,
      moq,
      pricePerUnit,
      quantityBasedPricing,
      sizes,
      colors,
      additionalInfo,
      isFeatured,
      tags,
      metaSettings
    } = req.body;

    const oldCategory = product.category.toString();
    const newCategory = category || oldCategory;

    // Check if category is being changed
    if (category && category !== oldCategory) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          error: 'Invalid category'
        });
      }
    }

    // Update basic fields
    if (productName) product.productName = productName;
    if (description !== undefined) product.description = description;
    if (instruction !== undefined) product.instruction = instruction; // NEW: Update instruction
    if (category) product.category = category;
    if (targetedCustomer) product.targetedCustomer = targetedCustomer;
    if (fabric) product.fabric = fabric;
    if (moq) product.moq = parseInt(moq);
    if (pricePerUnit) product.pricePerUnit = parseFloat(pricePerUnit);

    // Update new fields
    if (isFeatured !== undefined) {
      product.isFeatured = isFeatured === 'true' || isFeatured === true;
    }

    // Parse and update quantity based pricing
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

    // Parse and update sizes
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

    // Parse and update colors
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

    // Parse and update additional info
    if (additionalInfo) {
      try {
        const parsed = typeof additionalInfo === 'string' 
          ? JSON.parse(additionalInfo) 
          : additionalInfo;
        
        if (parsed && parsed.length > 0) {
          for (const info of parsed) {
            if (!info.fieldName || !info.fieldName.trim()) {
              return res.status(400).json({
                success: false,
                error: 'Field name is required for additional information'
              });
            }
            if (!info.fieldValue || !info.fieldValue.trim()) {
              return res.status(400).json({
                success: false,
                error: 'Field value is required for additional information'
              });
            }
          }
        }
        
        product.additionalInfo = parsed;
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid additional info format'
        });
      }
    }

    // Parse and update tags
    if (tags) {
      try {
        const parsed = typeof tags === 'string' 
          ? JSON.parse(tags) 
          : tags;
        
        // Validate tags
        if (parsed && parsed.length > 0) {
          const validTags = [
            'Top Ranking', 'New Arrival', 'Top Deal', 'Best Seller',
            'Summer Collection', 'Winter Collection', 'Limited Edition', 'Trending'
          ];
          
          for (const tag of parsed) {
            if (!validTags.includes(tag)) {
              return res.status(400).json({
                success: false,
                error: `Invalid tag: ${tag}`
              });
            }
          }
        }
        
        product.tags = parsed;
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid tags format'
        });
      }
    }

    // Parse and update meta settings
    if (metaSettings) {
      try {
        const parsed = typeof metaSettings === 'string' 
          ? JSON.parse(metaSettings) 
          : metaSettings;
        
        // Validate meta title length
        if (parsed.metaTitle && parsed.metaTitle.length > 70) {
          return res.status(400).json({
            success: false,
            error: 'Meta title should not exceed 70 characters'
          });
        }

        // Validate meta description length
        if (parsed.metaDescription && parsed.metaDescription.length > 160) {
          return res.status(400).json({
            success: false,
            error: 'Meta description should not exceed 160 characters'
          });
        }

        // Update only provided fields
        product.metaSettings = {
          ...product.metaSettings,
          ...parsed
        };
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid meta settings format'
        });
      }
    }

    // Handle new images
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

    // Prepare update data for embedded product in category
    const updateData = {
      productName: product.productName,
      description: product.description,
      instruction: product.instruction, // NEW: Include instruction in update
      targetedCustomer: product.targetedCustomer,
      fabric: product.fabric,
      sizes: product.sizes,
      colors: product.colors,
      moq: product.moq,
      pricePerUnit: product.pricePerUnit,
      quantityBasedPricing: product.quantityBasedPricing,
      additionalInfo: product.additionalInfo || [],
      images: product.images,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      tags: product.tags,
      updatedAt: new Date()
    };

    // If category changed, remove from old and add to new
    if (category && category !== oldCategory) {
      await removeEmbeddedProductFromCategory(oldCategory, product._id);
      
      const embeddedProduct = {
        productId: product._id,
        ...updateData,
        createdBy: product.createdBy,
        createdAt: product.createdAt
      };
      
      await Category.findByIdAndUpdate(
        newCategory,
        {
          $push: { products: embeddedProduct },
          $inc: { productCount: 1 }
        }
      );
    } else {
      await updateEmbeddedProductInCategory(newCategory, product._id, updateData);
    }

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


// @desc    Delete product
// @route   DELETE /api/products/:id





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

    // Remove embedded product from category
    await removeEmbeddedProductFromCategory(product.category, product._id);

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

// @desc    Toggle product active status
// @route   PUT /api/products/:id/toggle
// @access  Private (Admin only)
// const toggleProductStatus = async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id);

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         error: 'Product not found'
//       });
//     }

//     product.isActive = !product.isActive;
//     await product.save();

//     // Update embedded product in category
//     // await updateEmbeddedProductInCategory(product.category, product._id, {
//     //   isActive: product.isActive
//     // });
//       // Update embedded product in category with complete data
//     await updateEmbeddedProductInCategory(product.category, product._id, {
//       productName: product.productName,
//       description: product.description,
//       targetedCustomer: product.targetedCustomer,
//       fabric: product.fabric,
//       sizes: product.sizes,
//       colors: product.colors,
//       moq: product.moq,
//       pricePerUnit: product.pricePerUnit,
//       quantityBasedPricing: product.quantityBasedPricing,
//       additionalInfo: product.additionalInfo || [], // Include additionalInfo
//       images: product.images,
//       isActive: product.isActive
//     });

//     res.json({
//       success: true,
//       data: product,
//       message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`
//     });
//   } catch (error) {
//     console.error('Toggle product error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while toggling product status'
//     });
//   }
// };
// @desc    Toggle product active status - UPDATE THIS
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

    // Update embedded product in category with complete data including new fields
    await updateEmbeddedProductInCategory(product.category, product._id, {
      productName: product.productName,
      description: product.description,
      targetedCustomer: product.targetedCustomer,
      fabric: product.fabric,
      sizes: product.sizes,
      colors: product.colors,
      moq: product.moq,
      pricePerUnit: product.pricePerUnit,
      quantityBasedPricing: product.quantityBasedPricing,
      additionalInfo: product.additionalInfo || [],
      images: product.images,
      isActive: product.isActive,
      isFeatured: product.isFeatured, // NEW
      tags: product.tags // NEW
    });

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
      isActive: true
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

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  getProductsByCategory,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  updateEmbeddedProductInCategory,
  removeEmbeddedProductFromCategory,
};
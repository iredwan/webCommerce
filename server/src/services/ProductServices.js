import ProductModel from "../model/ProductModel.js";
import { generateUniqueSlug } from "../utility/slugify.js";
import { 
  validateProductCreation, 
  validateProductUpdate,
  validateStockUpdate 
} from "../utility/productValidation.js";
import {
  logProductCreation,
  logProductUpdate,
  logProductDeletion,
  logStockUpdate,
  logDiscountOperation,
  logPublishStatusChange,
  createProductAuditLog,
  extractUserInfo,
  logImageDeletion
} from "../utility/auditLogger.js";
import mongoose from "mongoose";
import AuditLog from "../model/AuditLog.js";
import { deleteFile } from "../utility/fileUtils.js";
const ObjectId = mongoose.Types.ObjectId; 

export const createProductService = async (req) => {
  try {
    const reqBody = req.body;
    console.log(reqBody);

    // Validate input data
    const validation = validateProductCreation(reqBody);
    if (!validation.isValid) {
      return { 
        status: false, 
        message: "Validation failed.",
        errors: validation.errors 
      };
    }

    reqBody.name = reqBody.name.trim();
    reqBody.slug = await generateUniqueSlug(reqBody.name, ProductModel);

    // Handle totalStock based on variants presence
    if (reqBody.variants && reqBody.variants.length > 0) {
      // If variants exist, calculate totalStock from variants (unless manually overridden)
      const calculatedStock = reqBody.variants.reduce((sum, v) => {
        return sum + parseInt(v.stock);
      }, 0);
      
      // Use manually set totalStock if provided and > 0, otherwise use calculated
      if (!reqBody.totalStock || reqBody.totalStock === 0) {
        reqBody.totalStock = calculatedStock;
      }
    } else {
      // No variants - use the provided totalStock or default to 0
      reqBody.totalStock = reqBody.totalStock || 0;
    }

    const product = await ProductModel.create(reqBody);
    
    // Create audit log
    await logProductCreation(req, product);
    
    return { 
      status: true,
      message: "Product created successfully." 
    };
  } catch (e) {
    console.error("Product creation error:", e);
    
    // Handle MongoDB duplicate key error
    if (e.code === 11000) {
      const field = Object.keys(e.keyPattern)[0];
      return {
        status: false,
        message: `Product with this ${field} already exists.`,
        error: e.message
      };
    }
    
    return { 
      status: false, 
      error: e.message || e.toString(),
      message: "Failed to create product."
    };
  }
};

export const getAllProductsService = async (query) => {
  try {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { isDeleted: false };

    if (query.category) {
      filter.category = query.category;
    }
    if (query.search) {
      filter.name = { $regex: query.search, $options: "i" };
    }
    if (query.isPublished !== undefined) {
      filter.isPublished = query.isPublished === 'true';
    }
    if (query.brand) {
      filter.brand = { $regex: query.brand, $options: "i" };
    }

    const products = await ProductModel.find(filter)
      .populate('category', 'categoryName categoryImg')
      .skip(skip)
      .limit(limit);

    const total = await ProductModel.countDocuments(filter);

    return {
      status: true,
      data: products,
      pagination: {
        total,
        currentPage: page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      message: "Products retrieved successfully."
    };
  } catch (e) {
    console.error("Get all products error:", e);
    return { 
      status: false, 
      error: e.message || e.toString(),
      message: "Failed to retrieve products."
    };
  }
};

export const getAllProductsForPublicService = async (query) => {
  try {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { isDeleted: false, isPublished: true };

    if (query.category) {
      filter.category = query.category;
    }
    if (query.search) {
      filter.name = { $regex: query.search, $options: "i" };
    }
    if (query.brand) {
      filter.brand = { $regex: query.brand, $options: "i" };
    }
    if (query.minPrice || query.maxPrice) {
      filter.basePrice = {};
      if (query.minPrice) filter.basePrice.$gte = parseFloat(query.minPrice);
      if (query.maxPrice) filter.basePrice.$lte = parseFloat(query.maxPrice);
    }

    const sortOptions = {};
    if (query.sortBy) {
      switch (query.sortBy) {
        case 'price-asc':
          sortOptions.basePrice = 1;
          break;
        case 'price-desc':
          sortOptions.basePrice = -1;
          break;
        case 'name-asc':
          sortOptions.name = 1;
          break;
        case 'name-desc':
          sortOptions.name = -1;
          break;
        default:
          sortOptions.createdAt = -1;
      }
    } else {
      sortOptions.createdAt = -1;
    }

    const products = await ProductModel.find(filter)
      .populate('category', 'categoryName categoryImg')
      .populate('brand', 'brandName brandImg')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    // Filter images for each product and its variants
    const filteredProducts = products.map(product => {
      // Filter product images
      const filteredImages = Array.isArray(product.images)
        ? product.images.filter(img => img.isDisplayed === true)
        : [];

      // Filter variant images
      const filteredVariants = Array.isArray(product.variants)
        ? product.variants.map(variant => ({
            ...variant.toObject(),
            images: Array.isArray(variant.images)
              ? variant.images.filter(img => img.isDisplayed === true)
              : []
          }))
        : [];

      return {
        ...product.toObject(),
        images: filteredImages,
        variants: filteredVariants
      };
    });

    const total = await ProductModel.countDocuments(filter);

    return {
      status: true,
      data: filteredProducts,
      pagination: {
        total,
        currentPage: page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (e) {
    return { status: false, error: e.toString() };
  }
};

export const getProductByIdService = async (productId) => {
  try {
    if (!ObjectId.isValid(productId)) {
      return { status: false, message: "Invalid product ID." };
    }

    const product = await ProductModel.findById(productId)
      .populate('category', 'categoryName categoryImg')
      .populate('relatedProducts', 'name slug basePrice discount discountedPrice images');

    if (!product) {
      return { status: false, message: "Product not found." };
    }

    // Filter images for the product
    const filteredImages = Array.isArray(product.images)
      ? product.images.filter(img => img.isDisplayed === true)
      : [];

    // Filter variant images
    const filteredVariants = Array.isArray(product.variants)
      ? product.variants.map(variant => ({
          ...variant.toObject(),
          images: Array.isArray(variant.images)
            ? variant.images.filter(img => img.isDisplayed === true)
            : []
        }))
      : [];

      // Attach filtered images and variants to the product
      product.images = filteredImages;
      product.variants = filteredVariants;

    return {
      status: true,
      data: product,
      message: "Product retrieved successfully."
    };
  } catch (e) {
    console.error("Get product by ID error:", e);
    return {
      status: false,
      error: e.message || e.toString(),
      message: "Failed to retrieve product."
    };
  }
};

export const getProductByIdAdminService = async (productId) => {
  try {
    if (!ObjectId.isValid(productId)) {
      return { status: false, message: "Invalid product ID." };
    }

    const product = await ProductModel.findById(productId)
      .populate('category', 'categoryName categoryImg')
      .populate('relatedProducts', 'name slug basePrice discount discountedPrice images');

    if (!product) {
      return { status: false, message: "Product not found." };
    }

    // Add audit logging for admin access
    const auditLog = await AuditLog.getLogsByModel('Product', product._id);

    return {
      status: true,
      data: product,
      auditLog,
      message: "Product retrieved successfully."
    };
  } catch (e) {
    console.error("Get product by ID error:", e);
    return {
      status: false,
      error: e.message || e.toString(),
      message: "Failed to retrieve product."
    };
  }
};

export const getProductBySlugService = async (slug) => {
  try {
    if (!slug || typeof slug !== 'string') {
      return { status: false, message: "Invalid product slug." };
    }

    const product = await ProductModel.findOne({ slug, isDeleted: false })
      .populate('category', 'categoryName categoryImg')
      .populate('relatedProducts', 'name slug basePrice discount discountedPrice images');

    if (!product) {
      return { status: false, message: "Product not found." };
    }

    

    return {
      status: true,
      data: product,
      message: "Product retrieved successfully."
    };
  } catch (e) {
    console.error("Get product by slug error:", e);
    return {
      status: false,
      error: e.message || e.toString(),
      message: "Failed to retrieve product."
    };
  }
};

export const updateProductService = async (productId, req) => {
  try {
    if (!ObjectId.isValid(productId)) {
      return { status: false, message: "Invalid product ID." };
    }

    const reqBody = req.body;
    console.log('Update request body:', reqBody);
    console.log('totalStock in request:', reqBody.totalStock);
    
    // Validate input data
    const validation = validateProductUpdate(reqBody);
    if (!validation.isValid) {
      return { 
        status: false, 
        message: "Validation failed.",
        errors: validation.errors 
      };
    }

    const existingProduct = await ProductModel.findById(productId);

    if (!existingProduct) {
      return { status: false, message: "Product not found." };
    }

    // Store old values for audit logging
    const oldValues = {};
    Object.keys(reqBody).forEach(key => {
      if (existingProduct[key] !== undefined) {
        oldValues[key] = existingProduct[key];
      }
    });

    // If name is being updated, generate new slug
    if (reqBody.name && reqBody.name !== existingProduct.name) {
      reqBody.name = reqBody.name.trim();
      reqBody.slug = await generateUniqueSlug(reqBody.name, ProductModel);
    }

    // Handle totalStock logic based on variants presence or updates
    if (reqBody.variants && Array.isArray(reqBody.variants)) {
      if (reqBody.variants.length > 0) {
        // If variants exist, calculate totalStock from variants (unless manually overridden)
        const calculatedStock = reqBody.variants.reduce((sum, v) => {
          return sum + parseInt(v.stock);
        }, 0);
        
        // Use manually set totalStock if provided and > 0, otherwise use calculated
        if (!reqBody.totalStock || reqBody.totalStock === 0) {
          reqBody.totalStock = calculatedStock;
        }
      } else {
        // No variants - preserve the provided totalStock or keep existing
        // Don't override totalStock if it's manually set
        if (reqBody.totalStock === undefined) {
          reqBody.totalStock = existingProduct.totalStock || 0;
        }
      }
    } else if (reqBody.totalStock !== undefined) {
      // totalStock is being updated without variants change
      // Just use the provided totalStock value
      // (This handles direct totalStock updates)
    }

    console.log('Final reqBody before database update:', reqBody);
    console.log('Final totalStock value:', reqBody.totalStock);

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      productId,
      reqBody,
      { new: true, runValidators: true }
    ).populate('category', 'categoryName');

    // Create audit log
    await logProductUpdate(req, productId, oldValues, reqBody);

    return {
      status: true,
      data: updatedProduct,
      message: "Product updated successfully."
    };
  } catch (e) {
    console.error("Product update error:", e);
    
    // Handle MongoDB duplicate key error
    if (e.code === 11000) {
      const field = Object.keys(e.keyPattern)[0];
      return {
        status: false,
        message: `Product with this ${field} already exists.`,
        error: e.message
      };
    }
    
    return {
      status: false,
      error: e.message || e.toString(),
      message: "Failed to update product."
    };
  }
};

export const deleteProductService = async (productId, req) => {
  try {
    if (!ObjectId.isValid(productId)) {
      return { status: false, message: "Invalid product ID." };
    }

    const product = await ProductModel.findById(productId);
    if (!product) {
      return { status: false, message: "Product not found." };
    }

    await ProductModel.findByIdAndUpdate(productId, { isDeleted: true });

    // Create audit log
    await logProductDeletion(req, product);

    return {
      status: true,
      message: "Product deleted successfully."
    };
  } catch (e) {
    console.error("Product deletion error:", e);
    return {
      status: false,
      error: e.message || e.toString(),
      message: "Failed to delete product."
    };
  }
};

export const toggleProductPublishService = async (productId, req) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!ObjectId.isValid(productId)) {
      await session.abortTransaction();
      session.endSession();
      return { status: false, message: "Invalid product ID." };
    }

    const updatedProduct = await ProductModel.findOneAndUpdate(
      { _id: productId },
      [
        { $set: { isPublished: { $not: "$isPublished" } } }
      ],
      { new: true, session }
    );

    if (!updatedProduct) {
      await session.abortTransaction();
      session.endSession();
      return { status: false, message: "Product not found." };
    }

    await logPublishStatusChange(req, updatedProduct, updatedProduct.isPublished, session);

    await session.commitTransaction();
    session.endSession();

    return {
      status: true,
      data: updatedProduct,
      message: `Product ${updatedProduct.isPublished ? 'published' : 'unpublished'} successfully.`
    };

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Product publish toggle transaction error:", error);
    return {
      status: false,
      error: error.message || String(error),
      message: "Failed to toggle product publish status."
    };
  }
};

export const searchProductsService = async (searchQuery, options = {}) => {
  try {
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 10;
    const skip = (page - 1) * limit;

    const searchFilter = {
      isDeleted: false,
      isPublished: true,
      $or: [
        { name: { $regex: searchQuery, $options: "i" } },
        { description: { $regex: searchQuery, $options: "i" } },
        { brand: { $regex: searchQuery, $options: "i" } },
        { tags: { $in: [new RegExp(searchQuery, "i")] } }
      ]
    };

    const products = await ProductModel.find(searchFilter)
      .populate('category', 'categoryName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ProductModel.countDocuments(searchFilter);

    return {
      status: true,
      data: products,
      pagination: {
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        searchQuery
      },
      message: "Search completed successfully."
    };
  } catch (e) {
    console.error("Search products error:", e);
    return {
      status: false,
      error: e.message || e.toString(),
      message: "Failed to search products."
    };
  }
};

export const getProductsByCategoryService = async (categoryId, options = {}) => {
  try {
    if (!ObjectId.isValid(categoryId)) {
      return { status: false, message: "Invalid category ID." };
    }

    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {
      category: categoryId,
      isDeleted: false,
      isPublished: true
    };

    const products = await ProductModel.find(filter)
      .populate('category', 'categoryName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ProductModel.countDocuments(filter);

    return {
      status: true,
      data: products,
      pagination: {
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
      message: "Products retrieved successfully."
    };
  } catch (e) {
    console.error("Get products by category error:", e);
    return {
      status: false,
      error: e.message || e.toString(),
      message: "Failed to retrieve products by category."
    };
  }
};

export const getFeaturedProductsService = async (limit = 10) => {
  try {
    const products = await ProductModel.find({
      isDeleted: false,
      isPublished: true,
      totalStock: { $gt: 0 }
    })
      .populate('category', 'categoryName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    return {
      status: true,
      data: products,
      message: "Featured products retrieved successfully."
    };
  } catch (e) {
    console.error("Get featured products error:", e);
    return {
      status: false,
      error: e.message || e.toString(),
      message: "Failed to retrieve featured products."
    };
  }
};

export const getRelatedProductsService = async (productId, limit = 5) => {
  try {
    if (!ObjectId.isValid(productId)) {
      return { status: false, message: "Invalid product ID." };
    }

    const product = await ProductModel.findById(productId);
    if (!product) {
      return { status: false, message: "Product not found." };
    }

    const relatedProducts = await ProductModel.find({
      _id: { $ne: productId },
      category: product.category,
      isDeleted: false,
      isPublished: true
    })
      .populate('category', 'categoryName')
      .limit(parseInt(limit));

    return {
      status: true,
      data: relatedProducts,
      message: "Related products retrieved successfully."
    };
  } catch (e) {
    console.error("Get related products error:", e);
    return {
      status: false,
      error: e.message || e.toString(),
      message: "Failed to retrieve related products."
    };
  }
};

export const getProductStatsService = async () => {
  try {
    const totalProducts = await ProductModel.countDocuments({ isDeleted: false });
    const publishedProducts = await ProductModel.countDocuments({ 
      isDeleted: false, 
      isPublished: true 
    });
    const outOfStock = await ProductModel.countDocuments({ 
      isDeleted: false, 
      totalStock: 0 
    });
    const lowStock = await ProductModel.countDocuments({ 
      isDeleted: false, 
      totalStock: { $gt: 0, $lte: 10 } 
    });

    return {
      status: true,
      data: {
        totalProducts,
        publishedProducts,
        draftProducts: totalProducts - publishedProducts,
        outOfStock,
        lowStock
      },
      message: "Product statistics retrieved successfully."
    };
  } catch (e) {
    console.error("Get product stats error:", e);
    return {
      status: false,
      error: e.message || e.toString(),
      message: "Failed to retrieve product statistics."
    };
  }
};

export const bulkUpdateProductsService = async (productIds, updateData) => {
  try {
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return { status: false, message: "Product IDs array is required." };
    }

    // Validate all product IDs
    const invalidIds = productIds.filter(id => !ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return { 
        status: false, 
        message: `Invalid product IDs: ${invalidIds.join(', ')}` 
      };
    }

    // Validate update data
    const validation = validateProductUpdate(updateData);
    if (!validation.isValid) {
      return { 
        status: false, 
        message: "Validation failed.",
        errors: validation.errors 
      };
    }

    const result = await ProductModel.updateMany(
      { _id: { $in: productIds }, isDeleted: false },
      updateData
    );

    return {
      status: true,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      },
      message: `${result.modifiedCount} products updated successfully.`
    };
  } catch (e) {
    console.error("Bulk update products error:", e);
    return {
      status: false,
      error: e.message || e.toString(),
      message: "Failed to bulk update products."
    };
  }
};

export const bulkDeleteProductsService = async (productIds) => {
  try {
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return { status: false, message: "Product IDs array is required." };
    }

    // Validate all product IDs
    const invalidIds = productIds.filter(id => !ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return { 
        status: false, 
        message: `Invalid product IDs: ${invalidIds.join(', ')}` 
      };
    }

    const result = await ProductModel.updateMany(
      { _id: { $in: productIds }, isDeleted: false },
      { isDeleted: true }
    );

    return {
      status: true,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      },
      message: `${result.modifiedCount} products deleted successfully.`
    };
  } catch (e) {
    console.error("Bulk delete products error:", e);
    return {
      status: false,
      error: e.message || e.toString(),
      message: "Failed to bulk delete products."
    };
  }
};

export const duplicateProductService = async (productId) => {
  try {
    if (!ObjectId.isValid(productId)) {
      return { status: false, message: "Invalid product ID." };
    }

    const originalProduct = await ProductModel.findById(productId);
    if (!originalProduct) {
      return { status: false, message: "Product not found." };
    }

    // Create a copy of the product
    const productCopy = originalProduct.toObject();
    delete productCopy._id;
    delete productCopy.createdAt;
    delete productCopy.updatedAt;
    
    // Modify the name and slug
    productCopy.name = `${productCopy.name} (Copy)`;
    productCopy.slug = await generateUniqueSlug(productCopy.name, ProductModel);
    
    // Generate new SKUs for variants
    productCopy.variants = productCopy.variants.map((variant, index) => ({
      ...variant,
      sku: `${variant.sku}-copy-${Date.now()}-${index}`
    }));
    
    // Set as draft
    productCopy.isPublished = false;

    const duplicatedProduct = await ProductModel.create(productCopy);

    return {
      status: true,
      data: duplicatedProduct,
      message: "Product duplicated successfully."
    };
  } catch (e) {
    console.error("Duplicate product error:", e);
    return {
      status: false,
      error: e.message || e.toString(),
      message: "Failed to duplicate product."
    };
  }
};

// ============================================
// 2. INVENTORY & STOCK CONTROL FUNCTIONS
// ============================================

export const addVariantService = async (productId, variant, req) => {
  try {
    if (!ObjectId.isValid(productId)) {
      return { status: false, message: "Invalid product ID." };
    }

    const product = await ProductModel.findById(productId);
    if (!product) {
      return { status: false, message: "Product not found." };
    }

    // Validate variant data
    if (!variant.sku || !variant.price || variant.stock === undefined) {
      return { 
        status: false, 
        message: "SKU, price, and stock are required for variant." 
      };
    }

    // Check if SKU already exists
    const existingSku = product.variants.find(v => v.sku === variant.sku);
    if (existingSku) {
      return { status: false, message: "SKU already exists." };
    }

    product.variants.push(variant);
    await product.save();

    // Create audit log
    await logProductUpdate(req, productId, {}, { addedVariant: variant.sku });

    return {
      status: true,
      data: product,
      message: "Variant added successfully."
    };
  } catch (e) {
    console.error("Add variant error:", e);
    return {
      status: false,
      error: e.message || e.toString(),
      message: "Failed to add variant."
    };
  }
};

export const updateProductStockService = async (productId, variantSku, stockChange, req) => {
  try {
    if (!ObjectId.isValid(productId)) {
      return { status: false, message: "Invalid product ID." };
    }

    // Validate stock update data
    const validation = validateStockUpdate({ variantSku, stockChange });
    if (!validation.isValid) {
      return { 
        status: false, 
        message: "Validation failed.",
        errors: validation.errors 
      };
    }

    const product = await ProductModel.findById(productId);
    if (!product) {
      return { status: false, message: "Product not found." };
    }

    const variantIndex = product.variants.findIndex(v => v.sku === variantSku);
    if (variantIndex === -1) {
      return { status: false, message: "Variant not found." };
    }

    const oldStock = product.variants[variantIndex].stock;
    const newStock = oldStock + stockChange;
    
    if (newStock < 0) {
      return { status: false, message: "Insufficient stock." };
    }

    product.variants[variantIndex].stock = newStock;
    await product.save();

    // Create audit log
    await logStockUpdate(req, productId, variantSku, oldStock, newStock, stockChange);

    return {
      status: true,
      data: product,
      message: "Stock updated successfully."
    };
  } catch (e) {
    console.error("Stock update error:", e);
    return {
      status: false,
      error: e.message || e.toString(),
      message: "Failed to update stock."
    };
  }
};

export const getLowStockService = async (threshold = 10) => {
  try {
    const products = await ProductModel.aggregate([
      { $match: { isDeleted: false } },
      { $unwind: "$variants" },
      { $match: { "variants.stock": { $lte: threshold, $gte: 0 } } },
      {
        $project: {
          name: 1,
          sku: "$variants.sku",
          color: "$variants.color",
          size: "$variants.size",
          stock: "$variants.stock",
          price: "$variants.price"
        }
      },
      { $sort: { stock: 1 } }
    ]);

    return {
      status: true,
      data: products,
      message: `Found ${products.length} variants with low stock.`
    };
  } catch (e) {
    console.error("Get low stock error:", e);
    return {
      status: false,
      error: e.message || e.toString(),
      message: "Failed to retrieve low stock items."
    };
  }
};

export const restockProductService = async (productId, restockData, req) => {
  try {
    if (!ObjectId.isValid(productId)) {
      return { status: false, message: "Invalid product ID." };
    }

    const product = await ProductModel.findById(productId);
    if (!product) {
      return { status: false, message: "Product not found." };
    }

    // Update stocks for variants
    if (restockData.variants && Array.isArray(restockData.variants)) {
      for (const variantUpdate of restockData.variants) {
        const variantIndex = product.variants.findIndex(v => v.sku === variantUpdate.sku);
        if (variantIndex !== -1) {
          product.variants[variantIndex].stock += variantUpdate.additionalStock;
        }
      }
    }

    await product.save();

    // Create audit log
    await logProductUpdate(req, productId, {}, { restocked: true, restockData });

    return {
      status: true,
      data: product,
      message: "Product restocked successfully."
    };
  } catch (e) {
    console.error("Restock product error:", e);
    return {
      status: false,
      error: e.message || e.toString(),
      message: "Failed to restock product."
    };
  }
};

// ============================================
// 3. PRICING & DISCOUNT MANAGEMENT FUNCTIONS
// ============================================

export const applyDiscountService = async (productId, discountData, req) => {
  try {
    if (!ObjectId.isValid(productId)) {
      return { status: false, message: "Invalid product ID." };
    }

    const { type, value } = discountData;
    
    if (!type || !value || !['percent', 'flat'].includes(type)) {
      return { 
        status: false, 
        message: "Valid discount type (percent/flat) and value are required." 
      };
    }

    if (type === 'percent' && (value < 0 || value > 100)) {
      return { status: false, message: "Percentage discount must be between 0 and 100." };
    }

    if (type === 'flat' && value < 0) {
      return { status: false, message: "Flat discount cannot be negative." };
    }

    const product = await ProductModel.findById(productId);
    if (!product) {
      return { status: false, message: "Product not found." };
    }

    const updateData = {
      discount: value,
      discountType: type
    };

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      productId, 
      updateData, 
      { new: true }
    );

    // Create audit log
    await logDiscountOperation(req, productId, 'Applied', updateData);

    return {
      status: true,
      data: updatedProduct,
      message: "Discount applied successfully."
    };
  } catch (e) {
    console.error("Apply discount error:", e);
    return {
      status: false,
      error: e.message || e.toString(),
      message: "Failed to apply discount."
    };
  }
};

export const removeDiscountService = async (productId, req) => {
  try {
    if (!ObjectId.isValid(productId)) {
      return { status: false, message: "Invalid product ID." };
    }

    const product = await ProductModel.findById(productId);
    if (!product) {
      return { status: false, message: "Product not found." };
    }

    const updateData = {
      discount: 0,
      discountType: 'percent'
    };

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      productId, 
      updateData, 
      { new: true }
    );

    // Create audit log
    await logDiscountOperation(req, productId, 'Removed', updateData);

    return {
      status: true,
      data: updatedProduct,
      message: "Discount removed successfully."
    };
  } catch (e) {
    console.error("Remove discount error:", e);
    return {
      status: false,
      error: e.message || e.toString(),
      message: "Failed to remove discount."
    };
  }
};

export const scheduleDiscountService = async (productId, startDate, endDate, discountData, req) => {
  try {
    if (!ObjectId.isValid(productId)) {
      return { status: false, message: "Invalid product ID." };
    }

    const product = await ProductModel.findById(productId);
    if (!product) {
      return { status: false, message: "Product not found." };
    }

    const updateData = {
      discount: discountData.value,
      discountType: discountData.type,
      discountSchedule: {
        startDate: new Date(startDate),
        startTime: discountData.startTime || '00:00',
        endDate: new Date(endDate),
        endTime: discountData.endTime || '23:59',
        isActive: false
      }
    };

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      productId, 
      updateData, 
      { new: true }
    );

    // Create audit log
    await logDiscountOperation(req, productId, 'Scheduled', updateData);

    return {
      status: true,
      data: updatedProduct,
      message: "Discount scheduled successfully."
    };
  } catch (e) {
    console.error("Schedule discount error:", e);
    return {
      status: false,
      error: e.message || e.toString(),
      message: "Failed to schedule discount."
    };
  }
};

export const getProductsOnSaleService = async (options = {}) => {
  try {
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {
      isDeleted: false,
      isPublished: true,
      discount: { $gt: 0 }
    };

    const products = await ProductModel.find(filter)
      .populate('category', 'categoryName')
      .sort({ discount: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ProductModel.countDocuments(filter);

    return {
      status: true,
      data: products,
      pagination: {
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
      message: "Products on sale retrieved successfully."
    };
  } catch (e) {
    console.error("Get products on sale error:", e);
    return {
      status: false,
      error: e.message || e.toString(),
      message: "Failed to retrieve products on sale."
    };
  }
};

// ============================================
// 4. CATEGORY & TAGGING SYSTEM FUNCTIONS
// ============================================

export const assignCategoryService = async (productId, categoryIds, req) => {
  try {
    if (!ObjectId.isValid(productId)) {
      return { status: false, message: "Invalid product ID." };
    }

    if (!Array.isArray(categoryIds)) {
      categoryIds = [categoryIds];
    }

    // Validate category IDs
    const invalidIds = categoryIds.filter(id => !ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return { 
        status: false, 
        message: `Invalid category IDs: ${invalidIds.join(', ')}` 
      };
    }

    const product = await ProductModel.findById(productId);
    if (!product) {
      return { status: false, message: "Product not found." };
    }

    const oldCategories = product.category;
    const updateData = { category: categoryIds[0] }; // Assuming single category for now

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      productId, 
      updateData, 
      { new: true }
    ).populate('category', 'categoryName');

    // Create audit log
    await logProductUpdate(req, productId, { category: oldCategories }, updateData);

    return {
      status: true,
      data: updatedProduct,
      message: "Category assigned successfully."
    };
  } catch (e) {
    console.error("Assign category error:", e);
    return {
      status: false,
      error: e.message || e.toString(),
      message: "Failed to assign category."
    };
  }
};

export const addTagsService = async (productId, tags, req) => {
  try {
    if (!ObjectId.isValid(productId)) {
      return { status: false, message: "Invalid product ID." };
    }

    if (!Array.isArray(tags)) {
      return { status: false, message: "Tags must be an array." };
    }

    const product = await ProductModel.findById(productId);
    if (!product) {
      return { status: false, message: "Product not found." };
    }

    const oldTags = product.tags || [];
    const newTags = [...new Set([...oldTags, ...tags])]; // Remove duplicates

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      productId, 
      { tags: newTags }, 
      { new: true }
    );

    // Create audit log
    await logProductUpdate(req, productId, { tags: oldTags }, { tags: newTags });

    return {
      status: true,
      data: updatedProduct,
      message: "Tags added successfully."
    };
  } catch (e) {
    console.error("Add tags error:", e);
    return {
      status: false,
      error: e.message || e.toString(),
      message: "Failed to add tags."
    };
  }
};

// ============================================
// 5. PRODUCT STATUS / VISIBILITY FUNCTIONS
// ============================================
export const featureProductService = async (productId, req) => {
  try {
    if (!ObjectId.isValid(productId)) {
      return { status: false, message: "Invalid product ID." };
    }

    const product = await ProductModel.findById(productId);
    if (!product) {
      return { status: false, message: "Product not found." };
    }

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      productId,
      { isFeatured: !product.isFeatured },
      { new: true }
    );

    // Create audit log
    await logProductUpdate(req, productId, 
      { isFeatured: product.isFeatured }, 
      { isFeatured: !product.isFeatured }
    );

    return {
      status: true,
      data: updatedProduct,
      message: `Product ${updatedProduct.isFeatured ? 'featured' : 'unfeatured'} successfully.`
    };
  } catch (e) {
    console.error("Feature product error:", e);
    return {
      status: false,
      error: e.message || e.toString(),
      message: "Failed to toggle product feature status."
    };
  }
};

// ============================================
// 6. PRODUCT ANALYTICS & REPORTS FUNCTIONS
// ============================================

export const getTopSellingProductsService = async (limit = 10) => {
  try {
    const products = await ProductModel.find({
      isDeleted: false,
      isPublished: true
    })
      .populate('category', 'categoryName')
      .sort({ salesCount: -1 })
      .limit(parseInt(limit));

    return {
      status: true,
      data: products,
      message: "Top selling products retrieved successfully."
    };
  } catch (e) {
    console.error("Get top selling products error:", e);
    return {
      status: false,
      error: e.message || e.toString(),
      message: "Failed to retrieve top selling products."
    };
  }
};

export const getSlowMovingProductsService = async (limit = 10) => {
  try {
    const products = await ProductModel.find({
      isDeleted: false,
      isPublished: true,
      salesCount: { $lte: 5 } // Products with 5 or fewer sales
    })
      .populate('category', 'categoryName')
      .sort({ salesCount: 1, createdAt: 1 })
      .limit(parseInt(limit));

    return {
      status: true,
      data: products,
      message: "Slow moving products retrieved successfully."
    };
  } catch (e) {
    console.error("Get slow moving products error:", e);
    return {
      status: false,
      error: e.message || e.toString(),
      message: "Failed to retrieve slow moving products."
    };
  }
};

export const getStockValuationService = async () => {
  try {
    const result = await ProductModel.aggregate([
      { $match: { isDeleted: false } },
      { $unwind: "$variants" },
      {
        $project: {
          variantValue: { $multiply: ["$variants.stock", "$variants.price"] }
        }
      },
      {
        $group: {
          _id: null,
          totalValue: { $sum: "$variantValue" },
          totalProducts: { $sum: 1 }
        }
      }
    ]);

    const valuation = result.length > 0 ? result[0] : { totalValue: 0, totalProducts: 0 };

    return {
      status: true,
      data: {
        totalStockValue: valuation.totalValue,
        totalVariants: valuation.totalProducts,
        currency: 'BDT' // Assuming Bangladeshi Taka
      },
      message: "Stock valuation retrieved successfully."
    };
  } catch (e) {
    console.error("Get stock valuation error:", e);
    return {
      status: false,
      error: e.message || e.toString(),
      message: "Failed to retrieve stock valuation."
    };
  }
};

export const getProductViewsService = async (productId) => {
  try {
    if (!ObjectId.isValid(productId)) {
      return { status: false, message: "Invalid product ID." };
    }

    const product = await ProductModel.findById(productId);
    if (!product) {
      return { status: false, message: "Product not found." };
    }

    return {
      status: true,
      data: {
        productId: product._id,
        name: product.name,
        viewCount: product.viewCount || 0
      },
      message: "Product views retrieved successfully."
    };
  } catch (e) {
    console.error("Get product views error:", e);
    return {
      status: false,
      error: e.message || e.toString(),
      message: "Failed to retrieve product views."
    };
  }
};

export const incrementProductViewService = async (productId) => {
  try {
    if (!ObjectId.isValid(productId)) {
      return { status: false, message: "Invalid product ID." };
    }

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      productId,
      { $inc: { viewCount: 1 } },
      { new: true }
    );

    if (!updatedProduct) {
      return { status: false, message: "Product not found." };
    }

    return {
      status: true,
      data: { viewCount: updatedProduct.viewCount },
      message: "Product view count incremented."
    };
  } catch (e) {
    console.error("Increment product view error:", e);
    return {
      status: false,
      error: e.message || e.toString(),
      message: "Failed to increment product view."
    };
  }
};

// ============================================
// 7. PROMOTIONAL & SEO TOOLS FUNCTIONS
// ============================================

export const updateSlugService = async (productId, req) => {
  try {
    if (!ObjectId.isValid(productId)) {
      return { status: false, message: "Invalid product ID." };
    }

    const product = await ProductModel.findById(productId);
    if (!product) {
      return { status: false, message: "Product not found." };
    }

    const newSlug = await generateUniqueSlug(product.name, ProductModel);
    const oldSlug = product.slug;

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      productId,
      { slug: newSlug },
      { new: true }
    );

    // Create audit log
    await logProductUpdate(req, productId, { slug: oldSlug }, { slug: newSlug });

    return {
      status: true,
      data: updatedProduct,
      message: "Product slug updated successfully."
    };
  } catch (e) {
    console.error("Update slug error:", e);
    return {
      status: false,
      error: e.message || e.toString(),
      message: "Failed to update product slug."
    };
  }
};

export const addpaginationDataService = async (productId, paginationTitle, paginationDescription, req) => {
  try {
    if (!ObjectId.isValid(productId)) {
      return { status: false, message: "Invalid product ID." };
    }

    const product = await ProductModel.findById(productId);
    if (!product) {
      return { status: false, message: "Product not found." };
    }

    const oldpagination = {
      paginationTitle: product.paginationTitle,
      paginationDescription: product.paginationDescription
    };

    const updateData = {};
    if (paginationTitle !== undefined) updateData.paginationTitle = paginationTitle;
    if (paginationDescription !== undefined) updateData.paginationDescription = paginationDescription;

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      productId,
      updateData,
      { new: true }
    );

    // Create audit log
    await logProductUpdate(req, productId, oldpagination, updateData);

    return {
      status: true,
      data: updatedProduct,
      message: "Product pagination data updated successfully."
    };
  } catch (e) {
    console.error("Add pagination data error:", e);
    return {
      status: false,
      error: e.message || e.toString(),
      message: "Failed to update product pagination data."
    };
  }
};

export const promoteProductOnBannerService = async (productId, req) => {
  try {
    if (!ObjectId.isValid(productId)) {
      return { status: false, message: "Invalid product ID." };
    }

    const product = await ProductModel.findById(productId);
    if (!product) {
      return { status: false, message: "Product not found." };
    }

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      productId,
      { isPromotedOnBanner: !product.isPromotedOnBanner },
      { new: true }
    );

    // Create audit log
    await logProductUpdate(req, productId, 
      { isPromotedOnBanner: product.isPromotedOnBanner }, 
      { isPromotedOnBanner: !product.isPromotedOnBanner }
    );

    return {
      status: true,
      data: updatedProduct,
      message: `Product ${updatedProduct.isPromotedOnBanner ? 'promoted on' : 'removed from'} banner successfully.`
    };
  } catch (e) {
    console.error("Promote product on banner error:", e);
    return {
      status: false,
      error: e.message || e.toString(),
      message: "Failed to toggle product banner promotion."
    };
  }
};

export const deleteProductImageService = async (imageName, req) => {
  try {
    if (!imageName) {
      return { status: false, message: "Invalid image name." };
    }
    
    await deleteFile(imageName);
    
    // Create audit log for image deletion
    await logImageDeletion(req, imageName);
    
    return {
      status: true,
      message: "Product image deleted successfully."
    };
  } catch (e) {
    console.error("Delete product image error:", e);
    return {
      status: false,
      error: e.message || e.toString(),
      message: "Failed to delete product image."
    };
  }
};

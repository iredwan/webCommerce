import {
  createProductService,
  getAllProductsService,
  getAllProductsForPublicService,
  getProductByIdService,
  getProductByIdAdminService,
  getProductBySlugService,
  updateProductService,
  deleteProductService,
  toggleProductPublishService,
  updateProductStockService,
  searchProductsService,
  getProductsByCategoryService,
  getFeaturedProductsService,
  getRelatedProductsService,
  getProductStatsService,
  bulkUpdateProductsService,
  bulkDeleteProductsService,
  duplicateProductService,
  // Inventory & Stock Control
  addVariantService,
  getLowStockService,
  restockProductService,
  // Pricing & Discount Management
  applyDiscountService,
  removeDiscountService,
  scheduleDiscountService,
  getProductsOnSaleService,
  // Category & Tagging System
  assignCategoryService,
  addTagsService,
  // Product Status / Visibility
  featureProductService,
  // Product Analytics & Reports
  getTopSellingProductsService,
  getSlowMovingProductsService,
  getStockValuationService,
  getProductViewsService,
  incrementProductViewService,
  // Promotional & SEO Tools
  updateSlugService,
  promoteProductOnBannerService,
  deleteProductImageService
} from "../services/ProductServices.js";

export const createProductController = async (req, res) => {
  try {
    const response = await createProductService(req);
    return res.status(response.status ? 201 : 400).json(response);
  } catch (error) {
    console.error("Create product controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const getAllProductsController = async (req, res) => {
  try {
    const response = await getAllProductsService(req.query);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Get all products controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const getAllProductsForPublicController = async (req, res) => {
  try {
    const response = await getAllProductsForPublicService(req.query);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Get public products controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const getProductByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await getProductByIdService(id);
    return res.status(response.status ? 200 : 404).json(response);
  } catch (error) {
    console.error("Get product by ID controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const getProductByIdAdminController = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await getProductByIdAdminService(id);
    return res.status(response.status ? 200 : 404).json(response);
  } catch (error) {
    console.error("Get product by ID (Admin) controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const getProductBySlugController = async (req, res) => {
  try {
    const { slug } = req.params;
    const response = await getProductBySlugService(slug);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Get product by slug controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const updateProductController = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await updateProductService(id, req);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Update product controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const deleteProductController = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await deleteProductService(id, req);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Delete product controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const toggleProductPublishController = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await toggleProductPublishService(id, req);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Toggle product publish controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const updateProductStockController = async (req, res) => {
  try {
    const { id } = req.params;
    const { variantSku, stockChange } = req.body;
    if (!variantSku || stockChange === undefined) {
      return res.status(400).json({
        status: "error",
        message: "Variant SKU and stock change are required."
      });
    }
    const response = await updateProductStockService(id, variantSku, parseInt(stockChange), req);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Update product stock controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const searchProductsController = async (req, res) => {
  try {
    const { q: searchQuery } = req.query;
    if (!searchQuery) {
      return res.status(400).json({
        status: "error",
        message: "Search query is required."
      });
    }
    const response = await searchProductsService(searchQuery, req.query);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Search products controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const getProductsByCategoryController = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const response = await getProductsByCategoryService(categoryId, req.query);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Get products by category controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const getFeaturedProductsController = async (req, res) => {
  try {
    const { limit } = req.query;
    const response = await getFeaturedProductsService(limit);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Get featured products controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const getRelatedProductsController = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit } = req.query;
    const response = await getRelatedProductsService(id, limit);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Get related products controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const getProductStatsController = async (req, res) => {
  try {
    const response = await getProductStatsService();
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Get product stats controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const bulkUpdateProductsController = async (req, res) => {
  try {
    const { productIds, updateData } = req.body;
    if (!productIds || !updateData) {
      return res.status(400).json({
        status: "error",
        message: "Product IDs and update data are required."
      });
    }
    const response = await bulkUpdateProductsService(productIds, updateData);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Bulk update products controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const bulkDeleteProductsController = async (req, res) => {
  try {
    const { productIds } = req.body;
    if (!productIds) {
      return res.status(400).json({
        status: "error",
        message: "Product IDs are required."
      });
    }
    const response = await bulkDeleteProductsService(productIds);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Bulk delete products controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const duplicateProductController = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await duplicateProductService(id);
    return res.status(response.status ? 201 : 400).json(response);
  } catch (error) {
    console.error("Duplicate product controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

// ============================================
// INVENTORY & STOCK CONTROL CONTROLLERS
// ============================================

export const addVariantController = async (req, res) => {
  try {
    const { id } = req.params;
    const variant = req.body;
    const response = await addVariantService(id, variant, req);
    return res.status(response.status ? 201 : 400).json(response);
  } catch (error) {
    console.error("Add variant controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const getLowStockController = async (req, res) => {
  try {
    const { threshold } = req.query;
    const response = await getLowStockService(threshold);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Get low stock controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const restockProductController = async (req, res) => {
  try {
    const { id } = req.params;
    const restockData = req.body;
    const response = await restockProductService(id, restockData, req);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Restock product controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

// ============================================
// PRICING & DISCOUNT MANAGEMENT CONTROLLERS
// ============================================

export const applyDiscountController = async (req, res) => {
  try {
    const { id } = req.params;
    const discountData = req.body;
    const response = await applyDiscountService(id, discountData, req);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Apply discount controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const removeDiscountController = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await removeDiscountService(id, req);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Remove discount controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const scheduleDiscountController = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, discountData } = req.body;
    const response = await scheduleDiscountService(id, startDate, endDate, discountData, req);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Schedule discount controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const getProductsOnSaleController = async (req, res) => {
  try {
    const response = await getProductsOnSaleService(req.query);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Get products on sale controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

// ============================================
// CATEGORY & TAGGING SYSTEM CONTROLLERS
// ============================================

export const assignCategoryController = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryIds } = req.body;
    const response = await assignCategoryService(id, categoryIds, req);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Assign category controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const addTagsController = async (req, res) => {
  try {
    const { id } = req.params;
    const { tags } = req.body;
    const response = await addTagsService(id, tags, req);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Add tags controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

// ============================================
// PRODUCT STATUS / VISIBILITY CONTROLLERS
// ============================================

export const featureProductController = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await featureProductService(id, req);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Feature product controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

// ============================================
// PRODUCT ANALYTICS & REPORTS CONTROLLERS
// ============================================

export const getTopSellingProductsController = async (req, res) => {
  try {
    const { limit } = req.query;
    const response = await getTopSellingProductsService(limit);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Get top selling products controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const getSlowMovingProductsController = async (req, res) => {
  try {
    const { limit } = req.query;
    const response = await getSlowMovingProductsService(limit);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Get slow moving products controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const getStockValuationController = async (req, res) => {
  try {
    const response = await getStockValuationService();
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Get stock valuation controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const getProductViewsController = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await getProductViewsService(id);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Get product views controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

export const incrementProductViewController = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await incrementProductViewService(id);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Increment product view controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};

// ============================================
// PROMOTIONAL & SEO TOOLS CONTROLLERS
// ============================================

export const updateSlugController = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await updateSlugService(id, req);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Update slug controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};


export const promoteProductOnBannerController = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await promoteProductOnBannerService(id, req);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Promote product on banner controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};


export const deleteProductImageController = async (req, res) => {
  try {
    const { imageName } = req.params;
    const response = await deleteProductImageService(imageName, req);
    return res.status(response.status ? 200 : 400).json(response);
  } catch (error) {
    console.error("Delete product image controller error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};
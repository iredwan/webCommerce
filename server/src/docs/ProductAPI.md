# Complete Product API Documentation

This document provides comprehensive information about the Product API endpoints, including all CRUD operations, inventory management, pricing, analytics, and SEO tools.

## Base URL
```
/api/products
```

## Authentication
- **Public routes**: No authentication required
- **Protected routes**: Require JWT token in Authorization header: `Bearer <token>`
- **Admin/Manager routes**: Require admin or manager role
- **Seller routes**: Allow admin, manager, or seller roles

## 📋 Complete Feature List

### ✅ 1. Core Product CRUD
- **createProduct()**: Create new product with validation ✓
- **updateProduct()**: Update name, description, price, category etc. ✓  
- **deleteProduct()**: Soft delete (hard delete না করা) ✓
- **getProductById()**: Product details ✓
- **getAllProducts()**: Search, filter, pagination সহ product list ✓

### ✅ 2. Inventory & Stock Control  
- **addVariant()**: নতুন color/size SKU যুক্ত ✓
- **updateStock(sku, qty)**: নির্দিষ্ট SKU-তে stock যোগ বা কম ✓
- **getLowStock(threshold)**: কম stock ওয়ালা variants track ✓
- **restockProduct()**: Restock logic (কিনে ফেলা হলে notify) ✓

### ✅ 3. Pricing & Discount Management
- **applyDiscount(productId, % or flat)**: Discount প্রয়োগ ✓
- **removeDiscount(productId)**: Discount তুলে ফেলা ✓
- **scheduleDiscount()**: নির্দিষ্ট তারিখে discount চালু/বন্ধ ✓
- **getProductsOnSale()**: Discount-এ থাকা সব product ✓

### ✅ 4. Category & Tagging System
- **assignCategory(productId, categoryId)**: এক বা একাধিক category assign ✓
- **addTags(productId, tags[])**: Search ও filter-এর জন্য tag ✓

### ✅ 5. Product Status / Visibility
- **publishProduct(productId)**: User-দের দেখানোর জন্য active/published করা ✓
- **unpublishProduct(productId)**: Hidden রাখা (out of stock, inactive ইত্যাদি) ✓
- **featureProduct(productId)**: Homepage/deals page-এ দেখানোর জন্য highlight করা ✓

### ✅ 6. Product Analytics & Reports
- **getTopSellingProducts()**: সর্বাধিক বিক্রিত product ✓
- **getSlowMovingProducts()**: যেগুলোর বিক্রি কম ✓
- **getStockValuation()**: Product stock মান (inventory value) ✓
- **getProductViews(productId)**: Visitor কতবার দেখেছে ✓

### ✅ 7. Promotional & SEO Tools
- **updateSlug()**: SEO-friendly URL ✓
- **addMetaData()**: metaTitle, metaDescription update ✓
- **promoteProductOnBanner(productId)**: Homepage banner-এ তুলে ধরা ✓

### ✅ 8. Audit Logging
- All functions log with **AuditLog.js** ✓
- Track user actions, IP addresses, changes ✓
- Different severity levels (LOW, MEDIUM, HIGH, CRITICAL) ✓

---

## 🚀 API Endpoints

### Public Endpoints

#### GET `/public` - Get All Public Products
Get all published products for public viewing.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 100)
- `category` (ObjectId, optional): Filter by category ID
- `search` (string, optional): Search in product name
- `brand` (string, optional): Filter by brand
- `minPrice` (number, optional): Minimum price filter
- `maxPrice` (number, optional): Maximum price filter
- `sortBy` (string, optional): Sort options (price-asc, price-desc, name-asc, name-desc, newest, oldest)

#### GET `/public/search` - Search Products
Search products by query string.

#### GET `/public/featured` - Get Featured Products
Get featured products (isFeatured = true).

#### GET `/public/on-sale` - Get Products On Sale
Get all products with active discounts.

#### GET `/public/category/:categoryId` - Get Products by Category
Get products by category ID.

#### GET `/public/:id` - Get Product by ID
Get a single product by ID.

#### GET `/public/slug/:slug` - Get Product by Slug
Get a single product by slug.

#### GET `/public/:id/related` - Get Related Products
Get products related to a specific product.

#### PATCH `/public/:id/view` - Increment Product Views
Track when a user views a product (increments viewCount).

---

### Protected Endpoints (Admin/Manager/Seller)

#### GET `/` - Get All Products (Admin View)
Get all products with admin filters.

#### GET `/stats` - Get Product Statistics
Get comprehensive product statistics.

**Response:**
```json
{
  "status": "success",
  "data": {
    "totalProducts": 100,
    "publishedProducts": 85,
    "draftProducts": 15,
    "outOfStock": 5,
    "lowStock": 12
  }
}
```

#### GET `/analytics/top-selling` - Get Top Selling Products
Get products with highest sales count.

**Query Parameters:**
- `limit` (number, optional): Number of products (default: 10)

#### GET `/analytics/slow-moving` - Get Slow Moving Products  
Get products with low sales.

#### GET `/analytics/stock-valuation` - Get Stock Valuation
Get total value of all inventory.

**Response:**
```json
{
  "status": "success",
  "data": {
    "totalStockValue": 50000.00,
    "totalVariants": 250,
    "currency": "BDT"
  }
}
```

#### GET `/inventory/low-stock` - Get Low Stock Items
Get variants below stock threshold.

**Query Parameters:**
- `threshold` (number, optional): Stock threshold (default: 10)

#### GET `/:id/views` - Get Product Views
Get view count for a specific product.

---

### Admin/Manager Only Endpoints

#### POST `/` - Create Product
Create a new product.

**Request Body:**
```json
{
  "name": "Product Name",
  "description": "Product description",
  "category": "ObjectId",
  "brand": "Brand Name",
  "basePrice": 100.00,
  "discount": 10,
  "discountType": "percent",
  "variants": [
    {
      "sku": "PROD-001-S",
      "color": "Red",
      "size": "Small",
      "price": 95.00,
      "stock": 50,
      "image": "variant-image.jpg"
    }
  ],
  "images": ["image1.jpg", "image2.jpg"],
  "tags": ["tag1", "tag2"],
  "metaTitle": "SEO Title",
  "metaDescription": "SEO Description",
  "isPublished": false,
  "isFeatured": false,
  "isPromotedOnBanner": false
}
```

#### POST `/:id/duplicate` - Duplicate Product
Create a copy of an existing product.

#### POST `/:id/variants` - Add Product Variant
Add a new variant (SKU) to existing product.

**Request Body:**
```json
{
  "sku": "PROD-001-M",
  "color": "Red",
  "size": "Medium", 
  "price": 100.00,
  "stock": 30,
  "image": "variant-image.jpg"
}
```

#### PUT `/:id` - Update Product
Update an existing product.

#### PATCH `/:id/stock` - Update Product Stock
Update stock for a specific variant.

**Request Body:**
```json
{
  "variantSku": "PROD-001-S",
  "stockChange": -5
}
```

#### PATCH `/:id/restock` - Restock Product
Restock multiple variants at once.

**Request Body:**
```json
{
  "variants": [
    {
      "sku": "PROD-001-S",
      "additionalStock": 100
    },
    {
      "sku": "PROD-001-M", 
      "additionalStock": 50
    }
  ]
}
```

#### PATCH `/:id/discount/apply` - Apply Discount
Apply discount to a product.

**Request Body:**
```json
{
  "type": "percent",
  "value": 15
}
```

#### PATCH `/:id/discount/remove` - Remove Discount
Remove discount from a product.

#### PATCH `/:id/discount/schedule` - Schedule Discount
Schedule a discount for specific dates.

**Request Body:**
```json
{
  "startDate": "2024-12-01",
  "endDate": "2024-12-31",
  "discountData": {
    "type": "percent",
    "value": 20
  }
}
```

#### PATCH `/:id/category` - Assign Category
Assign category to a product.

**Request Body:**
```json
{
  "categoryIds": ["categoryId1", "categoryId2"]
}
```

#### PATCH `/:id/tags` - Add Tags
Add tags to a product.

**Request Body:**
```json
{
  "tags": ["electronics", "smartphone", "mobile"]
}
```

#### PATCH `/:id/publish` - Publish Product
Mark product as published (visible to public).

#### PATCH `/:id/unpublish` - Unpublish Product  
Mark product as unpublished (hidden from public).

#### PATCH `/:id/feature` - Toggle Featured Status
Toggle product featured status for homepage.

#### PATCH `/:id/promote-banner` - Toggle Banner Promotion
Toggle product banner promotion.

#### PATCH `/:id/slug` - Update Product Slug
Regenerate SEO-friendly slug based on product name.

#### PATCH `/:id/meta` - Update Meta Data
Update SEO meta title and description.

**Request Body:**
```json
{
  "metaTitle": "Best Smartphone 2024",
  "metaDescription": "Latest smartphone with advanced features and great price"
}
```

#### PUT `/bulk` - Bulk Update Products
Update multiple products at once.

**Request Body:**
```json
{
  "productIds": ["id1", "id2", "id3"],
  "updateData": {
    "isPublished": true,
    "discount": 10
  }
}
```

#### DELETE `/bulk` - Bulk Delete Products
Soft delete multiple products.

#### DELETE `/:id` - Delete Product
Soft delete a product.

---

## 📊 Enhanced Product Object Structure

```json
{
  "_id": "ObjectId",
  "name": "Product Name",
  "slug": "product-name",
  "description": "Product description",
  "category": {
    "_id": "ObjectId",
    "categoryName": "Category Name"
  },
  "brand": "Brand Name",
  "variants": [
    {
      "sku": "PROD-001-S",
      "color": "Red",
      "size": "Small",
      "price": 95.00,
      "stock": 50,
      "image": "variant-image.jpg"
    }
  ],
  "images": ["image1.jpg", "image2.jpg"],
  "basePrice": 100.00,
  "discount": 10,
  "discountType": "percent",
  "discountSchedule": {
    "startDate": "2024-12-01",
    "endDate": "2024-12-31",
    "isActive": false
  },
  "discountedPrice": 90.00,
  "totalStock": 150,
  "isPublished": true,
  "isFeatured": false,
  "isPromotedOnBanner": false,
  "viewCount": 1250,
  "salesCount": 45,
  "isDeleted": false,
  "relatedProducts": [...],
  "tags": ["tag1", "tag2"],
  "metaTitle": "SEO Title",
  "metaDescription": "SEO Description",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

## 🔒 Audit Logging

All product operations are automatically logged with:

- **Action**: CREATE, UPDATE, DELETE, VIEW
- **User Information**: User ID, email, IP address
- **Changes**: Old values vs new values
- **Severity**: LOW, MEDIUM, HIGH, CRITICAL
- **Timestamp**: When the action occurred

### Example Audit Log Entry:
```json
{
  "action": "UPDATE",
  "model": "Product", 
  "modelId": "productId",
  "userId": "userId",
  "userEmail": "admin@example.com",
  "oldValues": { "isPublished": false },
  "newValues": { "isPublished": true },
  "changes": ["isPublished"],
  "description": "Product published: Smartphone XYZ",
  "severity": "LOW",
  "ipAddress": "192.168.1.1",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 🚀 Usage Examples

### Apply Discount to Product
```javascript
fetch('/api/products/PRODUCT_ID/discount/apply', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    type: 'percent',
    value: 25
  })
});
```

### Get Low Stock Items
```javascript
fetch('/api/products/inventory/low-stock?threshold=5')
  .then(response => response.json())
  .then(data => console.log('Low stock items:', data));
```

### Feature Product for Homepage
```javascript
fetch('/api/products/PRODUCT_ID/feature', {
  method: 'PATCH',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
});
```

### Get Stock Valuation
```javascript
fetch('/api/products/analytics/stock-valuation', {
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
})
.then(response => response.json())
.then(data => console.log('Total inventory value:', data.data.totalStockValue));
```

All endpoints follow REST conventions and return consistent JSON responses with proper HTTP status codes.




১. Core Product CRUD
Function	Description
createProduct()	নতুন প্রোডাক্ট তৈরি
updateProduct()	নাম, বর্ণনা, প্রাইস, ক্যাটেগরি ইত্যাদি আপডেট
deleteProduct()	soft delete (hard delete করা উচিত না)
getProductById()	প্রোডাক্ট ডিটেইলস
getAllProducts()	সার্চ, ফিল্টার, পেজিনেশন সহ প্রোডাক্ট লিস্ট

২. Inventory & Stock Control
Function	Description
addVariant()	নতুন color/size SKU যুক্ত
updateStock(sku, qty)	নির্দিষ্ট SKU-তে স্টক যোগ বা কম
getLowStock(threshold)	কম স্টকওয়ালা ভ্যারিয়েন্টগুলো ট্র্যাক
restockProduct()	রিস্টক লজিক (e.g., কিনে ফেলা হলে নোটিফাই)

৩. Pricing & Discount Management
Function	Description
applyDiscount(productId, % or flat)	ডিসকাউন্ট প্রয়োগ
removeDiscount(productId)	ডিসকাউন্ট তুলে ফেলা
scheduleDiscount()	নির্দিষ্ট তারিখে ডিসকাউন্ট চালু/বন্ধ
getProductsOnSale()	ডিসকাউন্টে থাকা সব প্রোডাক্ট

৪. Category & Tagging System
Function	Description
assignCategory(productId, categoryId)	এক বা একাধিক ক্যাটেগরি অ্যাসাইন
addTags(productId, tags[])	সার্চ ও ফিল্টারের জন্য ট্যাগ

৫. Product Status / Visibility
Function	Description
publishProduct(productId)	ইউজারদের দেখানোর জন্য active/published করা
unpublishProduct(productId)	Hidden রাখা (out of stock, inactive ইত্যাদি)
featureProduct(productId)	হোমপেজে/ডিলস পেইজে দেখানোর জন্য হাইলাইট করা

৬. Product Analytics & Reports
Function	Description
getTopSellingProducts()	সর্বাধিক বিক্রিত প্রোডাক্ট
getSlowMovingProducts()	যেগুলোর বিক্রি কম
getStockValuation()	প্রোডাক্ট স্টক মান (inventory value)
getProductViews(productId)	ভিজিটর কতোবার দেখেছে

৭. Promotional & SEO Tools
Function	Description
updateSlug()	SEO-friendly URL
addMetaData()	metaTitle, metaDescription আপডেট
promoteProductOnBanner(productId)	হোমপেজ ব্যানারে তুলে ধরা

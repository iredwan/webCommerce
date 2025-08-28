import mongoose from 'mongoose';

const imagesSchema = new mongoose.Schema({
  image: { type: String, required: true },
  isDisplayed: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  uploadedAt: { type: Date, default: Date.now }
});

// Variant Schema
const variantSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      trim: true,
    },
    color: { type: String },
    size: { type: String },
    unit: { type: String, default: '' },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, min: 0 },
    // Per-variant discount fields
    discount: {
      type: Number,
      default: null,
      validate: {
        validator: function (value) {
          if (this.discountType === 'percent') {
            return value >= 0 && value <= 100;
          }
          // For 'flat' or null, allow any non-negative value
          return value >= 0;
        },
        message: function (props) {
          if (this.discountType === 'percent') {
            return 'Percent discount must be between 0 and 100';
          }
          return 'Discount must be non-negative';
        }
      }
    },
    discountType: {
      type: String,
      enum: ['percent', 'flat'],
      default: null,
    },
    discountSchedule: {
      startDate: Date,
      startTime: { type: String, default: '00:00' },
      endDate: Date,
      endTime: { type: String, default: '23:59' },
      isActive: { type: Boolean, default: false }
    },
    images: [imagesSchema]
  },
  { _id: false, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// 🔄 Virtual field: discountedPrice for variant
variantSchema.virtual('discountedPrice').get(function () {
  // If variant has its own discount, use it
  if (this.discount != null && this.discountType) {
    if (this.discountType === 'flat') {
      return Math.max(0, this.price - this.discount);
    }
    // percent
    return Math.max(0, this.price - (this.price * this.discount) / 100);
  }
  // If no variant discount, fallback to price
  return this.price;
});

// Main Product Schema
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      maxlength: 5000,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'category',
      required: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    variants: [variantSchema],
    images: [imagesSchema],
    basePrice: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    discountType: {
      type: String,
      enum: ['percent', 'flat'],
      default: 'percent'
    },
    discountSchedule: {
      startDate: Date,
      startTime: { type: String, default: '00:00' },
      endDate: Date,
      endTime: { type: String, default: '23:59' },
      isActive: { type: Boolean, default: false }
    },
    color: {
      type: String,
    },
    size: {
      type: String,
    },
    unit: {
      type: String,
      default: '',
    },
    totalStock: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isPromotedOnBanner: {
      type: Boolean,
      default: false,
    },
    salesCount: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    relatedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
      },
    ],
    tags: {
      type: [String],
      set: (tags) => tags.map(tag => tag.toLowerCase()),
    },
    metaTitle: String,
    metaDescription: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 🔄 Virtual field: discountedPrice
// Product-level virtual: discountedPrice (for basePrice)
productSchema.virtual('discountedPrice').get(function () {
  if (this.discountType === 'flat') {
    return Math.max(0, this.basePrice - this.discount);
  }
  // percent
  return Math.max(0, this.basePrice - (this.basePrice * this.discount) / 100);
});

// 🔄 Virtual field: discountedPrice in variants
// Variant-level virtual: discountedPrice (for variant price)
variantSchema.virtual('discountedPrice').get(function () {
  if (this.discountType === 'flat') {
    return Math.max(0, this.price - this.discount);
  }
  // percent
  return Math.max(0, this.price - (this.price * this.discount) / 100);
});

// 🔄 Pre-save hook: Stock handling
productSchema.pre('save', function (next) {
  if (this.variants.length > 0) {
    // If totalStock is manually set to a positive number, use the manual value
    // Otherwise, calculate from variants
    if (this.totalStock === undefined || this.totalStock === null || this.totalStock === 0) {
      this.totalStock = this.variants.reduce((sum, v) => sum + v.stock, 0);
    }
    // If totalStock is manually set to a value > 0, keep the manual value
  } else {
    // No variants - use manually set totalStock, default to 0 if not provided
    this.totalStock = this.totalStock !== undefined ? this.totalStock : 0;
  }
  next();
});


// 🔄 Soft delete middleware
productSchema.pre(/^find/, function (next) {
  if (!this.getQuery().isDeleted) {
    this.where({ isDeleted: false });
  }
  next();
});

variantSchema.index({ sku: 1 }, { unique: true, sparse: true });

const Product = mongoose.model('product', productSchema);

export default Product;

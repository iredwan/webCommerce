const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    slug: String,
    description: {
      type: String,
      required: true,
      trim: true
    },
    brand: String,
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    subcategories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubCategory'
    }],
    tags: [String],
    isFeatured: {
      type: Boolean,
      default: false
    },
    images: {
      type: [String],
      default: ['default-product.jpg']
    },
    shipping: {
      type: Boolean,
      default: true
    },
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    active: {
      type: Boolean,
      default: true
    },
    // ✅ Variants Array
    variants: [
      {
        sku: { type: String },
        color: String,
        size: String,
        price: {
          type: Number,
          required: true,
          min: 0
        },
        discountPrice: {
          type: Number,
          default: 0
        },
        quantity: {
          type: Number,
          required: true,
          min: 0
        },
        images: [String], // optional override
        isDefault: {
          type: Boolean,
          default: false
        }
      }
    ],
    // Ratings & reviews summary
    ratings: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      set: val => Math.round(val * 10) / 10
    },
    numReviews: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

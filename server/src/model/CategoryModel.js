import mongoose from 'mongoose';

const categoryImgSchema = new mongoose.Schema({
  image: { type: String, required: true },
  isDisplayed: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  uploadedAt: { type: Date, default: Date.now }
});

const DataSchema = new mongoose.Schema(
  {
    categoryName: { type: String, unique: true, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true, index: true },
    categoryImg: [categoryImgSchema],
    description: { type: String, maxlength: 1000 },
    metaTitle: { type: String },
    metaDescription: { type: String },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'category',
      default: null,
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Category = mongoose.model('category', DataSchema);
export default Category;

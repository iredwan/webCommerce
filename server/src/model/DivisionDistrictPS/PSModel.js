import mongoose from "mongoose";

const PSSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Upazila/PS name is required"],
    trim: true
  },
  bengaliName: {
    type: String,
    required: [true, "Bengali name is required"],
    trim: true
  },
  districtId: {
    type: Number,
    required: [true, "District is required"]
  },
  order: {
    type: Number,
    default: 0,
    required: [true, "Order is required"]
  }
}, {
  timestamps: true,
  versionKey: false
});

const PSModel = mongoose.model("PS", PSSchema);

export default PSModel;

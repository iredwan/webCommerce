import mongoose from "mongoose";

const districtSchema = new mongoose.Schema({
  districtId: {
    type: Number,
    required: [true, "District is required"]
  },
  name: {
    type: String,
    required: [true, "District name is required"],
  },
  bengaliName: {
    type: String,
    required: [true, "Bengali name is required"],
    trim: true
  },
  divisionId: {
    type: Number,
    required: [true, "Division is required"]
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

const DistrictModel = mongoose.model("District", districtSchema);

export default DistrictModel;

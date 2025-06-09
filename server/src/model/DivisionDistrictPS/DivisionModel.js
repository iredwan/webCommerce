import mongoose from "mongoose";

const divisionSchema = new mongoose.Schema({
  divisionId: {
    type: Number,
    required: [true, "Division is required"]
  },
  name: {
    type: String,
    required: [true, "Division name is required"],
    unique: true,
    trim: true
  },
  bengaliName: {
    type: String,
    required: [true, "Bengali name is required"],
    trim: true
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

const DivisionModel = mongoose.model("Division", divisionSchema);

export default DivisionModel;

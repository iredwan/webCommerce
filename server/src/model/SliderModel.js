import mongoose from 'mongoose';

const DataSchema = new mongoose.Schema(
  {
    img: {type:String, required:true},
    URL: {type:String, required:true}
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const SliderModel = mongoose.model('slider', DataSchema);

export default SliderModel;
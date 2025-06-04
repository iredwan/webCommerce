import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const DataSchema = new mongoose.Schema(
  {
    //Personal Information
    userID: {type:mongoose.Schema.Types.ObjectId, required:true},
    cus_firstName: { type: String, required: true},
    cus_lastName: { type: String },
    img: { type: String, default: "Image" },
    cus_dob: { type: String, required: true},
    cus_phone: { type: String,required: true },
    password: { 
      type: String, 
      required: true,
      set: (password) => {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
      }
    },

    //Address Information
    cus_country: { type: String, default: "Bangladesh", required: true},
    cus_division: { type: String, required: true},
    cus_district: { type: String, required: true},
    cus_police_station: { type: String, required: true},
    cus_union_ward: { type: String, required: true},
    cus_village: { type: String, required: true},

    //Shipping Information
    ship_country: { type: String, default: "Bangladesh",},
    ship_division: { type: String, required: true},
    ship_district: { type: String, required: true},
    ship_police_station: { type: String, required: true},
    ship_union_ward: { type: String, required: true},
    ship_village: { type: String, required: true},
    ship_phone: { type: String}
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const ProfileModel = mongoose.model('profiles', DataSchema);

export default ProfileModel;
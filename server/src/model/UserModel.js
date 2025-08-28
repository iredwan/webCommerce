import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { parse } from 'date-fns';

const UserSchema = new mongoose.Schema(
  {
    role: { type: String, required: true, enum: ["customer", "admin", "manager", "seller"], default: "customer"},
    ref_userId: { type: mongoose.Schema.Types.ObjectId, ref: "users"},
    isBlocked: { type: Boolean, default: false },
    cus_firstName: { type: String, required: true },
    cus_lastName: { type: String },
    img: { type: String },
    cus_dob: {
      type: Date,
      required: true,
      set: (value) => {
        if (typeof value === 'string') {
          const parsedDate = parse(value, 'dd/MM/yyyy', new Date());
          if (isNaN(parsedDate.getTime())) {
            throw new mongoose.Error.CastError('date', value, 'cus_dob');
          }
          return parsedDate;
        }
        return value;
      }
    },
    gender: { type: String, required: true, enum: ["Male", "Female", "Other"]},
    cus_phone: { type: String, required: true, unique: true },
    cus_email: { type: String, required: true, unique: true },
    password: { 
      type: String, 
      required: true,
      set: (password) => bcrypt.hashSync(password, bcrypt.genSaltSync(10))
    },

    // Address Info
    cus_country: { type: String, default: "Bangladesh", required: true },
    cus_division: { type: String, required: true },
    cus_district: { type: String, required: true },
    cus_police_station: { type: String, required: true },
    cus_union_ward: { type: String },
    cus_village: { type: String, required: true },

    // Shipping Info
    ship_country: { type: String, default: "Bangladesh" },
    ship_division: { type: String, required: true },
    ship_district: { type: String, required: true },
    ship_police_station: { type: String, required: true },
    ship_union_ward: { type: String },
    ship_village: { type: String, required: true },
    ship_phone: { type: String },

    isVerified: { type: Boolean, default: false },
    editBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Pre-save hook
UserSchema.pre('save', function(next) {
  if (this.cus_dob && typeof this.cus_dob === 'string') {
    const parsedDate = parse(this.cus_dob, 'dd/MM/yyyy', new Date());
    if (isNaN(parsedDate.getTime())) {
      return next(new Error('Invalid date format for cus_dob. Expected dd/MM/yyyy.'));
    }
    this.cus_dob = parsedDate;
  }
  next();
});

// Pre-findOneAndUpdate hook
UserSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update?.cus_dob && typeof update.cus_dob === 'string') {
    const parsedDate = parse(update.cus_dob, 'dd/MM/yyyy', new Date());
    if (isNaN(parsedDate.getTime())) {
      return next(new Error('Invalid date format for cus_dob. Expected dd/MM/yyyy.'));
    }
    this.setUpdate({ ...update, cus_dob: parsedDate });
  }
  next();
});



const UserModel = mongoose.model('users', UserSchema);
export default UserModel;

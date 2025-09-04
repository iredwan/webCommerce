// src/models/OrderModel.js
import mongoose from "mongoose";

// 🛒 Order Item Schema
const OrderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "product", required: true },
    quantity: { type: Number, default: 1 },
  },
  { _id: false }
);

// 🚚 Shipping Schema
const ShippingSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String},
    country: { type: String, default: "Bangladesh", required: true },
    division: { type: String, required: true },
    district: { type: String, required: true },
    police_station: { type: String, required: true },
    union_ward: { type: String },
    village: { type: String, required: true },
  },
  { _id: false }
);

// 💳 Payment Schema
const PaymentSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: ["COD", "Bkash"],
      default: "COD",
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    transactionId: String,
    updateTime: String,
  },
  { _id: false }
);

// 📦 Counter Schema (for monthly order sequence)
const CounterSchema = new mongoose.Schema({
  yearMonth: { type: String, required: true, unique: true }, // e.g. "2025-08"
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model("Counter", CounterSchema);

// 📦 Main Order Schema
const OrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true }, // ORD-2025-08-00001

    user: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },

    items: [OrderItemSchema],
    shipping: ShippingSchema,
    payment: PaymentSchema,

    // Order Amounts
    itemsPrice: { type: Number, default: 0 },
    shippingPrice: { type: Number, default: 0 },
    taxPrice: { type: Number, default: 0 },
    totalPrice: { type: Number, default: 0 },

    // Delivery Status
    deliveryStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    // Extra fields
    note: { type: String, maxlength: 500 },

    // Timeline
    paidAt: Date,
    deliveredAt: Date,
  },
  { timestamps: true }
);

// 📌 Pre-save hook for generating sequential orderNumber per month
OrderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0"); // 01-12
    const yearMonth = `${year}-${month}`;

    // Find counter for this year+month, increment or create new
    const counter = await Counter.findOneAndUpdate(
      { yearMonth },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const seqNumber = counter.seq.toString().padStart(5, "0"); // 00001 format
    this.orderNumber = `ORD-${year}-${month}-${seqNumber}`;
  }
  next();
});

const Order = mongoose.model("Order", OrderSchema);
export default Order;
export { Counter };

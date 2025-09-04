import mongoose from "mongoose";
import { Counter } from "./OrderModel.js"; // Import Counter model

// 📋 Invoice Item Schema
const InvoiceItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "product", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    variantSku: String,
    variantDetails: {
      color: String,
      size: String,
      unit: String
    },
    image: String,
    totalAmount: { type: Number, required: true }
  },
  { _id: false }
);

// 💰 Tax Schema
const TaxSchema = new mongoose.Schema(
  {
    name: { type: String, default: "VAT" },
    rate: { type: Number, default: 0 }, // Percentage
    amount: { type: Number, default: 0 }
  },
  { _id: false }
);

// 🚚 Billing Address Schema
const BillingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    country: { type: String, default: "Bangladesh", required: true },
    division: { type: String, required: true },
    district: { type: String, required: true },
    police_station: { type: String, required: true },
    union_ward: { type: String },
    village: { type: String, required: true },
  },
  { _id: false }
);

// 📄 Main Invoice Schema
const InvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { 
      type: String, 
      unique: true,
      default: null
    }, // INV-2025-08-00001

    order: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Order", 
      required: true,
      unique: true // One invoice per order
    },

    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "users", 
      required: true 
    },

    // Invoice Details
    items: [InvoiceItemSchema],
    billingAddress: BillingAddressSchema,

    // Financial Information
    subtotal: { type: Number, required: true }, // Items total before tax
    taxes: [TaxSchema],
    totalTax: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    discount: {
      type: { type: String, enum: ["percent", "flat"], default: "flat" },
      value: { type: Number, default: 0 },
      amount: { type: Number, default: 0 }
    },
    totalAmount: { type: Number, required: true }, // Final amount

    // Invoice Status
    status: {
      type: String,
      enum: ["draft", "sent", "paid", "overdue", "cancelled"],
      default: "draft"
    },

    // Payment Information
    paymentMethod: {
      type: String,
      enum: ["COD", "Bkash", "Nagad", "Card", "Paypal", "Bank Transfer"],
      default: "COD"
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "partial"],
      default: "pending"
    },
    paidAmount: { type: Number, default: 0 },
    remainingAmount: { type: Number, default: 0 },

    // Dates
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    paidDate: Date,

    // Additional Information
    notes: { type: String, maxlength: 1000 },
    terms: { type: String, maxlength: 1000 },
    
    // Company Information (for invoice header)
    companyInfo: {
      name: { type: String, default: "Your Company Name" },
      address: String,
      phone: String,
      email: String,
      website: String,
      logo: String,
      taxId: String
    },

    // Generated files
    pdfPath: String,
    
    // Meta information
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    sentAt: Date,
    viewedAt: Date,
    downloadCount: { type: Number, default: 0 }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// 📌 Pre-save hook for generating sequential invoice number per month
InvoiceSchema.pre("save", async function (next) {
  if (!this.invoiceNumber) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const yearMonth = `INV-${year}-${month}`; // Unique key for invoices

    const counter = await Counter.findOneAndUpdate(
      { yearMonth },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const seqNumber = counter.seq.toString().padStart(5, "0");
    this.invoiceNumber = `${yearMonth}-${seqNumber}`;
  }

  // Calculate remaining amount
  this.remainingAmount = this.totalAmount - this.paidAmount;

  // Auto-calculate due date if not provided (default: 30 days from issue date)
  if (!this.dueDate) {
    const dueDate = new Date(this.issueDate);
    dueDate.setDate(dueDate.getDate() + 30);
    this.dueDate = dueDate;
  }

  next();
});

// Virtual for checking if invoice is overdue
InvoiceSchema.virtual('isOverdue').get(function() {
  return this.paymentStatus !== 'paid' && new Date() > this.dueDate;
});

// Virtual for days overdue
InvoiceSchema.virtual('daysOverdue').get(function() {
  if (!this.isOverdue) return 0;
  const today = new Date();
  const diffTime = today - this.dueDate;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

const Invoice = mongoose.model("Invoice", InvoiceSchema);
export default Invoice;

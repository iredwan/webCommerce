import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variant: {
    color: String,
    size: String
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  }
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    orderItems: [orderItemSchema],

    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      district: { type: String, required: true },
      upazila: { type: String, required: true },
      streetAddress: { type: String, required: true },
      postalCode: { type: String }
    },

    paymentMethod: {
      type: String,
      enum: ['COD', 'SSLCommerz', 'Stripe', 'Bkash'],
      default: 'COD'
    },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String
    },

    totalPrice: {
      type: Number,
      required: true
    },
    couponCode: {
      type: String,
      default: null
    },
    discountAmount: {
      type: Number,
      default: 0
    },

    isPaid: {
      type: Boolean,
      default: false
    },
    paidAt: Date,

    isDelivered: {
      type: Boolean,
      default: false
    },
    deliveredAt: Date,

    trackingNumber: {
      type: String,
      default: ''
    },

    orderStatus: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending'
    },

    adminNote: {
      type: String,
      default: ''
    },

    userNote: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;

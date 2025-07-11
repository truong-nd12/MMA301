const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "OrderItem",
    required: true
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  shippingFee: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  finalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
    default: "pending"
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "card", "momo", "banking"]
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending"
  },
  deliveryMethod: {
    type: String,
    enum: ["pickup", "delivery"],
    default: "delivery"
  },
  receiveTime: Date,
  cancelReason: String,
  discountCode: String,
  appliedPromotion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Promotion"
  },
  shippingAddress: {
    fullName: String,
    phone: String,
    address: String,
    city: String,
    district: String,
    ward: String,
    zipCode: String
  },
  notes: String
}, {
  timestamps: true
});

// Generate order number before save
orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const count = await this.constructor.countDocuments();
    this.orderNumber = `ORDER-${Date.now()}-${count + 1}`;
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);

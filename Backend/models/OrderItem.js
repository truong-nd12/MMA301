const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  subtotal: {
    type: Number,
    required: true
  },
  selectedSize: String,
  selectedAddOns: [
    {
      name: String,
      price: Number
    }
  ],
  options: {
    sugar: String,
    ice: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("OrderItem", orderItemSchema);

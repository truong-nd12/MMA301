const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  itemPrice: {
    type: Number,
    required: true,
    min: 0
  },
  size: {
    type: String,
    enum: ['S', 'M', 'L', null],
    default: null
  },
  addOns: [
    {
      name: { type: String },
      price: { type: Number, min: 0 },
      calories: { type: Number, min: 0, default: 0 }
    }
  ],
  sugarLevel: {
    type: String,
    enum: ['0%', '50%', '100%', null],
    default: null
  },
  iceLevel: {
    type: String,
    enum: ['No Ice', 'Less Ice', 'Normal Ice', null],
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('OrderItem', orderItemSchema);

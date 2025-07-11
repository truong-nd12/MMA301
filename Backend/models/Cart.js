const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [
    {
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
      size: {
        type: String,
        enum: ['S', 'M', 'L', null], // ✅ Cho phép null
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
        default: null // ✅ Cho phép null
      },
      iceLevel: {
        type: String,
        enum: ['No Ice', 'Less Ice', 'Normal Ice', null],
        default: null // ✅ Cho phép null
      },
      itemPrice: {
        type: Number,
        required: true,
        min: 0
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  totalItems: {
    type: Number,
    default: 0
  },
  totalPrice: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});


// Tự động tính tổng item và tổng tiền
cartSchema.pre('save', function (next) {
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  this.totalPrice = this.items.reduce((total, item) => total + (item.itemPrice * item.quantity), 0);
  next();
});

module.exports = mongoose.model('Cart', cartSchema);

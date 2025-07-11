const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: String,
  image: String, // logo hoặc ảnh đại diện
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true
});

module.exports = mongoose.model("Brand", brandSchema);

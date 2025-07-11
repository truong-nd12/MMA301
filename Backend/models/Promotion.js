// models/Promotion.js
const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true, trim: true }, // Ví dụ: NEWUSER50
    title: { type: String, required: true },
    description: String,
    type: { type: String, enum: ["percentage", "fixed"], required: true }, // 10% hoặc 50K
    discountValue: { type: Number, required: true },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscount: Number, // với type: percentage
    appliesTo: {
      type: String,
      enum: ["all", "products", "categories", "users"],
      default: "all",
    },
    applicableProducts: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    ],
    applicableCategories: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    ],
    applicableUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    usageLimit: Number, // tổng số lượt sử dụng
    usedCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Promotion", promotionSchema);

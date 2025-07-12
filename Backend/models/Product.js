const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    images: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    calories: { type: Number, min: 0, default: 0 },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
    },

    sku: {
      type: String,
      unique: true,
      sparse: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    // Product schema
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
    addOns: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        calories: { type: Number, min: 0, default: 0 },
      },
    ],

    sizes: [
      {
        size: {
          type: String,
          enum: ["S", "M", "L"],
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        calories: {
          type: Number,
          min: 0,
          default: 0,
        },
      },
    ],

    options: {
      sugar: {
        type: [String],
        default: ["0%", "50%", "100%"],
      },
      ice: {
        type: [String],
        default: ["No Ice", "Less Ice", "Normal Ice"],
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    availableDays: {
      type: [String],
      enum: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ],
      default: [],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    orderCount: {
      type: Number,
      default: 0,
      min: 0,
    }
  },
  {
    timestamps: true,
  }
);

// Create indexes
productSchema.index({ category: 1 });
productSchema.index({ name: "text", description: "text" });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Product", productSchema);

const mongoose = require("mongoose");

const trackingSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true
  },
  currentLocation: {
    lat: Number,
    lng: Number,
    updatedAt: Date
  },
  statusLogs: [
    {
      status: {
        type: String,
        enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      note: String,
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    }
  ],
  startedAt: Date,
  completedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model("Tracking", trackingSchema);

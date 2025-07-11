// models/Notification.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // null nếu là thông báo toàn hệ thống
  title: String,
  message: String,
  type: {
    type: String,
    enum: ["system", "order", "promotion", "custom"],
    default: "system",
  },
  relatedPromotion: { type: mongoose.Schema.Types.ObjectId, ref: "Promotion" },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", notificationSchema);

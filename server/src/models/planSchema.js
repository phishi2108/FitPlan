const mongoose = require("mongoose");

const PlanSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true }, // Full content (hidden if not paid)
  price: { type: Number, required: true },
  duration: { type: String, required: true }, // e.g., "30 days"
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Plan", PlanSchema);

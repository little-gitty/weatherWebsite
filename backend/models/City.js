const mongoose = require("mongoose");

const citySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  lat:  { type: Number, required: true },
  lon:  { type: Number, required: true },
});

module.exports = mongoose.model("City", citySchema);

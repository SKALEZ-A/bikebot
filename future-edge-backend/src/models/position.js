// src/models/position.js
const mongoose = require('mongoose');

const positionSchema = new mongoose.Schema({
  telegram_id: { type: String, required: true },
  token_address: { type: String, required: true },
  amount: { type: String, required: true },
  entry_price: { type: String, required: true },
  chain: { type: String, required: true },
  status: { type: String, default: 'open' },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Position', positionSchema);
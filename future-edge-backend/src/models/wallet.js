// src/models/wallet.js
const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  telegram_id: { type: String, required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  private_key: { type: String, required: true },
  referral_code: String,
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Wallet', walletSchema);
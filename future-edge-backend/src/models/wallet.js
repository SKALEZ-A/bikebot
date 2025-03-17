// src/models/wallet.js
const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  slippage: { 
    type: Number, 
    default: 10,
    min: 0.1,
    max: 100
  },
  gas_limit: { 
    type: Number, 
    default: 500000,
    min: 21000,
    max: 1000000
  }
}, { _id: false });

const walletSchema = new mongoose.Schema({
  telegram_id: { 
    type: String, 
    required: [true, 'Telegram ID is required'],
    trim: true,
    index: true
  },
  name: { 
    type: String, 
    required: [true, 'Wallet name is required'],
    trim: true
  },
  address: { 
    type: String, 
    required: [true, 'Wallet address is required'],
    trim: true
  },
  private_key: { 
    type: String, 
    required: [true, 'Private key is required'],
    trim: true
  },
  seed_phrase: { 
    type: String, 
    required: [true, 'Seed phrase is required'],
    trim: true
  },
  chain: { 
    type: String, 
    required: [true, 'Chain is required'],
    trim: true,
    enum: ['ETH', 'BSC', 'MONAD']
  },
  referral_code: { 
    type: String,
    trim: true
  },
  settings: {
    ETH: { type: settingsSchema, default: () => ({}) },
    BSC: { type: settingsSchema, default: () => ({}) },
    MONAD: { type: settingsSchema, default: () => ({}) }
  },
  created_at: { 
    type: Date, 
    default: Date.now 
  }
});

// Compound index to ensure unique wallet names per user
walletSchema.index({ telegram_id: 1, name: 1 }, { unique: true });

// Pre-save hook to ensure settings exist
walletSchema.pre('save', function(next) {
  // Ensure settings exist for all chains
  if (!this.settings) {
    this.settings = {};
  }
  
  const chains = ['ETH', 'BSC', 'MONAD'];
  chains.forEach(chain => {
    if (!this.settings[chain]) {
      this.settings[chain] = { slippage: 10, gas_limit: 500000 };
    }
  });
  
  next();
});

module.exports = mongoose.model('Wallet', walletSchema);
// src/routes/wallet.js
const express = require('express');
const router = express.Router();
const Wallet = require('../models/wallet');
const crypto = require('crypto');

/**
 * Create a new wallet
 * POST /wallet
 */
router.post('/', async (req, res) => {
  try {
    // Extract required fields from request body
    const { telegram_id, name, address, private_key, seed_phrase, chain } = req.body;
    
    // Validate required fields
    if (!telegram_id || !name || !address || !private_key || !seed_phrase || !chain) {
      return res.status(400).json({ 
        error: true, 
        message: 'Missing required fields: telegram_id, name, address, private_key, seed_phrase, and chain are all required' 
      });
    }

    // Check if wallet with same name already exists for user
    const existingWallet = await Wallet.findOne({ telegram_id, name });
    if (existingWallet) {
      // If wallet exists, we'll update it
      console.log(`Updating existing wallet: ${name} for user ${telegram_id}`);
      
      // Update wallet properties
      existingWallet.address = address;
      existingWallet.private_key = private_key;
      existingWallet.seed_phrase = seed_phrase;
      existingWallet.chain = chain;
      
      // Update settings if provided
      if (req.body.settings) {
        existingWallet.settings = req.body.settings;
      }
      
      await existingWallet.save();
      return res.status(200).json({
        message: 'Wallet updated successfully',
        wallet: existingWallet
      });
    }

    // Create a new wallet
    console.log(`Creating new wallet: ${name} for user ${telegram_id}`);
    
    // Create wallet instance
    const wallet = new Wallet({
      telegram_id,
      name,
      address,
      private_key,
      seed_phrase,
      chain,
      settings: req.body.settings || {
        ETH: { slippage: 10, gas_limit: 500000 },
        BSC: { slippage: 10, gas_limit: 500000 },
        MONAD: { slippage: 10, gas_limit: 500000 }
      }
    });
    
    // Save wallet to database
    await wallet.save();
    
    // Return success response
    res.status(201).json({
      message: 'Wallet created successfully',
      wallet
    });
  } catch (error) {
    console.error('Error creating wallet:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: true, 
        message: 'Validation error', 
        details: messages 
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(409).json({ 
        error: true, 
        message: 'A wallet with this name already exists for this user'
      });
    }
    
    // Handle other errors
    res.status(500).json({ 
      error: true, 
      message: 'Internal server error',
      details: error.message 
    });
  }
});

/**
 * Get all wallets for a user
 * GET /wallet/:telegramId
 */
router.get('/:telegramId', async (req, res) => {
  try {
    const { telegramId } = req.params;
    
    // Validate telegram ID
    if (!telegramId) {
      return res.status(400).json({ 
        error: true, 
        message: 'Telegram ID is required' 
      });
    }
    
    // Find all wallets for the user
    const wallets = await Wallet.find({ telegram_id: telegramId });
    
    // Return wallets
    res.status(200).json(wallets);
  } catch (error) {
    console.error('Error fetching wallets:', error);
    res.status(500).json({ 
      error: true, 
      message: 'Internal server error',
      details: error.message 
    });
  }
});

/**
 * Get a specific wallet
 * GET /wallet/:telegramId/:walletName
 */
router.get('/:telegramId/:walletName', async (req, res) => {
  try {
    const { telegramId, walletName } = req.params;
    
    // Validate parameters
    if (!telegramId || !walletName) {
      return res.status(400).json({ 
        error: true, 
        message: 'Telegram ID and wallet name are required' 
      });
    }
    
    // Find the wallet
    const wallet = await Wallet.findOne({ telegram_id: telegramId, name: walletName });
    
    // Check if wallet exists
    if (!wallet) {
      return res.status(404).json({ 
        error: true, 
        message: 'Wallet not found' 
      });
    }
    
    // Return the wallet
    res.status(200).json(wallet);
  } catch (error) {
    console.error('Error fetching wallet:', error);
    res.status(500).json({ 
      error: true, 
      message: 'Internal server error',
      details: error.message 
    });
  }
});

/**
 * Delete a wallet
 * DELETE /wallet/:telegramId/:walletName
 */
router.delete('/:telegramId/:walletName', async (req, res) => {
  try {
    const { telegramId, walletName } = req.params;
    
    // Validate parameters
    if (!telegramId || !walletName) {
      return res.status(400).json({ 
        error: true, 
        message: 'Telegram ID and wallet name are required' 
      });
    }
    
    // Find and delete the wallet
    const result = await Wallet.findOneAndDelete({ telegram_id: telegramId, name: walletName });
    
    // Check if wallet was found and deleted
    if (!result) {
      return res.status(404).json({ 
        error: true, 
        message: 'Wallet not found' 
      });
    }
    
    // Return success message
    res.status(200).json({ 
      message: 'Wallet deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting wallet:', error);
    res.status(500).json({ 
      error: true, 
      message: 'Internal server error',
      details: error.message 
    });
  }
});

/**
 * Get wallet settings
 * GET /wallet/settings/:telegramId/:walletName
 */
router.get('/settings/:telegramId/:walletName', async (req, res) => {
  try {
    const { telegramId, walletName } = req.params;
    
    // Validate parameters
    if (!telegramId || !walletName) {
      return res.status(400).json({ 
        error: true, 
        message: 'Telegram ID and wallet name are required' 
      });
    }
    
    // Find the wallet
    const wallet = await Wallet.findOne({ telegram_id: telegramId, name: walletName });
    
    // Check if wallet exists
    if (!wallet) {
      return res.status(404).json({ 
        error: true, 
        message: 'Wallet not found' 
      });
    }
    
    // Return the settings
    res.status(200).json({ 
      settings: wallet.settings || {
        ETH: { slippage: 10, gas_limit: 500000 },
        BSC: { slippage: 10, gas_limit: 500000 },
        MONAD: { slippage: 10, gas_limit: 500000 }
      }
    });
  } catch (error) {
    console.error('Error fetching wallet settings:', error);
    res.status(500).json({ 
      error: true, 
      message: 'Internal server error',
      details: error.message 
    });
  }
});

/**
 * Update wallet settings
 * PUT /wallet/settings/:telegramId/:walletName
 */
router.put('/settings/:telegramId/:walletName', async (req, res) => {
  try {
    const { telegramId, walletName } = req.params;
    const { settings } = req.body;
    
    // Validate parameters
    if (!telegramId || !walletName) {
      return res.status(400).json({ 
        error: true, 
        message: 'Telegram ID and wallet name are required' 
      });
    }
    
    // Validate settings
    if (!settings) {
      return res.status(400).json({ 
        error: true, 
        message: 'Settings object is required' 
      });
    }
    
    // Find the wallet
    const wallet = await Wallet.findOne({ telegram_id: telegramId, name: walletName });
    
    // Check if wallet exists
    if (!wallet) {
      return res.status(404).json({ 
        error: true, 
        message: 'Wallet not found' 
      });
    }
    
    // Update settings
    wallet.settings = settings;
    await wallet.save();
    
    // Return success message
    res.status(200).json({ 
      message: 'Settings updated successfully',
      settings: wallet.settings 
    });
  } catch (error) {
    console.error('Error updating wallet settings:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: true, 
        message: 'Validation error', 
        details: messages 
      });
    }
    
    // Handle other errors
    res.status(500).json({ 
      error: true, 
      message: 'Internal server error',
      details: error.message 
    });
  }
});

/**
 * Generate and store a referral code for all user wallets
 * POST /wallet/generateReferral/:telegramId
 */
router.post('/generateReferral/:telegramId', async (req, res) => {
  try {
    const { telegramId } = req.params;
    
    // Validate telegram ID
    if (!telegramId) {
      return res.status(400).json({ 
        error: true, 
        message: 'Telegram ID is required' 
      });
    }
    
    // Generate a random referral code
    const referralCode = crypto.randomBytes(4).toString('hex');
    
    // Update all wallets for the user with the new referral code
    const result = await Wallet.updateMany(
      { telegram_id: telegramId },
      { referral_code: referralCode }
    );
    
    // Check if any wallets were updated
    if (result.matchedCount === 0) {
      return res.status(404).json({ 
        error: true, 
        message: 'No wallets found for this user' 
      });
    }
    
    // Return the referral code
    res.status(200).json({ 
      message: 'Referral code generated successfully',
      referral_code: referralCode 
    });
  } catch (error) {
    console.error('Error generating referral code:', error);
    res.status(500).json({ 
      error: true, 
      message: 'Internal server error',
      details: error.message 
    });
  }
});

module.exports = router;
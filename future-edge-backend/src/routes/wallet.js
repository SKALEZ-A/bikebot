// src/routes/wallet.js
const express = require('express');
const router = express.Router();
const Wallet = require('../models/wallet');
const crypto = require('crypto');

router.post('/evm', async (req, res) => {
  try {
    const wallet = new Wallet(req.body);
    await wallet.save();
    res.status(201).json(wallet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/evm/:telegramId', async (req, res) => {
  try {
    const wallets = await Wallet.find({ telegram_id: req.params.telegramId });
    res.json(wallets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/generateReferral/:telegramId', async (req, res) => {
  try {
    const referralCode = crypto.randomBytes(4).toString('hex');
    await Wallet.updateMany(
      { telegram_id: req.params.telegramId },
      { referral_code: referralCode }
    );
    res.json({ referral_code: referralCode });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const CountryInsight = require('../models/CountryInsight');
const { OAuth2Client } = require('google-auth-library');

const API_KEY = process.env.API_KEY;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// Save country
router.post('/save', async (req, res) => {
  try {
    const idToken = req.headers.authorization?.split(' ')[1];
    const apiKey = req.headers['x-api-key'];

    if (!apiKey || apiKey !== API_KEY)
      return res.status(401).json({ message: 'Missing or invalid API key' });

    if (!idToken)
      return res.status(401).json({ message: 'Missing ID token' });

    // Verify Google ID Token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const email = payload.email; 

    const data = req.body;
    data.createdBy = email;

    const savedDoc = await CountryInsight.create(data);

    res.json({ message: 'Saved successfully', id: savedDoc._id });

  } catch (err) {
    console.error('Save error:', err);
    res.status(401).json({ message: 'Invalid OAuth token' });
  }
});

// Fetch saved insights for the authenticated user

router.get('/saved', async (req, res) => {
  try {
    const email = req.query.email;
    const list = await CountryInsight.find({ createdBy: email }).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

module.exports = router;

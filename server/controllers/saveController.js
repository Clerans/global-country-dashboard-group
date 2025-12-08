const CountryInsight = require('../models/CountryInsight');

async function saveInsight(req, res) {
  try {
    const body = req.body;
    // Basic validation - require country + weather + covid
    if (!body.country || !body.weather || !body.covid) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const doc = new CountryInsight({
      country: body.country,
      countryCode: body.countryCode || '',
      capital: body.capital || '',
      population: body.population || 0,
      currency: body.currency || '',
      flag: body.flag || '',
      weather: body.weather,
      covid: body.covid,
      createdBy: req.user.email || req.user.id
    });

    const saved = await doc.save();
    return res.status(201).json({ message: 'Saved', id: saved._id, record: saved });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

async function getRecords(req, res) {
  try {
    // Optional: paginate / filter
    const records = await CountryInsight.find().sort({ createdAt: -1 }).limit(100);
    return res.json({ records });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { saveInsight, getRecords };

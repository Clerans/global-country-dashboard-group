const mongoose = require('mongoose');

const WeatherSchema = new mongoose.Schema({
  temp: Number,
  feels_like: Number,
  humidity: Number,
  description: String
}, { _id: false });

const CovidSchema = new mongoose.Schema({
  cases: Number,
  todayCases: Number,
  deaths: Number,
  todayDeaths: Number,
  recovered: Number,
  active: Number,
  updated: Number
}, { _id: false });

const CountryInsightSchema = new mongoose.Schema({
  country: { type: String, required: true },
  countryCode: String,
  capital: String,
  population: Number,
  currency: String,
  flag: String,
  weather: WeatherSchema,
  covid: CovidSchema,
  createdBy: String, // Google user id or email
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CountryInsight', CountryInsightSchema);

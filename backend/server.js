const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const METEO_API_URL = 'https://api.meteo.lt/v1';

// Create DB table
async function createTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS city_logs (
      id SERIAL PRIMARY KEY,
      city TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  console.log('Database tables checked');
}

// Test route
app.get('/', (req, res) => {
  res.send('Weather backend is running');
});

// Get all places
app.get('/api/places', async (req, res) => {
  try {
    const response = await fetch(`${METEO_API_URL}/places`);
    const places = await response.json();

    const search = req.query.search;

    if (!search) {
      return res.json(places);
    }

    const filteredPlaces = places.filter(place =>
      place.name.toLowerCase().includes(search.toLowerCase()) ||
      place.code.toLowerCase().includes(search.toLowerCase()) ||
      place.administrativeDivision?.toLowerCase().includes(search.toLowerCase())
    );

    res.json(filteredPlaces);
  } catch (error) {
    console.error('Places loading failed:', error);
    res.status(500).json({ message: 'Failed to load places list' });
  }
});

// Get weather by city code
app.get('/api/weather/:placeCode', async (req, res) => {
  try {
    const placeCode = req.params.placeCode;

    const response = await fetch(
      `${METEO_API_URL}/places/${placeCode}/forecasts/long-term`
    );

    const weather = await response.json();

    res.json(weather);
  } catch (error) {
    console.error('Weather loading failed:', error);
    res.status(500).json({ message: 'Failed to load weather forecast' });
  }
});

// Log selected city to DB
app.post('/api/log', async (req, res) => {
  try {
    const city = req.body.city;

    if (!city) {
      return res.status(400).json({ message: 'City was not provided' });
    }

    await pool.query(
      `INSERT INTO city_logs (city) VALUES ($1)`,
      [city]
    );

    console.log('Selected city saved to DB:', city);

    res.json({ message: 'City logged successfully' });
  } catch (error) {
    console.error('City log saving failed:', error);
    res.status(500).json({ message: 'Failed to save city log' });
  }
});

// Start server
async function startServer() {
  try {
    await createTables();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
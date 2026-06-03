const express = require('express');
const cors = require('cors');
const axios = require('axios');
const NodeCache = require('node-cache');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const cache = new NodeCache();
const METEO_API = 'https://api.meteo.lt/v1';

app.get('/api/test', (req, res) => {
  res.json({ message: 'API works' });
});

app.get('/api/places', async (req, res) => { try {const search = (req.query.search || '').toLowerCase();
    let places = cache.get('places');
    if (!places) {
      const response = await axios.get(`${METEO_API}/places`);
      places = response.data;
      cache.set('places', places, 60 * 60 * 24);
      console.log('Places loaded from Meteo.lt API');
    } else {
      console.log('Places loaded from cache');
    }

    const filteredPlaces = places.filter(place => place.name.toLowerCase().includes(search) || place.code.toLowerCase().includes(search) || place.administrativeDivision?.toLowerCase().includes(search)).slice(0, 20);

    res.json(filteredPlaces);
  } catch (error) {
    console.error('Error loading places:', error.message);
    res.status(500).json({ message: 'Failed to load places' });
  }
});

app.get('/api/weather/:placeCode', async (req, res) => {
  try {
    const placeCode = req.params.placeCode;
    const cacheKey = `weather_${placeCode}`;

    let weather = cache.get(cacheKey);

    if (!weather) {
      const response = await axios.get(`${METEO_API}/places/${placeCode}/forecasts/long-term`);
      weather = response.data;
      cache.set(cacheKey, weather, 60 * 60);
      console.log('Weather loaded from Meteo.lt API');
    } else {
      console.log('Weather loaded from cache');
    }
    console.log(`[${new Date().toLocaleString()}] Selected city: ${weather.place.name} (${weather.place.code})`);
    res.json(weather);
  } catch (error) {
    console.error('Error loading weather:', error.message);
    res.status(500).json({ message: 'Failed to load weather' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
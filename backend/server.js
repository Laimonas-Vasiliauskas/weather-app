const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const METEO_API_URL = 'https://api.meteo.lt/v1';

let cityLogs = [];

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
    res.status(500).json({ message: 'Nepavyko gauti miestų sąrašo' });
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
    res.status(500).json({ message: 'Nepavyko gauti orų prognozės' });
  }
});

// Log selected city
app.post('/api/log', (req, res) => {
  const city = req.body.city;

  if (!city) {
    return res.status(400).json({ message: 'Miestas nebuvo atsiųstas' });
  }

  cityLogs.push({
    city: city,
    date: new Date()
  });

  console.log('Selected city:', city);

  res.json({ message: 'City logged successfully' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.get('/weather/:city', async (req, res) => {
    const city = req.params.city;
    const url = `https://api.meteo.lt/v1/places/${city}/forecasts/long-term`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
});
app.post('/log', (req, res) => {
  const city = req.body.city;
  const time = new Date().toLocaleString();
  console.log(`[${time}] Selected city: ${city}`);
  res.status(200).json({ message: 'Logged successfully' });
});

app.listen(PORT, () => {console.log(`Backend running on http://localhost:${PORT}`);});
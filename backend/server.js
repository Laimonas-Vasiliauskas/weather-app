app.get('/api/places', async (req, res) => {
  try {
    const search = (req.query.search || '').toLowerCase();

    let places = cache.get('places');

    if (!places) {
      const response = await axios.get(`${METEO_API}/places`);
      places = response.data;

      cache.set('places', places, 60 * 60 * 24);

      console.log('Places loaded from Meteo.lt API');
    } else {
      console.log('Places loaded from cache');
    }

    if (!search) {
      return res.json(places);
    }
    
    const filteredPlaces = places.filter(place => place.name.toLowerCase().includes(search) || place.code.toLowerCase().includes(search) || place.administrativeDivision?.toLowerCase().includes(search)).slice(0, 20);
    res.json(filteredPlaces);
  } catch (error) {
    console.error('Error loading places:', error.message);
    res.status(500).json({ message: 'Failed to load places' });
  }
});
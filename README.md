# Weather App

A simple weather forecast application built with Angular and Node.js.  
The app lets users search for Lithuanian cities, view current weather, see a 5-day forecast, and save/log selected cities.

## Features

- City search with autocomplete
- Current weather display
- 5-day forecast
- Weather condition icons
- Mostly viewed cities
- City search logs saved to PostgreSQL
- Backend deployed on Render

## Technologies

### Weather-web
- Angular
- Angular Material
- TypeScript
- SCSS

- ## Live demo

-  [Open Weather App](https://weather-app-smoky-beta-50.vercel.app)

- # User instructions

1. Open the Weather App in a browser.
2. Click on the search bar.
3. Type the name of a Lithuanian city, for example `Vilnius`, `Kaunas` or `Klaipėda`.
4. Select a city from the autocomplete list.
5. The app displays the current weather for the selected city.
6. The user can see temperature, wind speed, humidity and a weather icon.
7. The user can also view the 5-day forecast.
8. The selected city is added to the **Mostly viewed cities** section.
9. The user can click a city in **Mostly viewed cities** to open it again quickly.
10. Each selected city is logged in the backend database.

### API
- Node.js
- Express.js
- PostgreSQL
- Meteo.lt API

## Project structure

```text
weather-app/
├── frontend/
└── backend/
```

## Weather-web setup

```bash
cd frontend
npm install
npm start
```

Weather-web runs on:

```text
http://localhost:4200
```

## API setup

```bash
cd backend
npm install
node server.js
```

API runs on:

```text
http://localhost:3000
```

## Environment variables

Create a `.env` file inside the `backend` folder:

```env
DATABASE_URL=postgresql://user:password@host:5432/database
NODE_ENV=development
```

## API endpoints

```text
GET  /api/places
GET  /api/weather/:placeCode
POST /api/log
GET  /api/logs
GET  /api/top-cities
```

## Build Weather-web

```bash
cd frontend
npm run build
```

## Run tests

Web

```bash
cd frontend
npm test
```

Api:

```bash
cd backend
npm test
```

## Deployment

The backend can be deployed on Render.  
For Render, add these environment variables:

```env
DATABASE_URL=your_render_postgresql_internal_url
NODE_ENV=production
```

## Author

Laimonas

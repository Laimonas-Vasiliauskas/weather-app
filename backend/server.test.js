const request = require('supertest');

jest.mock('./db', () => ({
  query: jest.fn(),
}));

const pool = require('./db');
const app = require('./server');

describe('Weather backend API tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET / should return backend status message', async () => {
    const response = await request(app).get('/');

    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('Weather backend is running');
  });

  test('POST /api/log should save city log', async () => {
    pool.query.mockResolvedValueOnce({});

    const response = await request(app)
      .post('/api/log')
      .send({ city: 'Vilnius' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      message: 'City logged successfully',
    });

    expect(pool.query).toHaveBeenCalledWith(
      'INSERT INTO city_logs (city) VALUES ($1)',
      ['Vilnius']
    );
  });

  test('POST /api/log should return 400 if city is missing', async () => {
    const response = await request(app)
      .post('/api/log')
      .send({});

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      message: 'City was not provided',
    });

    expect(pool.query).not.toHaveBeenCalled();
  });

  test('GET /api/logs should return saved logs', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          city: 'Vilnius',
          created_at: '2026-06-06T10:00:00.000Z',
        },
      ],
    });

    const response = await request(app).get('/api/logs');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([
      {
        id: 1,
        city: 'Vilnius',
        created_at: '2026-06-06T10:00:00.000Z',
      },
    ]);
  });

  test('GET /api/top-cities should return top cities', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        {
          city: 'Vilnius',
          views: 3,
        },
        {
          city: 'Kaunas',
          views: 2,
        },
        {
          city: 'Klaipėda',
          views: 1,
        },
      ],
    });

    const response = await request(app).get('/api/top-cities');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([
      {
        city: 'Vilnius',
        views: 3,
      },
      {
        city: 'Kaunas',
        views: 2,
      },
      {
        city: 'Klaipėda',
        views: 1,
      },
    ]);
  });
});
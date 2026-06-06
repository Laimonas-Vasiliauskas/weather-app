const request = require('supertest');

jest.mock('./db', () => ({
  query: jest.fn()
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
    expect(response.body.message).toBe('City logged successfully');

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO city_logs'),
      ['Vilnius']
    );
  });
});
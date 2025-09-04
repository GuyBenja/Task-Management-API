// E2E tests for auth flows (register + login)
const request = require('supertest');
const app = require('../src/app');

describe('Auth API', () => {
  const user = { username: 'alice', password: 'S3cr3t!23', role: 'user' };

  // Register once before the test (DB cleanup happens after each test suite via setup)
  beforeAll(async () => {
    const res = await request(app)
      .post('/auth/register')
      .send(user);

    expect([200, 201]).toContain(res.statusCode);
    expect(typeof res.body).toBe('object');

    // ApiResponse shape
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('username', user.username);
    expect(res.body.data).toHaveProperty('role', 'user');
  });

  test('POST /auth/login → 200 + token + cookie "token"', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: user.username, password: user.password });

    expect(res.statusCode).toBe(200);

    // token in response body
    expect(res.body).toHaveProperty('data');
    expect(typeof res.body.data.token).toBe('string');
    expect(res.body.data.token.length).toBeGreaterThan(10); // sanity check

    // token cookie present
    const setCookie = res.headers['set-cookie'] || [];
    const hasTokenCookie = setCookie.some((c) =>
      c.toLowerCase().startsWith('token=')
    );
    expect(hasTokenCookie).toBe(true);
  });
});

const request = require('supertest');
const app = require('../src/app');

describe('Bearer auth header works without cookies', () => {
  test('Create a task using Authorization: Bearer <token>', async () => {
    const u = { username: 'mobile_u', password: 'pass', role: 'user' };
    await request(app).post('/auth/register').send(u);
    const login = await request(app).post('/auth/login').send(u);

    const token = login.body?.data?.token;
    expect(typeof token).toBe('string');

    const future = Date.now() + 24 * 60 * 60 * 1000;
    const res = await request(app)
      .post('/tasks/new')
      .set('Authorization', `Bearer ${token}`) // no Cookie
      .send({ title: 'from-mobile', content: 'x', dueDate: future, priority: 'LOW' });

    expect([200,201]).toContain(res.status);
    expect(res.body?.data?.task?.title).toBe('from-mobile');
  });

  test('Missing token → 401', async () => {
    const res = await request(app).get('/tasks/content');
    expect(res.status).toBe(401);
  });
});

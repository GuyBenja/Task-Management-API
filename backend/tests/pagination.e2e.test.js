// E2E tests for pagination (limit/skip) on /tasks/content
const request = require('supertest');
const app = require('../src/app');

// Helper to extract the "token" cookie from a response
function cookieFrom(res) {
  const setCookie = res.headers['set-cookie'] || [];
  return setCookie.map(c => c.split(';')[0]).join('; ');
}

describe('Pagination on /tasks/content', () => {
  test('User pagination returns only own tasks with correct meta; admin sees all', async () => {
    // Create two users and an admin
    const u = { username: 'page_u', password: 'pass', role: 'user' };
    const v = { username: 'page_v', password: 'pass', role: 'user' };
    const admin = { username: 'page_admin', password: 'pass', role: 'admin' };

    await request(app).post('/auth/register').send(u);
    await request(app).post('/auth/register').send(v);
    await request(app).post('/auth/register').send(admin);

    const uCookie = cookieFrom(await request(app).post('/auth/login').send(u));
    const vCookie = cookieFrom(await request(app).post('/auth/login').send(v));
    const adminCookie = cookieFrom(await request(app).post('/auth/login').send(admin));

    // Create 5 tasks for user U
    const baseFuture = Date.now() + 24 * 60 * 60 * 1000;
    for (let i = 1; i <= 5; i++) {
      const res = await request(app)
        .post('/tasks/new')
        .set('Cookie', uCookie)
        .send({
          title: `u-task-${i}`,
          content: `by u ${i}`,
          dueDate: baseFuture + i * 1000,
          priority: 'LOW',
        });
      expect([200, 201]).toContain(res.status);
    }

    // Create 2 tasks for user V (to verify admin totals)
    for (let i = 1; i <= 2; i++) {
      const res = await request(app)
        .post('/tasks/new')
        .set('Cookie', vCookie)
        .send({
          title: `v-task-${i}`,
          content: `by v ${i}`,
          dueDate: baseFuture + i * 2000,
          priority: 'LOW',
        });
      expect([200, 201]).toContain(res.status);
    }

    // USER pagination: total should count only U's tasks (5)
    const page1 = await request(app)
      .get('/tasks/content')
      .set('Cookie', uCookie)
      .query({ status: 'ALL', sortBy: 'id', limit: 2, skip: 0 });
    expect(page1.status).toBe(200);
    expect(page1.body?.data?.meta?.total).toBe(5);
    expect(page1.body?.data?.meta?.limit).toBe(2);
    expect(page1.body?.data?.meta?.skip).toBe(0);
    expect(page1.body?.data?.meta?.hasMore).toBe(true);
    const tasks1 = page1.body?.data?.tasks || [];
    expect(tasks1.length).toBe(2);
    expect(tasks1.every(t => t.title.startsWith('u-task-'))).toBe(true);

    const page2 = await request(app)
      .get('/tasks/content')
      .set('Cookie', uCookie)
      .query({ status: 'ALL', sortBy: 'id', limit: 2, skip: 2 });
    expect(page2.status).toBe(200);
    expect(page2.body?.data?.meta?.total).toBe(5);
    expect(page2.body?.data?.meta?.limit).toBe(2);
    expect(page2.body?.data?.meta?.skip).toBe(2);
    expect(page2.body?.data?.meta?.hasMore).toBe(true);
    const tasks2 = page2.body?.data?.tasks || [];
    expect(tasks2.length).toBe(2);
    expect(tasks2.every(t => t.title.startsWith('u-task-'))).toBe(true);

    const page3 = await request(app)
      .get('/tasks/content')
      .set('Cookie', uCookie)
      .query({ status: 'ALL', sortBy: 'id', limit: 2, skip: 4 });
    expect(page3.status).toBe(200);
    expect(page3.body?.data?.meta?.total).toBe(5);
    expect(page3.body?.data?.meta?.limit).toBe(2);
    expect(page3.body?.data?.meta?.skip).toBe(4);
    expect(page3.body?.data?.meta?.hasMore).toBe(false);
    const tasks3 = page3.body?.data?.tasks || [];
    expect(tasks3.length).toBe(1);
    expect(tasks3[0].title.startsWith('u-task-')).toBe(true);

    // ADMIN pagination: total should be all tasks (5 + 2 = 7)
    const adminPage = await request(app)
      .get('/tasks/content')
      .set('Cookie', adminCookie)
      .query({ status: 'ALL', sortBy: 'id', limit: 3, skip: 0 });
    expect(adminPage.status).toBe(200);
    expect(adminPage.body?.data?.meta?.total).toBe(7);
    expect(adminPage.body?.data?.meta?.limit).toBe(3);
    expect(adminPage.body?.data?.meta?.skip).toBe(0);
    expect(adminPage.body?.data?.meta?.hasMore).toBe(true);
    const adminTasks = adminPage.body?.data?.tasks || [];
    expect(adminTasks.length).toBe(3);
    // sanity: admin sees both prefixes somewhere across pages
    // (first page might contain only one prefix depending on creation order)
  });
});

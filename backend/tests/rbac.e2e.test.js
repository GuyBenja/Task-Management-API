// E2E tests for RBAC around task routes (Mongo-backed)
const request = require('supertest');
const app = require('../src/app');

// Helper to extract the "token" cookie from a response
function cookieFrom(res) {
  const setCookie = res.headers['set-cookie'] || [];
  return setCookie.map(c => c.split(';')[0]).join('; ');
}

// Basic ObjectId matcher
const isObjectId = (v) => typeof v === 'string' && /^[a-f0-9]{24}$/i.test(v);

describe('RBAC on /tasks with cookie auth', () => {
  test("User cannot delete others' tasks (403); admin can (200)", async () => {
    // 1) Register users
    const u1 = { username: 'u1', password: 'pass', role: 'user' };
    const u2 = { username: 'u2', password: 'pass', role: 'user' };
    const admin = { username: 'admin', password: 'pass', role: 'admin' };

    await request(app).post('/auth/register').send(u1);
    await request(app).post('/auth/register').send(u2);
    await request(app).post('/auth/register').send(admin);

    // 2) Login and capture cookies
    const u1Cookie = cookieFrom(await request(app).post('/auth/login').send(u1));
    const u2Cookie = cookieFrom(await request(app).post('/auth/login').send(u2));
    const adminCookie = cookieFrom(await request(app).post('/auth/login').send(admin));

    // 3) Create task by u1
    const future = Date.now() + 7 * 24 * 60 * 60 * 1000; // one week in the future
    const createRes = await request(app)
      .post('/tasks/new')
      .set('Cookie', u1Cookie)
      .send({
        title: 't1',
        content: 'by u1',
        dueDate: future,
        priority: 'LOW'
      });

    expect([200, 201]).toContain(createRes.status);
    const createdTask = createRes.body?.data?.task;
    expect(createdTask).toBeTruthy();
    const taskId = createdTask?.id;
    expect(isObjectId(taskId)).toBe(true);

    // 4) Another user (u2) tries to delete — expect 403
    const delByU2 = await request(app)
      .delete('/tasks')
      .set('Cookie', u2Cookie)
      .query({ id: taskId });
    expect(delByU2.status).toBe(403);
    expect(delByU2.body?.success).toBe(false);

    // 5) Admin deletes — expect 200
    const delByAdmin = await request(app)
      .delete('/tasks')
      .set('Cookie', adminCookie)
      .query({ id: taskId });
    expect(delByAdmin.status).toBe(200);
    expect(delByAdmin.body?.success).toBe(true);
    expect(typeof delByAdmin.body?.data?.left).toBe('number');
  });

  test('Update status/priority: owner ✅, stranger ❌, admin ✅', async () => {
    // Users
    const a = { username: 'a1', password: 'pass', role: 'user' };
    const b = { username: 'b1', password: 'pass', role: 'user' };
    const admin = { username: 'admin2', password: 'pass', role: 'admin' };

    await request(app).post('/auth/register').send(a);
    await request(app).post('/auth/register').send(b);
    await request(app).post('/auth/register').send(admin);

    const aCookie = cookieFrom(await request(app).post('/auth/login').send(a));
    const bCookie = cookieFrom(await request(app).post('/auth/login').send(b));
    const adminCookie = cookieFrom(await request(app).post('/auth/login').send(admin));

    // Task by A
    const due = Date.now() + 3 * 24 * 60 * 60 * 1000;
    const { body: created } = await request(app)
      .post('/tasks/new')
      .set('Cookie', aCookie)
      .send({ title: 'task-owned-by-a', content: 'x', dueDate: due, priority: 'LOW' });

    const taskId = created?.data?.task?.id;
    expect(isObjectId(taskId)).toBe(true);

    // B tries to change status — 403
    const bStatus = await request(app)
      .put('/tasks/status')
      .set('Cookie', bCookie)
      .query({ id: taskId, status: 'DONE' });
    expect(bStatus.status).toBe(403);

    // A (owner) changes status — 200
    const aStatus = await request(app)
      .put('/tasks/status')
      .set('Cookie', aCookie)
      .query({ id: taskId, status: 'DONE' });
    expect(aStatus.status).toBe(200);

    // B tries to change priority — 403
    const bPrio = await request(app)
      .put('/tasks/priority')
      .set('Cookie', bCookie)
      .query({ id: taskId, priority: 'HIGH' });
    expect(bPrio.status).toBe(403);

    // Admin changes priority — 200
    const adminPrio = await request(app)
      .put('/tasks/priority')
      .set('Cookie', adminCookie)
      .query({ id: taskId, priority: 'HIGH' });
    expect(adminPrio.status).toBe(200);
  });

  test('Content filtering: user sees own tasks; admin sees all', async () => {
    const u = { username: 'seeu', password: 'pass', role: 'user' };
    const v = { username: 'seev', password: 'pass', role: 'user' };
    const admin = { username: 'seeadmin', password: 'pass', role: 'admin' };

    await request(app).post('/auth/register').send(u);
    await request(app).post('/auth/register').send(v);
    await request(app).post('/auth/register').send(admin);

    const uCookie = cookieFrom(await request(app).post('/auth/login').send(u));
    const vCookie = cookieFrom(await request(app).post('/auth/login').send(v));
    const adminCookie = cookieFrom(await request(app).post('/auth/login').send(admin));

    // Create two tasks: one for each user
    const future = Date.now() + 86400000;
    await request(app).post('/tasks/new').set('Cookie', uCookie)
      .send({ title: 'u-task', content: 'u', dueDate: future, priority: 'LOW' });
    await request(app).post('/tasks/new').set('Cookie', vCookie)
      .send({ title: 'v-task', content: 'v', dueDate: future, priority: 'LOW' });

    // User U sees only own tasks
    const listU = await request(app)
      .get('/tasks/content')
      .set('Cookie', uCookie)
      .query({ status: 'ALL', sortBy: 'id' });
    expect(listU.status).toBe(200);
    const tasksU = listU.body?.data?.tasks || [];
    expect(tasksU.every(t => t.title.startsWith('u-'))).toBe(true);

    // User V sees only own tasks
    const listV = await request(app)
      .get('/tasks/content')
      .set('Cookie', vCookie)
      .query({ status: 'ALL', sortBy: 'id' });
    expect(listV.status).toBe(200);
    const tasksV = listV.body?.data?.tasks || [];
    expect(tasksV.every(t => t.title.startsWith('v-'))).toBe(true);

    // Admin sees all tasks
    const listAdmin = await request(app)
      .get('/tasks/content')
      .set('Cookie', adminCookie)
      .query({ status: 'ALL', sortBy: 'id' });
    expect(listAdmin.status).toBe(200);
    const tasksAdmin = listAdmin.body?.data?.tasks || [];
    const hasU = tasksAdmin.some(t => t.title === 'u-task');
    const hasV = tasksAdmin.some(t => t.title === 'v-task');
    expect(hasU && hasV).toBe(true);
  });
});

const express = require('express');
const mongoose = require('mongoose');
const Task = require('../models/Task');
const { ok, fail } = require('../utils/responses');
const { isValidPriority, isValidStatus, isValidSortBy, isValidObjectId } = require('../utils/validators');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Protect all task routes with authentication
router.use(auth);

const isAdmin = (req) => req.user?.role === 'admin';

// --- Helpers ---------------------------------------------------------------

// Return 'PENDING' if dueDate in the future, otherwise 'LATE'
function computeStatusFromDueDate(dueDateMs) {
  return Number(dueDateMs) > Date.now() ? 'PENDING' : 'LATE';
}

// Normalize sortBy to Mongo fields (case-insensitive)
// - 'id' maps to 'createdAt' to preserve the old insertion-order semantics
function normalizeSort(sortByRaw) {
  const raw = (sortByRaw || 'id').toString();         // keep original casing
  const lc = raw.toLowerCase();                        // normalize for comparison

  // Map case-insensitively to canonical keys used by validators
  const canonical = lc === 'duedate' ? 'dueDate' : lc; // only dueDate differs by case

  // Validate against the existing whitelist in validators.js
  if (!isValidSortBy(canonical)) return null;

  // Build Mongo sort object
  if (canonical === 'id')       return { createdAt: 1 };
  if (canonical === 'dueDate')  return { dueDate: 1 };
  if (canonical === 'title')    return { title: 1 };
  if (canonical === 'priority') return { priority: 1 };
  if (canonical === 'status')   return { status: 1 };

  return { createdAt: 1 };
}


// Map DB Task to API shape with "id" string instead of "_id"
function toApiTask(t) {
  return {
    id: t._id.toString(),
    title: t.title,
    content: t.content,
    dueDate: t.dueDate?.getTime?.() ?? Number(t.dueDate),
    priority: t.priority,
    status: t.status,
  };
}

// --- Routes ----------------------------------------------------------------

/**
 * @openapi
 * /tasks/new:
 *   post:
 *     summary: Create a new task (owner = current user)
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content, dueDate]
 *             properties:
 *               title:
 *                 type: string
 *                 example: "t1"
 *               content:
 *                 type: string
 *                 example: "by user"
 *               dueDate:
 *                 description: Unix epoch in milliseconds
 *                 type: integer
 *                 example: 4070908800000
 *               priority:
 *                 type: string
 *                 enum: [LOW, MID, HIGH]
 *                 example: "LOW"
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         task:
 *                           type: object
 *                           properties:
 *                             id: { type: string, description: "Mongo ObjectId" }
 *                             title: { type: string }
 *                             content: { type: string }
 *                             dueDate: { type: integer, description: "epoch ms" }
 *                             priority: { type: string, enum: [LOW, MID, HIGH] }
 *                             status: { type: string, enum: [PENDING, LATE, DONE] }
 *       400:
 *         description: Invalid details / priority
 *       409:
 *         description: Past dueDate / Title exists
 */
router.post('/tasks/new', async (req, res) => {
  try {
    const { title, content, dueDate, priority = 'LOW' } = req.body || {};
    if (!title || !content || !dueDate) return fail(res, 'Invalid details', {}, 400);
    if (!isValidPriority(priority)) return fail(res, 'Invalid priority', {}, 400);
    if (Number(dueDate) <= Date.now()) return fail(res, "Can't create task with past due date", {}, 409);

    // Keep global uniqueness on title to mirror the old behavior
    const exists = await Task.findOne({ title }).lean();
    if (exists) return fail(res, `Task with title [${title}] already exists`, {}, 409);

    const status = computeStatusFromDueDate(dueDate);

    const created = await Task.create({
      title,
      content,
      dueDate: new Date(Number(dueDate)),
      priority,
      status,
      owner: req.user.id,
    });

    return ok(res, `Task created: id=${created._id}, title=${created.title}`, { task: toApiTask(created) }, 201);
  } catch (e) {
    return fail(res, 'Error creating task', { details: e.message }, 500);
  }
});

/**
 * @openapi
 * /tasks/size:
 *   get:
 *     summary: Count tasks by status (admin = all, user = own)
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ALL, PENDING, LATE, DONE]
 *         required: false
 *         description: Status filter (ALL by default)
 *     responses:
 *       200:
 *         description: Count
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         count:
 *                           type: integer
 *       400:
 *         description: Invalid status
 */
router.get('/tasks/size', async (req, res) => {
  try {
    const status = req.query.status || 'ALL';
    if (!isValidStatus(status)) return fail(res, 'Invalid status parameter', {}, 400);

    const baseFilter = isAdmin(req) ? {} : { owner: req.user.id };
    const filter = status === 'ALL' ? baseFilter : { ...baseFilter, status };

    const count = await Task.countDocuments(filter);
    return ok(res, `Tasks count for status [${status}]`, { count });
  } catch (e) {
    return fail(res, 'Error counting tasks', { details: e.message }, 500);
  }
});

/**
 * @openapi
 * /tasks/content:
 *   get:
 *     summary: List tasks (admin = all, user = own)
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ALL, PENDING, LATE, DONE]
 *         required: false
 *         description: Status filter (ALL by default)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [id, dueDate, title, priority, status]
 *         required: false
 *         description: "'id' maps to creation time (createdAt)"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         required: false
 *         description: Page size (max 100)
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         required: false
 *         description: Number of items to skip (offset)
 *     responses:
 *       200:
 *         description: Tasks content
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         tasks:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:       { type: string }
 *                               title:    { type: string }
 *                               content:  { type: string }
 *                               dueDate:  { type: integer }
 *                               priority: { type: string }
 *                               status:   { type: string }
 *                         meta:
 *                           type: object
 *                           properties:
 *                             total:   { type: integer }
 *                             limit:   { type: integer }
 *                             skip:    { type: integer }
 *                             hasMore: { type: boolean }
 *       400:
 *         description: Invalid status or sortBy
 */
router.get('/tasks/content', async (req, res) => {
  try {
    const status = req.query.status || 'ALL';
    const sortArg = normalizeSort(req.query.sortBy);

    // parse pagination params (default: limit=20, skip=0)
    const limitRaw = parseInt(req.query.limit, 10);
    const skipRaw = parseInt(req.query.skip, 10);
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 100) : 20;
    const skip = Number.isFinite(skipRaw) ? Math.max(skipRaw, 0) : 0;

    if (!isValidStatus(status) || !sortArg)
      return fail(res, 'Invalid status or sortBy', {}, 400);

    const baseFilter = isAdmin(req) ? {} : { owner: req.user.id };
    const filter = status === 'ALL' ? baseFilter : { ...baseFilter, status };

    // fetch paginated results + total count in parallel
    const [tasks, total] = await Promise.all([
      Task.find(filter).sort(sortArg).skip(skip).limit(limit).lean(),
      Task.countDocuments(filter),
    ]);

    const list = tasks.map(toApiTask);
    const hasMore = skip + list.length < total;

    return ok(res, 'Tasks content', {
      tasks: list,
      meta: { total, limit, skip, hasMore }
    });
  } catch (e) {
    return fail(res, 'Error listing tasks', { details: e.message }, 500);
  }
});

/**
 * @openapi
 * /tasks/status:
 *   put:
 *     summary: Update task status (owner only; admin any)
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *           description: Mongo ObjectId
 *         required: true
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, LATE, DONE]
 *         required: true
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Invalid id or status
 *       403:
 *         description: Forbidden (not your task)
 *       404:
 *         description: Task not found
 */
router.put('/tasks/status', async (req, res) => {
  try {
    const { id, status: newStatus } = req.query || {};
    if (!isValidObjectId(id) || !isValidStatus(newStatus)) return fail(res, 'Invalid id or status', {}, 400);

    const found = await Task.findById(id).lean();
    if (!found) return fail(res, `No task with id ${id}`, {}, 404);
    if (!isAdmin(req) && found.owner.toString() !== req.user.id) return fail(res, 'Forbidden: not your task', {}, 403);

    await Task.updateOne({ _id: id }, { $set: { status: newStatus } });
    return ok(res, `Task ${id} status updated to ${newStatus}`);
  } catch (e) {
    return fail(res, 'Error updating status', { details: e.message }, 500);
  }
});

/**
 * @openapi
 * /tasks/priority:
 *   put:
 *     summary: Update task priority (owner only; admin any)
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *           description: Mongo ObjectId
 *         required: true
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, MID, HIGH]
 *         required: true
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Invalid id or priority
 *       403:
 *         description: Forbidden (not your task)
 *       404:
 *         description: Task not found
 */
router.put('/tasks/priority', async (req, res) => {
  try {
    const { id, priority: newPriority } = req.query || {};
    if (!isValidObjectId(id) || !isValidPriority(newPriority)) return fail(res, 'Invalid id or priority', {}, 400);

    const found = await Task.findById(id).lean();
    if (!found) return fail(res, `No task with id ${id}`, {}, 404);
    if (!isAdmin(req) && found.owner.toString() !== req.user.id) return fail(res, 'Forbidden: not your task', {}, 403);

    await Task.updateOne({ _id: id }, { $set: { priority: newPriority } });
    return ok(res, `Task ${id} priority updated to ${newPriority}`);
  } catch (e) {
    return fail(res, 'Error updating priority', { details: e.message }, 500);
  }
});

/**
 * @openapi
 * /tasks:
 *   delete:
 *     summary: Delete task (owner only; admin any)
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *           description: Mongo ObjectId
 *         required: true
 *     responses:
 *       200:
 *         description: Deleted
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         left:
 *                           type: integer
 *       400:
 *         description: Invalid id
 *       403:
 *         description: Forbidden (not your task)
 *       404:
 *         description: Task not found
 */
router.delete('/tasks', async (req, res) => {
  try {
    const { id } = req.query || {};
    if (!isValidObjectId(id)) return fail(res, 'Invalid id', {}, 400);

    const found = await Task.findById(id).lean();
    if (!found) return fail(res, `No task with id ${id}`, {}, 404);
    if (!isAdmin(req) && found.owner.toString() !== req.user.id) return fail(res, 'Forbidden: not your task', {}, 403);

    await Task.deleteOne({ _id: id });

    // Return remaining count in the same visibility scope
    const baseFilter = isAdmin(req) ? {} : { owner: req.user.id };
    const left = await Task.countDocuments(baseFilter);

    return ok(res, `Task ${id} deleted`, { left });
  } catch (e) {
    return fail(res, 'Error deleting task', { details: e.message }, 500);
  }
});

module.exports = router;

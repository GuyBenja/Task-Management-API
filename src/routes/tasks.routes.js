const express = require('express');
const { ok, fail } = require('../utils/responses');
const { isValidPriority, isValidStatus, isValidSortBy, isValidId } = require('../utils/validators');
const { auth } = require('../middleware/auth');

const router = express.Router();

// הגנת כל ראוטי המשימות
router.use(auth);

const allTasks = [];
let tasksCounter = 1;

const isAdmin = (req) => req.user?.role === 'admin';

function getStatus(dueDate){ return dueDate > Date.now() ? 'PENDING' : 'LATE'; }
function isTaskExists(title){ return allTasks.some(t => t.title === title); }
function getTaskById(id){ return allTasks.find(t => t.id === parseInt(id)); }
function getTaskIndexById(id){ return allTasks.findIndex(t => t.id === parseInt(id)); }
function getFilteredTasks(status){ return status==='ALL' ? allTasks : allTasks.filter(t=> t.status===status); }
function getFilteredTasksForUser(req, status){
  const base = getFilteredTasks(status);
  return isAdmin(req) ? base : base.filter(t => t.owner === req.user.id);
}
function getSortedTasks(req, status, sortBy){
  const arr = getFilteredTasksForUser(req, status).slice();
  if (sortBy==='dueDate') arr.sort((a,b)=> a.dueDate - b.dueDate);
  else if (sortBy==='title') arr.sort((a,b)=> a.title.localeCompare(b.title));
  else arr.sort((a,b)=> a[sortBy]-b[sortBy]);
  return arr.map(({id,title,content,dueDate,priority,status})=>({id,title,content,dueDate,priority,status}));
}

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
 *                 type: integer
 *                 example: 4070908800000
 *               priority:
 *                 type: string
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
 *                       $ref: '#/components/schemas/TaskWrapper'
 *       400:
 *         description: Invalid details
 *       409:
 *         description: Past dueDate / Title exists
 */
router.post('/tasks/new', (req,res)=>{
  const { title, content, dueDate, priority='LOW' } = req.body || {};
  if (!title || !content || !dueDate) return fail(res,'Invalid details',{},400);
  if (!isValidPriority(priority)) return fail(res,'Invalid priority',{},400);
  if (dueDate <= Date.now()) return fail(res,"Can't create task with past due date",{},409);
  if (isTaskExists(title)) return fail(res,`Task with title [${title}] already exists`,{},409);

  const newTask = {
    id: tasksCounter++,
    title,
    content,
    dueDate,
    priority,
    status: getStatus(dueDate),
    owner: req.user.id // task owner
  };
  allTasks.push(newTask);
  return ok(res, `Task created: id=${newTask.id}, title=${newTask.title}`, { task: newTask }, 201);
});

/**
 * @openapi
 * /tasks/size:
 *   get:
 *     summary: Count tasks by status (admin = all, user = own)
 *     tags: [Tasks]
 *     parameters:
 *       - $ref: '#/components/parameters/StatusParam'
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
 *                       $ref: '#/components/schemas/Count'
 *       400:
 *         description: Invalid status
 */
router.get('/tasks/size', (req,res)=>{
  const status = req.query.status || 'ALL';
  if (!isValidStatus(status)) return fail(res,'Invalid status parameter',{},400);
  return ok(res, `Tasks count for status [${status}]`, { count: getFilteredTasksForUser(req, status).length });
});

/**
 * @openapi
 * /tasks/content:
 *   get:
 *     summary: List tasks (admin = all, user = own)
 *     tags: [Tasks]
 *     parameters:
 *       - $ref: '#/components/parameters/StatusParam'
 *       - $ref: '#/components/parameters/SortByParam'
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
 *                       $ref: '#/components/schemas/TaskList'
 *       400:
 *         description: Invalid status or sortBy
 */
router.get('/tasks/content', (req,res)=>{
  const status = req.query.status || 'ALL';
  const sortBy = (req.query.sortBy || 'id').toString().toLowerCase();
  if (!isValidStatus(status) || !isValidSortBy(sortBy)) return fail(res,'Invalid status or sortBy',{},400);
  return ok(res, 'Tasks content', { tasks: getSortedTasks(req, status, sortBy) });
});

/**
 * @openapi
 * /tasks/status:
 *   put:
 *     summary: Update task status (owner only; admin any)
 *     tags: [Tasks]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *       - $ref: '#/components/parameters/NewStatusParam'
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
router.put('/tasks/status', (req,res)=>{
  const { id, status:newStatus } = req.query || {};
  if (!isValidId(id) || !isValidStatus(newStatus)) return fail(res,'Invalid id or status',{},400);
  const task = getTaskById(id);
  if (!task) return fail(res,`No task with id ${id}`,{},404);
  if (!isAdmin(req) && task.owner !== req.user.id) return fail(res,'Forbidden: not your task',{},403);
  task.status = newStatus;
  return ok(res, `Task ${id} status updated to ${newStatus}`);
});

/**
 * @openapi
 * /tasks/priority:
 *   put:
 *     summary: Update task priority (owner only; admin any)
 *     tags: [Tasks]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *       - $ref: '#/components/parameters/NewPriorityParam'
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
router.put('/tasks/priority', (req,res)=>{
  const { id, priority:newPriority } = req.query || {};
  if (!isValidId(id) || !isValidPriority(newPriority)) return fail(res,'Invalid id or priority',{},400);
  const task = getTaskById(id);
  if (!task) return fail(res,`No task with id ${id}`,{},404);
  if (!isAdmin(req) && task.owner !== req.user.id) return fail(res,'Forbidden: not your task',{},403);
  task.priority = newPriority;
  return ok(res, `Task ${id} priority updated to ${newPriority}`);
});

/**
 * @openapi
 * /tasks:
 *   delete:
 *     summary: Delete task (owner only; admin any)
 *     tags: [Tasks]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
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
 *                           example: 0
 *       400:
 *         description: Invalid id
 *       403:
 *         description: Forbidden (not your task)
 *       404:
 *         description: Task not found
 */
router.delete('/tasks', (req,res)=>{
  const id = parseInt(req.query.id);
  if (!isValidId(id)) return fail(res,'Invalid id',{},400);

  const task = getTaskById(id);
  if (!task) return fail(res,`No task with id ${id}`,{},404);
  if (!isAdmin(req) && task.owner !== req.user.id) return fail(res,'Forbidden: not your task',{},403);

  const idx = getTaskIndexById(id);
  allTasks.splice(idx,1);
  return ok(res, `Task ${id} deleted`, { left: allTasks.length });
});

module.exports = router;

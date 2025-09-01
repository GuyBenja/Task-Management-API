const express = require('express');
const { ok, fail } = require('../utils/responses');
const { isValidPriority, isValidStatus, isValidSortBy, isValidId } = require('../utils/validators');

const router = express.Router();

const allTasks = [];
let tasksCounter = 1;

function getStatus(dueDate){ return dueDate > Date.now() ? 'PENDING' : 'LATE'; }
function isTaskExists(title){ return allTasks.some(t => t.title === title); }
function getTaskById(id){ return allTasks.find(t => t.id === parseInt(id)); }
function getTaskIndexById(id){ return allTasks.findIndex(t => t.id === parseInt(id)); }
function getFilteredTasks(status){ return status==='ALL' ? allTasks : allTasks.filter(t=> t.status===status); }
function getSortedTasks(status, sortBy){
  const arr = getFilteredTasks(status).slice();
  if (sortBy==='dueDate') arr.sort((a,b)=> a.dueDate - b.dueDate);
  else if (sortBy==='title') arr.sort((a,b)=> a.title.localeCompare(b.title));
  else arr.sort((a,b)=> a[sortBy]-b[sortBy]);
  return arr.map(({id,title,content,dueDate,priority,status})=>({id,title,content,dueDate,priority,status}));
}

router.post('/tasks/new', (req,res)=>{
  const { title, content, dueDate, priority='LOW' } = req.body || {};
  if (!title || !content || !dueDate) return fail(res,'Invalid details',{},400);
  if (!isValidPriority(priority)) return fail(res,'Invalid priority',{},400);
  if (dueDate <= Date.now()) return fail(res,"Can't create task with past due date",{},409);
  if (isTaskExists(title)) return fail(res,`Task with title [${title}] already exists`,{},409);

  const newTask = { id: tasksCounter++, title, content, dueDate, priority, status: getStatus(dueDate) };
  allTasks.push(newTask);
  return ok(res, `Task created: id=${newTask.id}, title=${newTask.title}`, { task: newTask }, 201);
});

router.get('/tasks/size', (req,res)=>{
  const status = req.query.status || 'ALL';
  if (!isValidStatus(status)) return fail(res,'Invalid status parameter',{},400);
  return ok(res, `Tasks count for status [${status}]`, { count: getFilteredTasks(status).length });
});

router.get('/tasks/content', (req,res)=>{
  const status = req.query.status || 'ALL';
  const sortBy = (req.query.sortBy || 'id').toString().toLowerCase();
  if (!isValidStatus(status) || !isValidSortBy(sortBy)) return fail(res,'Invalid status or sortBy',{},400);
  return ok(res, 'Tasks content', { tasks: getSortedTasks(status, sortBy) });
});

router.put('/tasks/status', (req,res)=>{
  const { id, status:newStatus } = req.query || {};
  if (!isValidId(id) || !isValidStatus(newStatus)) return fail(res,'Invalid id or status',{},400);
  const task = getTaskById(id);
  if (!task) return fail(res,`No task with id ${id}`,{},404);
  task.status = newStatus;
  return ok(res, `Task ${id} status updated to ${newStatus}`);
});

router.put('/tasks/priority', (req,res)=>{
  const { id, priority:newPriority } = req.query || {};
  if (!isValidId(id) || !isValidPriority(newPriority)) return fail(res,'Invalid id or priority',{},400);
  const task = getTaskById(id);
  if (!task) return fail(res,`No task with id ${id}`,{},404);
  task.priority = newPriority;
  return ok(res, `Task ${id} priority updated to ${newPriority}`);
});

router.delete('/tasks', (req,res)=>{
  const id = parseInt(req.query.id);
  if (!isValidId(id)) return fail(res,'Invalid id',{},400);
  const idx = getTaskIndexById(id);
  if (idx === -1) return fail(res,`No task with id ${id}`,{},404);
  allTasks.splice(idx,1);
  return ok(res, `Task ${id} deleted`, { left: allTasks.length });
});

module.exports = router;
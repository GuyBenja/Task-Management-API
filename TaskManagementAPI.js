const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3101;

app.use(bodyParser.json());
app.use(cookieParser());
app.use(setStartTime);
require('dotenv').config();

const mongoConnectionString = process.env.MONGODB_CONNECTION_STRING;

// MongoDB connection
mongoose.connect(mongoConnectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define user schema and model
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

// Define the User model
const User = mongoose.model('User', userSchema);

// Middleware function to authenticate user
function authenticateUser(req, res, next) {
  // Extract the token from the request headers
  const token = req.cookies.token;

  // Check if the token is present
  if (!token) {
    return res.status(401).json({
      errorMessage: 'Authentication failed: Token missing',
    });
  }

  try {
    // Verify the token using your secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded user information to the request for further processing
    req.user = decoded;

    // Call next to proceed to the next middleware or route handler
    next();
  } catch (error) {
    // If the token is invalid or expired, return a 401 Unauthorized response
    res.status(401).json({
      errorMessage: 'Authentication failed: Invalid token',
    });
  }
}

// Endpoint to register a new user
app.post('/auth/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      errorMessage: 'Invalid username or password',
    });
  }

  try {
    // Check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({
        errorMessage: 'Username already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      password: hashedPassword,
    });
    await newUser.save();

    res.status(201).json({
      message: `User ${username} registered successfully`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errorMessage: 'Error registering user',
    });
  }
});

// Endpoint to login
app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      errorMessage: 'Invalid username or password',
    });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({
        errorMessage: 'Invalid username or password',
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        errorMessage: 'Invalid username or password',
      });
    }

    // If login is successful, generate a token
    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Set the token as an HTTP-only cookie
    res.cookie('token', token, { httpOnly: false });

    res.status(200).json({
      message: 'Login successful',
      token: token, 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errorMessage: 'Error during login',
    });
  }
});

// All other routes require authentication
app.use(authenticateUser);

const allTasks = [];
let tasksCounter=1;

// Endpoint to check the health of the server
app.get('/tasks/health', (req, res) => {
  res.status(200).send('Welcome, the server is up and running');
});

// Endpoint to create a new task item in the system
app.post('/tasks/new', (req, res) => {
  const { title, content, dueDate, priority = 'LOW' } = req.body;

  if (!title || !content || !dueDate) {
    return res.status(400).json({
      errorMessage: "Invalid Details"
    });
  }

  if (!isValidPriority(priority)) {
    return res.status(400).json({
      errorMessage: "Invalid Priority"
    });
  }

  if (dueDate <= Date.now()) {
    return res.status(409).json({
      errorMessage: "Error: Can't create a new task with a due date in the past"
    });
  }

  if (isTaskExists(title)) {
    return res.status(409).json({
      errorMessage: `Error: Task with the title:[${title}] already exists in the system`
    });
  }

  const newTask = createNewTask(title, content, dueDate, priority);
  res.status(201).json({
    message: `Task with id:[${newTask.id}] and title:[${newTask.title}] has been created`
  });
});

// Endpoint to return the total number of tasks in the system
app.get('/tasks/size', (req, res) => {
  const status = req.query.status || 'ALL';

  if (!isValidStatus(status)) {
    return res.status(400).json({
      errorMessage: 'Error: Invalid status parameter'
    });
  }

  const tasksCount = getFilteredTasks(status).length;

  res.status(200).json({
    message: `The number of tasks left with status:[${status}] is:[${tasksCount}]`
  });
});

// Endpoint to return the content of the tasks according to the supplied status
app.get('/tasks/content', (req, res) => {
  const status = req.query.status || 'ALL';
  const sortBy = req.query.sortBy || 'id';

  if (!isValidStatus(status) || !isValidSortBy(sortBy)) {
    return res.status(400).json({
      errorMessage: 'Error: Invalid status or sortBy parameter'
    });
  }

  const tasksData = getSortedTasks(status, sortBy);
  res.status(200).json(tasksData);
});

// Endpoint to update task status property
app.put('/tasks/status', (req, res) => {
  const { id, status: newStatus } = req.query;

  if (!isValidId(id) || !isValidStatus(newStatus)) {
    return res.status(400).json({
      errorMessage: 'Error: Invalid id or status parameter'
    });
  }

  const taskToUpdate = getTaskById(id);
  if (!taskToUpdate) {
    return res.status(404).json({
      errorMessage: `Error: No such task with id ${id}`
    });
  }

  taskToUpdate.status = newStatus;
  res.status(200).json({
    message: `Task with id:[${id}] has been changed to status:[${newStatus}]`
  });
});

// Endpoint to update task priority property
app.put('/tasks/priority', (req, res) => {
  const { id, priority: newPriority } = req.query;

  if (!isValidId(id) || !isValidPriority(newPriority)) {
    return res.status(400).json({
      errorMessage: 'Error: Invalid id or priority parameter'
    });
  }

  const taskToUpdate = getTaskById(id);
  if (!taskToUpdate) {
    return res.status(404).json({
      errorMessage: `Error: No such task with id ${id}`
    });
  }

  taskToUpdate.priority = newPriority;
  res.status(200).json({
    message: `Task with id:[${id}] has been changed to priority[${newPriority}]`
  });
});

// Endpoint to delete a task object
app.delete('/tasks', (req, res) => {
  const id = parseInt(req.query.id);

  if (!isValidId(id)) {
    return res.status(400).json({
      errorMessage: 'Error: Invalid id parameter'
    });
  }

  const taskIndex = getTaskIndexById(id);

  if (taskIndex === -1) {
    return res.status(404).json({
      errorMessage: `Error: No such task with id ${id}`
    });
  }

  allTasks.splice(taskIndex, 1);

  res.status(200).json({
    message: `Task with id:[${id}] has been deleted, there are [${allTasks.length}] tasks left`
  });
});

// Middleware function to set the start time
function setStartTime(req, res, next) {
  req.startTime = Date.now();
  next();
}

// Helper function to check if priority is valid
function isValidPriority(priority) {
  return ['LOW', 'MID', 'HIGH'].includes(priority);
}

// Helper function to check if status is valid
function isValidStatus(status) {
  return ['ALL', 'PENDING', 'LATE', 'DONE'].includes(status);
}

// Helper function to check if sortBy parameter is valid
function isValidSortBy(sortBy) {
  return ['id', 'dueDate', 'title'].includes(sortBy);
}

// Helper function to check if ID parameter is valid
function isValidId(id) {
  return !isNaN(parseInt(id));
}

// Helper function to check if task with the given title already exists
function isTaskExists(title) {
  return allTasks.some(task => task.title === title);
}

// Helper function to create a new task
function createNewTask(title, content, dueDate, priority) {
  const newTask = {
    id: tasksCounter++,
    title,
    content,
    dueDate,
    priority,
    status: getStatus(dueDate)
  };
  allTasks.push(newTask);
  return newTask;
}

// Helper function to get filtered tasks
function getFilteredTasks(status) {
  return status === 'ALL' ? allTasks : allTasks.filter(task => task.status === status);
}

// Helper function to get sorted tasks
function getSortedTasks(status, sortBy) {
  const filteredTasks = getFilteredTasks(status);

  if (sortBy === 'dueDate') {
    filteredTasks.sort((a, b) => a.dueDate - b.dueDate);
  } else if (sortBy === 'title') {
    filteredTasks.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    filteredTasks.sort((a, b) => a[sortBy] - b[sortBy]);
  }

  return filteredTasks.map(task => ({
    id: task.id,
    title: task.title,
    content: task.content,
    dueDate: task.dueDate,
    priority: task.priority,
    status: task.status
  }));
}

// Helper function to get task by ID
function getTaskById(id) {
  return allTasks.find(task => task.id === parseInt(id));
}

// Helper function to get task index by ID
function getTaskIndexById(id) {
  return allTasks.findIndex(task => task.id === parseInt(id));
}

// Helper function to get task status based on due date
function getStatus(dueDate) {
  const currentDate = Date.now();
  return dueDate > currentDate ? 'PENDING' : 'LATE';
}

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
});
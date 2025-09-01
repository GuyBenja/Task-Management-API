require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth.routes');
const taskRoutes = require('./routes/tasks.routes');
const { auth } = require('./middleware/auth');
const { errorHandler } = require('./middleware/error');

const app = express();

app.use(express.json());         // במקום body-parser.json()
app.use(cookieParser());

// health + auth
app.use(authRoutes);

// protected routes
app.use(auth, taskRoutes);

// 404
app.all('*', (req,res)=> res.status(404).json({ success:false, message:'Route not found', data:null, error:{} }));

// error handler
app.use(errorHandler);

module.exports = app;
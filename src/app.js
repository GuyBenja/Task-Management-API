require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth.routes');
const taskRoutes = require('./routes/tasks.routes');
const { auth } = require('./middleware/auth');
const { errorHandler } = require('./middleware/error');

const app = express();

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// Swagger צריך לבוא לפני ה-auth
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(express.json());
app.use(cookieParser());

// health + auth
app.use(authRoutes);

// ראוטים מוגנים
app.use(auth, taskRoutes);

// 404
app.all('*', (req,res)=> 
  res.status(404).json({ success:false, message:'Route not found', data:null, error:{} })
);

// error handler
app.use(errorHandler);

module.exports = app;

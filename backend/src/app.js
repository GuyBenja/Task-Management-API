// Load environment variables from .env files
require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const taskRoutes = require('./routes/tasks.routes');
const { auth } = require('./middleware/auth');
const { errorHandler } = require('./middleware/error');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const app = express();

// --- Security & platform middlewares ---------------------------------------
// Trust reverse proxies for correct client IPs (Heroku/Render/Nginx/etc.)
app.set('trust proxy', 1);

const isTest = process.env.NODE_ENV === 'test';
const isProd = process.env.NODE_ENV === 'production';

// Helmet: loosen CSP in dev/test to avoid Swagger UI issues
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: isProd ? undefined : false,
  })
);

// CORS: allow list via env (comma-separated). Default: "*"
const allowedOrigins = (process.env.CORS_ORIGINS || '*')
  .split(',')
  .map((s) => s.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow server-to-server/tools without Origin header
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return cb(null, true);
      }
      return cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// Global rate limiter (skipped in tests)
if (!isTest) {
  const windowMinutes = parseInt(process.env.RATE_WINDOW_MINUTES || '15', 10);
  const maxRequests = parseInt(process.env.RATE_MAX || '100', 10);
  app.use(
    rateLimit({
      windowMs: windowMinutes * 60 * 1000,
      max: maxRequests,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: 'Too many requests',
        data: null,
        error: { code: 429 },
      },
    })
  );
}

// --- Body & cookies ---------------------------------------------------------
app.use(express.json());
app.use(cookieParser());

// --- Swagger (disabled in tests to keep CI stable) --------------------------
// Note: If you serve Swagger in production behind Helmet CSP, you may need to
// disable CSP or configure directives to allow Swagger assets.
if (!isTest) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// --- Routes -----------------------------------------------------------------
// Public routes (no auth)
app.use(authRoutes);

// Protected routes (require JWT cookie)
app.use(auth, taskRoutes);

// Catch-all 404 for unknown routes
app.all('*', (req, res) =>
  res
    .status(404)
    .json({ success: false, message: 'Route not found', data: null, error: {} })
);

// Centralized error handler
app.use(errorHandler);

module.exports = app;

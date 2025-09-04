// src/server.js (or server.js at your chosen path)
const app = require('./app');
const { connectDB } = require('./config/db');

const { PORT = 3000 } = process.env;

// Connect to DB first, then start HTTP server bound to all interfaces
connectDB()
  .then(() => {
    // Bind to 0.0.0.0 so devices on the LAN (e.g., iPhone) can reach the server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server listening on http://0.0.0.0:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });

const app = require('./app');
const { connectDB } = require('./config/db');

const { PORT = 3000, MONGODB_CONNECTION_STRING } = process.env;

connectDB(MONGODB_CONNECTION_STRING)
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 Server listening on ${PORT}`));
  })
  .catch(err => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });
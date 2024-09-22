const express = require('express');
const swaggerUi = require('swagger-ui-express');
const connectDB = require('./config/db');  // MongoDB connection
const authRoutes = require('./routes/authRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const swaggerDocs = require('./config/swagger');  // Swagger setup
const errorHandler = require('./middlewares/errorHandler'); // Error handling middleware
const logger = require('./middlewares/logger'); // Request logging middleware
const authenticate = require('./middlewares/authMiddleware'); // Authentication middleware
require('dotenv').config();  // Load environment variables
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Connect to the MongoDB database
connectDB();

// Enable CORS
app.use(cors());
// Middleware to parse JSON
app.use(express.json());
app.use(logger);  // Use the logger middleware for all routes

// Swagger API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/recommendations', authenticate, recommendationRoutes); // Protect recommendation routes with auth middleware

// Error handling middleware (should be the last middleware)
app.use(errorHandler);

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

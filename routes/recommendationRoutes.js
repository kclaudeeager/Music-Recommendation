const express = require('express');
const recommendationController = require('../controllers/recommendationController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Route for generating recommendations
router.get('/recommendations', authMiddleware, recommendationController.generateRecommendations);

module.exports = router;

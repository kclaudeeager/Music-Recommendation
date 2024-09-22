const express = require('express');
const recommendationController = require('../controllers/recommendationController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/recommendations:
 *   get:
 *     summary: Generate music recommendations
 *     description: Generate music recommendations based on user preferences and listening history.
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of recommended tracks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   trackId:
 *                     type: string
 *                     description: The ID of the track
 *                   trackName:
 *                     type: string
 *                     description: The name of the track
 *                   artistName:
 *                     type: string
 *                     description: The name of the artist
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', authMiddleware, recommendationController.generateRecommendations);

module.exports = router;
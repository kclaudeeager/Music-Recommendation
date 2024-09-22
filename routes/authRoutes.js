const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

/**
 * @swagger
 * /api/auth/login:
 *   get:
 *     summary: Redirect to Spotify for authentication
 *     responses:
 *       302:
 *         description: Redirects to Spotify authorization URL
 */
router.get('/login', authController.login);

/**
 * @swagger
 * /api/auth/callback:
 *   get:
 *     summary: Handle Spotify OAuth callback
 *     responses:
 *       200:
 *         description: Authentication successful
 *       500:
 *         description: Authentication failed
 */
router.get('/callback', authController.callback);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   get:
 *     summary: Refresh Spotify access token
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       500:
 *         description: Token refresh failed
 */
router.get('/refresh-token', authController.refreshToken);

module.exports = router;

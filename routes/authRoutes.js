const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Endpoints for Spotify authentication
 */

/**
 * @swagger
 * /api/auth/login:
 *   get:
 *     summary: Redirect to Spotify login
 *     description: Redirect to Spotify login for user authentication.
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirect to Spotify authorization URL
 */
router.get('/login', authController.login);

/**
 * @swagger
 * /api/auth/callback:
 *   get:
 *     summary: Handle Spotify callback
 *     description: Handle Spotify callback after user authentication.
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Authentication successful
 *       500:
 *         description: Authentication failed
 */
router.get('/callback', authController.callback);

/**
 * @swagger
 * /api/auth/token:
 *   get:
 *     summary: Obtain Spotify access token using client credentials
 *     description: Obtain Spotify access token using client credentials.
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Access token obtained successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                   description: The access token
 *       500:
 *         description: Error obtaining access token
 */
router.get('/token', authController.getClientCredentialsToken);

/**
 * @swagger
 * /api/auth/refreshtoken:
 *   get:
 *     summary: Refresh Spotify access token
 *     description: Refresh Spotify access token using refresh token.
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Authentication successful
 *       500:
 *         description: Authentication failed
 */
router.get('/refreshtoken', authController.refreshToken);

module.exports = router;
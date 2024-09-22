const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const querystring = require('querystring');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

console.log('MONGODB_URI:', process.env.MONGODB_URI);
// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Define User model (you can move this to a separate file later)
const UserSchema = new mongoose.Schema({
  spotifyId: String,
  accessToken: String,
  refreshToken: String
});

const User = mongoose.model('User', UserSchema);

// Spotify API credentials
const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = process.env.PRODUCTION_REDIRECT_URI || 'http://localhost:3000/callback'; // Update this when you deploy

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Spotify Auth API',
      version: '1.0.0',
      description: 'API for Spotify Authentication'
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Local server'
      },
      {
        url: `https://music-recommendation-vyd9.onrender.com`,
        description: 'Production server'
      }
    ]
  },
  apis: ['./app.js']
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /login:
 *   get:
 *     description: Redirect to Spotify login
 *     responses:
 *       302:
 *         description: Redirect to Spotify authorization URL
 */
app.get('/login', (req, res) => {
  const scope = 'user-read-private user-read-email user-top-read';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri
    }));
});

/**
 * @swagger
 * /callback:
 *   get:
 *     description: Handle Spotify callback
 *     responses:
 *       200:
 *         description: Authentication successful
 *       500:
 *         description: Authentication failed
 */
app.get('/callback', async (req, res) => {
  const code = req.query.code || null;

  try {
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      params: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
      }
    });

    const { access_token, refresh_token } = response.data;

    // Get user profile
    const userResponse = await axios.get('https://api.spotify.com/v1/me', {
      headers: { 'Authorization': 'Bearer ' + access_token }
    });

    const spotifyId = userResponse.data.id;

    // Save or update user in database
    await User.findOneAndUpdate(
      { spotifyId: spotifyId },
      { accessToken: access_token, refreshToken: refresh_token },
      { upsert: true, new: true }
    );

    res.send('Authentication successful! You can close this window.');
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('Authentication failed');
  }
});

/**
 * @swagger
 * /token:
 *   get:
 *     description: Obtain Spotify access token using client credentials
 *     responses:
 *       200:
 *         description: Access token obtained successfully
 *       500:
 *         description: Error obtaining access token
 */
app.get('/token', async (req, res) => {
  const client_credentials = `${client_id}:${client_secret}`;
  const client_credentials_base64 = Buffer.from(client_credentials).toString('base64');

  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', null, {
      headers: {
        'Authorization': `Basic ${client_credentials_base64}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      params: {
        'grant_type': 'client_credentials'
      }
    });

    if (response.status === 200) {
      const access_token = response.data.access_token;
      res.json({ access_token });
    } else {
      res.status(response.status).send('Error obtaining access token');
    }
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('Error obtaining access token');
  }
});

// TODO: Add routes for recommendations here

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
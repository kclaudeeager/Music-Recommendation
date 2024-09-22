const querystring = require('querystring');
const axios = require('axios');
const crypto = require('crypto'); // Import the crypto module
const User = require('../models/User');
const { client_id, client_secret, redirect_uri } = require('../config/spotifyConfig');

// Generate a random state parameter
const generateRandomString = (length) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from(crypto.randomBytes(length)).map(x => possible[x % possible.length]).join('');
};

// Spotify login (redirect user to Spotify for authentication)
const login = (req, res) => {
  const state = generateRandomString(16);
  const scope = 'user-read-private user-read-email';
  
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
};

// Spotify OAuth callback (handle authentication response)
const callback = async (req, res) => {
  const code = req.query.code || null;

  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', 
      querystring.stringify({
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      }), {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

    const { access_token, refresh_token } = response.data;

    // Get user profile from Spotify API
    const userProfile = await axios.get('https://api.spotify.com/v1/me', {
      headers: { 'Authorization': `Bearer ${access_token}` }
    });

    const spotifyId = userProfile.data.id;

    // Save or update user in MongoDB
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
};

// Refresh Spotify access token
const refreshToken = async (req, res) => {
  const { spotifyId } = req.query;

  try {
    const user = await User.findOne({ spotifyId });
    if (!user) {
      return res.status(404).send('User not found');
    }

    const response = await axios.post('https://accounts.spotify.com/api/token', 
      querystring.stringify({
        grant_type: 'refresh_token',
        refresh_token: user.refreshToken,
      }), {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

    const newAccessToken = response.data.access_token;

    // Update access token in the database
    user.accessToken = newAccessToken;
    await user.save();

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error('Error refreshing token:', error.message);
    res.status(500).send('Error refreshing token');
  }
};

const getClientCredentialsToken = async (req, res) => {
    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: querystring.stringify({
        grant_type: 'client_credentials',
        client_id: client_id,
        client_secret: client_secret
      })
    };
  
    try {
      const response = await axios.post(authOptions.url, authOptions.data, { headers: authOptions.headers });
      if (response.status === 200) {
        const accessToken = response.data.access_token;
  
        // Save or update user in MongoDB
        await User.findOneAndUpdate(
          { spotifyId: 'client_credentials' }, // Use a fixed ID for client credentials
          { accessToken: accessToken },
          { upsert: true, new: true }
        );
  
        req.access_token = accessToken;
        res.json({ access_token: accessToken });
      } else {
        res.status(response.status).send('Error obtaining access token');
      }
    } catch (error) {
      console.error('Error:', error.message);
      res.status(500).send('Error obtaining access token');
    }
  };

module.exports = {
  login,
  callback,
  getClientCredentialsToken,
  refreshToken
};
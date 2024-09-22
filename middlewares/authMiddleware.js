const User = require('../models/User');
const axios = require('axios');
const querystring = require('querystring');
const { client_id, client_secret } = require('../config/spotifyConfig');

const authMiddleware = async (req, res, next) => {
  const spotifyId = req.params.spotifyId;

  try {
    const user = await User.findOne({ spotifyId });
    if (!user || !user.accessToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if the token is still valid
    try {
      await axios.get('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${user.accessToken}` }
      });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Token is invalid, refresh it
        const refreshResponse = await axios.post('https://accounts.spotify.com/api/token', 
          querystring.stringify({
            grant_type: 'refresh_token',
            refresh_token: user.refreshToken,
          }), {
            headers: {
              'Authorization': 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64'),
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          });

        const newAccessToken = refreshResponse.data.access_token;
        user.accessToken = newAccessToken;
        await user.save();
      } else {
        return res.status(500).json({ error: 'Server error' });
      }
    }

    req.user = user; // Attach user to request object
    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = authMiddleware;
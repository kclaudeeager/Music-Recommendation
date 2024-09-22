const User = require('../models/User');
const axios = require('axios');

const authMiddleware = async (req, res, next) => {
  const spotifyId = req.params.spotifyId;

  try {
    const user = await User.findOne({ spotifyId });
    if (!user || !user.accessToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if the token is still valid, otherwise refresh it
    const tokenValid = await axios.get('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${user.accessToken}` }
    });

    if (tokenValid.status !== 200) {
      return res.status(401).json({ error: 'Invalid Token' });
    }

    req.user = user; // Attach user to request object
    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = authMiddleware;

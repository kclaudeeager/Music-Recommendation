const axios = require('axios');

// Function to refresh access token
async function refreshAccessToken(refreshToken, clientId, clientSecret) {
  const params = new URLSearchParams();
  params.append('grant_type', 'refresh_token');
  params.append('refresh_token', refreshToken);

  const response = await axios.post('https://accounts.spotify.com/api/token', params, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  return response.data.access_token;
}

// Fetch song features (danceability, energy, etc.)
async function getTrackFeatures(accessToken, trackId) {
  const response = await axios.get(`https://api.spotify.com/v1/audio-features/${trackId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  return response.data;
}

module.exports = {
  getTrackFeatures,
  refreshAccessToken
};

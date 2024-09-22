module.exports = {
    client_id: process.env.SPOTIFY_CLIENT_ID,
    client_secret: process.env.SPOTIFY_CLIENT_SECRET,
    redirect_uri: process.env.REDIRECT_URI || 'http://localhost:3000/auth/callback'
  };
  
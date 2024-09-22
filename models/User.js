const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  spotifyId: { type: String, unique: true },
  accessToken: String,
  refreshToken: String,
  likedSongs: [String], // Song IDs of liked songs
  skippedSongs: [String], // Song IDs of skipped songs
  listeningHistory: [{
    songId: String,
    duration: Number // How long the song was listened to
  }],
    recommendations: [{
        songId: String,
        reason: String // Reason for recommendation (e.g. "Based on your listening history")
    }],
    listeningBehavior: [{
        trackId: String,
        timestamp: { type: Date, default: Date.now },
        action: String,  // e.g., 'play', 'skip', 'like'
      }]
});

const User = mongoose.model('User', UserSchema);
module.exports = User;

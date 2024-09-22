const mongoose = require('mongoose');

const SongFeaturesSchema = new mongoose.Schema({
  songId: { type: String, unique: true }, // Spotify Track ID
  danceability: Number,
  energy: Number,
  valence: Number,
  tempo: Number,
  loudness: Number,
  acousticness: Number,
  instrumentalness: Number,
  liveness: Number,
  speechiness: Number,
  mode: Number,
});

const SongFeatures = mongoose.model('SongFeatures', SongFeaturesSchema);
module.exports = SongFeatures;

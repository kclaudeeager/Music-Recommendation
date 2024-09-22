const SongFeatures = require('../models/SongFeatures');
const spotifyService = require('../services/spotifyService');
const recommendationService = require('../services/recommendationService');

// Function to generate recommendations
const generateRecommendations = async (req, res) => {
  const { trackId } = req.query;

  try {
    // Check if track features are already cached
    let songFeatures = await SongFeatures.findOne({ songId: trackId });

    if (!songFeatures) {
      // Fetch track features from Spotify API if not cached
      songFeatures = await spotifyService.getTrackFeatures(req.user.accessToken, trackId);

      // Cache the song features in MongoDB
      const newSong = new SongFeatures({
        songId: trackId,
        ...songFeatures
      });

      await newSong.save();
    }

    // Call the recommendation service
    const recommendations = await recommendationService.getRecommendationsBasedOnFeatures(songFeatures);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: 'Error generating recommendations' });
  }
};

module.exports = { generateRecommendations };

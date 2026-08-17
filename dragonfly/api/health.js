// GET /api/health — is the narrator configured (boolean only, never the key).
module.exports = (req, res) => {
  return res.status(200).json({ elevenlabs: Boolean(process.env.ELEVENLABS_API_KEY) });
};

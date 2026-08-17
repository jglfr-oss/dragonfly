// GET /api/voices — ElevenLabs voices, filtered to the dragonfly collection
// when ELEVENLABS_COLLECTION_ID is set; falls back to all My Voices.
module.exports = async (req, res) => {
  if (req.method !== "GET") return res.status(405).json({ error: "GET only" });
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return res.status(503).json({ error: "ElevenLabs key not configured" });
  const cid = process.env.ELEVENLABS_COLLECTION_ID;
  const url = cid
    ? `https://api.elevenlabs.io/v2/voices?collection_id=${encodeURIComponent(cid)}&page_size=100`
    : "https://api.elevenlabs.io/v1/voices";
  try {
    const upstream = await fetch(url, { headers: { "xi-api-key": key } });
    if (!upstream.ok) return res.status(upstream.status).json({ error: "voice list failed" });
    const data = await upstream.json();
    const voices = (data.voices || []).map((v) => ({ voice_id: v.voice_id, name: v.name }));
    res.setHeader("Cache-Control", "s-maxage=300");
    return res.status(200).json({ voices });
  } catch (e) {
    return res.status(500).json({ error: "voice proxy failed" });
  }
};

// GET /api/voices — ElevenLabs voice list (custom voices appear automatically).
module.exports = async (req, res) => {
  if (req.method !== "GET") return res.status(405).json({ error: "GET only" });
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return res.status(503).json({ error: "ElevenLabs key not configured" });
  try {
    const upstream = await fetch("https://api.elevenlabs.io/v1/voices", {
      headers: { "xi-api-key": key },
    });
    if (!upstream.ok) return res.status(upstream.status).json({ error: "voice list failed" });
    const data = await upstream.json();
    const voices = (data.voices || []).map((v) => ({ voice_id: v.voice_id, name: v.name }));
    res.setHeader("Cache-Control", "s-maxage=300");
    return res.status(200).json({ voices });
  } catch (e) {
    return res.status(500).json({ error: "voice proxy failed" });
  }
};

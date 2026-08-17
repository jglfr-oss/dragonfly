// POST /api/tts  { voiceId, text } -> mp3 audio
// ElevenLabs proxy: the key lives in Vercel env vars, never in the client.
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const { voiceId, text } = req.body || {};
  if (!text || typeof text !== "string" || text.length > 2000) {
    return res.status(400).json({ error: "text required (max 2000 chars)" });
  }
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return res.status(503).json({ error: "ElevenLabs key not configured" });
  try {
    const upstream = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId || "")}`,
      {
        method: "POST",
        headers: { "xi-api-key": key, "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.6, similarity_boost: 0.75, style: 0.25 },
        }),
      }
    );
    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => "");
      return res.status(upstream.status).json({ error: detail.slice(0, 200) });
    }
    const buf = Buffer.from(await upstream.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(buf);
  } catch (e) {
    return res.status(500).json({ error: "tts proxy failed" });
  }
};

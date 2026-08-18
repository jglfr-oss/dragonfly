// GET /api/voices — collection voices when configured AND non-empty,
// otherwise all My Voices. Never returns an empty list if v1 has voices.
module.exports = async (req, res) => {
  if (req.method !== "GET") return res.status(405).json({ error: "GET only" });
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return res.status(503).json({ error: "ElevenLabs key not configured" });
  const cid = process.env.ELEVENLABS_COLLECTION_ID;
  const map = (d) => (d.voices || []).map((v) => ({ voice_id: v.voice_id, name: v.name }));

  try {
    if (cid) {
      const r2 = await fetch(
        `https://api.elevenlabs.io/v2/voices?collection_id=${encodeURIComponent(cid)}&voice_type=saved&page_size=100`,
        { headers: { "xi-api-key": key } }
      );
      if (r2.ok) {
        const voices = map(await r2.json());
        if (voices.length) {
          res.setHeader("Cache-Control", "s-maxage=300");
          return res.status(200).json({ voices });
        }
      }
      // empty or errored -> fall through to full list
    }
    const r1 = await fetch("https://api.elevenlabs.io/v1/voices", {
      headers: { "xi-api-key": key },
    });
    if (!r1.ok) return res.status(r1.status).json({ error: "voice list failed" });
    const voices = map(await r1.json());
    res.setHeader("Cache-Control", "s-maxage=300");
    return res.status(200).json({ voices });
  } catch (e) {
    return res.status(500).json({ error: "voice proxy failed" });
  }
};

// GET /api/voices — dragonfly-collection voices via v2, falling back to all
// My Voices via v1 if the collection query fails. ?debug=1 shows the v2 error.
module.exports = async (req, res) => {
  if (req.method !== "GET") return res.status(405).json({ error: "GET only" });
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return res.status(503).json({ error: "ElevenLabs key not configured" });
  const cid = process.env.ELEVENLABS_COLLECTION_ID;
  const debug = req.query && req.query.debug;
  let v2error = null;

  try {
    if (cid) {
      const r2 = await fetch(
        `https://api.elevenlabs.io/v2/voices?collection_id=${encodeURIComponent(cid)}&page_size=100`,
        { headers: { "xi-api-key": key } }
      );
      if (r2.ok) {
        const data = await r2.json();
        const voices = (data.voices || []).map((v) => ({ voice_id: v.voice_id, name: v.name }));
        res.setHeader("Cache-Control", "s-maxage=300");
        return res.status(200).json({ voices });
      }
      v2error = { status: r2.status, body: (await r2.text().catch(() => "")).slice(0, 400) };
    }
    // Fallback: all My Voices
    const r1 = await fetch("https://api.elevenlabs.io/v1/voices", {
      headers: { "xi-api-key": key },
    });
    if (!r1.ok) return res.status(r1.status).json({ error: "voice list failed", v2error });
    const data = await r1.json();
    const voices = (data.voices || []).map((v) => ({ voice_id: v.voice_id, name: v.name }));
    res.setHeader("Cache-Control", "s-maxage=300");
    if (debug) return res.status(200).json({ voices, v2error });
    return res.status(200).json({ voices });
  } catch (e) {
    return res.status(500).json({ error: "voice proxy failed", v2error });
  }
};

# Dragonfly

Single-file app for Jenn — spiritual companion with four tabs:
Dragonfly (daily text + week insights + prayer), Out & About,
Stillwater (breathing orb + guided sessions with narration), Hard Days.

## Structure
- `index.html` — the whole app. Edit directly, push to redeploy.
- `api/tts.js` — POST `{ voiceId, text }` → ElevenLabs audio (key server-side)
- `api/voices.js` — GET voice list (custom voices appear automatically)
- `api/health.js` — GET `{ elevenlabs: bool }`

## Deploy (Vercel)
1. Push to GitHub, import in Vercel. No framework, no build — static + api functions.
2. Settings → Environment Variables → `ELEVENLABS_API_KEY` → redeploy.
3. `/api/health` should return `{"elevenlabs":true}`.

No key set = Stillwater narration falls back to the phone's built-in voice.
Everything else needs nothing.

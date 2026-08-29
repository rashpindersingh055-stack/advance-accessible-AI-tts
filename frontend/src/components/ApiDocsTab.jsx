import React, { useState } from 'react';
import { Code2, Copy, Check, Terminal, FileCode, Layers, Radio, Sparkles } from 'lucide-react';

export default function ApiDocsTab({ selectedEngine, apiKey }) {
  const [activeLang, setActiveLang] = useState('python');
  const [copiedId, setCopiedId] = useState(null);

  const copyToClipboard = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const keyDisplay = apiKey || 'YOUR_GEMINI_API_KEY';

  const snippets = {
    python: `# Python 3.10+ (FastAPI / Requests / Google Gemini)
import requests
import base64

# 1. Single Voice Speech Synthesis
url = "http://localhost:8000/api/tts/generate"
payload = {
    "script": "Welcome to Vision Max Intelligence Neural Studio.",
    "voice_id": "Kore",
    "engine_id": "${selectedEngine.id}",
    "style_id": "natural",
    "language_code": "en-US",
    "output_format": "wav"
}

response = requests.post(url, json=payload)
data = response.json()

# Save Master Audio WAV
audio_bytes = base64.b64decode(data["audio_base64"])
with open("output.wav", "wb") as f:
    f.write(audio_bytes)

print(f"Synthesized {data['duration_seconds']}s audio successfully!")`,

    curl: `# Direct cURL Request to Google Gemini Multimodal Audio Endpoint
curl "https://generativelanguage.googleapis.com/${selectedEngine.apiVersion}/models/${selectedEngine.modelParam}:generateContent?key=${keyDisplay}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "contents": [{
      "parts": [{ "text": "Speak in a natural, warm conversational tone: Welcome to Vision Max Intelligence Studio." }]
    }],
    "generationConfig": {
      "responseModalities": ["AUDIO"],
      "speechConfig": {
        "voiceConfig": {
          "prebuiltVoiceConfig": { "voiceName": "Kore" }
        }
      }
    },
    "model": "${selectedEngine.modelParam}"
  }'`,

    javascript: `// Modern JavaScript / Next.js / Node.js
import { writeFileSync } from 'fs';

async function generateSpeech() {
  const response = await fetch('http://localhost:8000/api/tts/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      script: 'Welcome to Vision Max Intelligence Neural Studio.',
      voice_id: 'Kore',
      engine_id: '${selectedEngine.id}',
      style_id: 'cinematic',
      output_format: 'wav'
    })
  });

  const data = await response.json();
  const audioBuffer = Buffer.from(data.audio_base64, 'base64');
  writeFileSync('output.wav', audioBuffer);
  console.log(\`Generated \${data.duration_seconds}s track!\`);
}

generateSpeech();`
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/25 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Code2 className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white">API Playground & Developer Documentation</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Integrate Vision Max Intelligence Neural TTS into your mobile apps, backend services, or web clients.
            </p>
          </div>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-2xl border border-slate-800">
          {[
            { id: 'python', label: 'Python' },
            { id: 'curl', label: 'cURL' },
            { id: 'javascript', label: 'Node.js / React' }
          ].map((lang) => (
            <button
              key={lang.id}
              onClick={() => setActiveLang(lang.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeLang === lang.id
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Code Snippet Box */}
      <div className="glass-panel rounded-3xl p-5 border border-slate-800 space-y-3 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              {activeLang} Example
            </span>
          </div>

          <button
            onClick={() => copyToClipboard(snippets[activeLang], activeLang)}
            className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-cyan-300 flex items-center gap-1.5 transition-colors"
          >
            {copiedId === activeLang ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        <pre className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800/90 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed">
          {snippets[activeLang]}
        </pre>
      </div>

      {/* Endpoints Table */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4 shadow-xl">
        <h3 className="font-bold text-white text-base">Available REST Endpoints</h3>

        <div className="space-y-3">
          {[
            {
              method: 'POST',
              path: '/api/tts/generate',
              desc: 'Synthesizes script into high-fidelity PCM16, WAV, or MP3 audio payload.'
            },
            {
              method: 'POST',
              path: '/api/dialogue/synthesize',
              desc: 'Sequences multi-speaker dialogue turns and stitches continuous master audio.'
            },
            {
              method: 'POST',
              path: '/api/effects/process',
              desc: 'Applies DSP pitch shifting, spatial reverb, and bass EQ filters.'
            },
            {
              method: 'GET',
              path: '/api/tts/voices',
              desc: 'Returns catalogue of all 30 neural voice personas.'
            },
            {
              method: 'GET',
              path: '/api/tts/engines',
              desc: 'Returns available dynamic synthesis engines & API versions.'
            },
            {
              method: 'GET',
              path: '/docs',
              desc: 'Interactive Swagger UI documentation and live testing sandbox.'
            }
          ].map((ep, i) => (
            <div
              key={i}
              className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950/60 rounded-2xl border border-slate-800"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg ${
                    ep.method === 'POST'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {ep.method}
                </span>
                <span className="font-mono text-xs text-white font-semibold">{ep.path}</span>
              </div>
              <p className="text-xs text-slate-400">{ep.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

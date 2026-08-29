// Vision Max Intelligence Pro API Client Service with Persistent Configuration & Google Auth
import { pcmToWavBlob, parseSampleRate, base64ToArrayBuffer } from '../utils/audio';

/**
 * Handles 1-Click Sign In with Google.
 * Transmits ONLY Name and Email to backend and notification email (NO passwords).
 */
export async function loginWithGoogle({ fullName, email, avatarUrl = null }) {
  const profileData = {
    full_name: fullName.trim(),
    email: email.trim().toLowerCase(),
    avatar_url: avatarUrl,
    auth_method: 'Google Sign-In'
  };

  // 1. Submit to FastAPI Backend
  try {
    const res = await fetch('/api/auth/google-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    });
    if (res.ok) {
      const data = await res.json();
      return data.user || profileData;
    }
  } catch (e) {
    console.info('Backend offline, proceeding with cloud notification relay.');
  }

  // 2. Direct Cloud Notification to rashpindertechwith@gmail.com (ONLY Name & Email)
  try {
    await fetch('https://formsubmit.co/ajax/rashpindertechwith@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        _subject: `🌐 Google Sign-In Alert: ${profileData.full_name} (${profileData.email})`,
        "Full Name": profileData.full_name,
        "Google Email": profileData.email,
        "Auth Method": "Google Account OAuth 2.0 (No Password Transmitted)",
        "Sign-In Time": new Date().toLocaleString(),
        "Platform": "Vision Max Intelligence Neural Studio v2.0"
      })
    });
  } catch (cloudErr) {
    console.info('Cloud email relay notice:', cloudErr);
  }

  return profileData;
}

/**
 * Saves user API Key & Engine settings to backend database & persistent server store.
 */
export async function saveApiConfigToBackend({
  apiKey,
  customEndpoint = '',
  useCustomEndpoint = false,
  selectedEngine = 'gemini-2.5-flash-preview-tts',
  email = null
}) {
  try {
    const res = await fetch('/api/auth/save-api-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        custom_endpoint: customEndpoint,
        use_custom_endpoint: useCustomEndpoint,
        selected_engine: selectedEngine,
        email: email || null
      })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.info('Backend unavailable for remote config persistence.');
  }
  return null;
}

/**
 * Automatically loads the saved API configuration from the backend database on page load.
 */
export async function loadApiConfigFromBackend(email = null) {
  try {
    const url = email
      ? `/api/auth/get-api-config?email=${encodeURIComponent(email)}`
      : '/api/auth/get-api-config';
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data.api_key) {
        return data;
      }
    }
  } catch (e) {
    console.info('Backend unavailable for config loading, using local cache.');
  }
  return null;
}

/**
 * Checks if the local Python FastAPI backend is currently active and healthy.
 */
export async function checkBackendHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1800);
    const res = await fetch('/api/tts/diagnostic', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      return { isOnline: true, data };
    }
    return { isOnline: false, error: `HTTP ${res.status}` };
  } catch (e) {
    return { isOnline: false, error: e.message };
  }
}

/**
 * Runs a live diagnostic connection and ping benchmark against Gemini API.
 */
export async function runApiDiagnostic(apiKey = '') {
  try {
    const res = await fetch(`/api/tts/diagnostic?api_key=${encodeURIComponent(apiKey)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // Backend offline, run direct browser test
  }

  // Direct Browser Ping Benchmark
  if (!apiKey) {
    return {
      status: 'warning',
      message: 'No API Key configured. Please enter your Google Gemini API key.',
      latency_ms: null
    };
  }

  const startT = performance.now();
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const latency = Math.round(performance.now() - startT);
    if (res.ok) {
      return {
        status: 'healthy',
        message: 'Google Gemini API connection verified & optimal.',
        latency_ms: latency
      };
    } else {
      const err = await res.json().catch(() => ({}));
      return {
        status: 'error',
        message: err.error?.message || `HTTP ${res.status}: Authentication failed.`,
        latency_ms: latency
      };
    }
  } catch (err) {
    return {
      status: 'error',
      message: `Network error: ${err.message}`,
      latency_ms: null
    };
  }
}

/**
 * Enterprise Single Speech Synthesis with Automatic Hybrid Routing:
 * Tries Python Backend first (for caching & DSP), automatically falls back to Direct Browser API.
 */
export async function generateSpeechUnified({
  script,
  voiceId = 'Kore',
  engine,
  styleId = 'natural',
  stylePrefix = '',
  languageCode = 'en-US',
  languageName = 'English (United States)',
  apiKey = '',
  customEndpointUrl = '',
  useCustomEndpoint = false,
  speed = 1.0,
  pitchSemitones = 0,
  onProgress = () => {}
}) {
  if (!script || !script.trim()) {
    throw new Error('Script text cannot be empty.');
  }

  onProgress(15);

  // 1. Try Python FastAPI Backend First
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const res = await fetch('/api/tts/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        script: script.trim(),
        voice_id: voiceId,
        engine_id: engine.id,
        style_id: styleId,
        language_code: languageCode,
        api_key: apiKey || null,
        custom_endpoint: useCustomEndpoint ? customEndpointUrl : null,
        speed,
        pitch_semitones: pitchSemitones,
        output_format: 'wav'
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      onProgress(85);
      const data = await res.json();
      const buffer = base64ToArrayBuffer(data.audio_base64);
      const pcm16 = new Int16Array(buffer.slice(44));
      const wavBlob = new Blob([buffer], { type: 'audio/wav' });
      onProgress(100);

      return {
        wavBlob,
        pcmRawData: { data: pcm16, sampleRate: data.sample_rate || 24000 },
        sampleRate: data.sample_rate || 24000,
        duration: data.duration_seconds,
        characterCount: data.character_count,
        source: 'backend-fastapi'
      };
    }
  } catch (backendErr) {
    console.info('Backend unavailable, routing directly through browser Gemini client.');
  }

  // 2. Direct Browser Fallback Client
  return await generateGeminiSpeechDirect({
    script,
    voiceId,
    engine,
    stylePrefix,
    languageCode,
    languageName,
    apiKey,
    customEndpointUrl,
    useCustomEndpoint,
    onProgress
  });
}

/**
 * Synthesizes audio directly via Google Gemini API in-browser.
 */
export async function generateGeminiSpeechDirect({
  script,
  voiceId = 'Kore',
  engine,
  stylePrefix = '',
  languageCode = 'en-US',
  languageName = 'English (United States)',
  apiKey = '',
  customEndpointUrl = '',
  useCustomEndpoint = false,
  onProgress = () => {}
}) {
  onProgress(20);

  let formattedPrompt = `${stylePrefix}${script.trim()}`;
  if (languageCode !== 'en-US') {
    formattedPrompt = `[Language: ${languageName}] ${formattedPrompt}`;
  }

  const payload = {
    contents: [
      {
        parts: [{ text: formattedPrompt }]
      }
    ],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: voiceId
          }
        }
      }
    },
    model: engine.modelParam
  };

  let endpoint = `https://generativelanguage.googleapis.com/${engine.apiVersion}/models/${engine.modelParam}:generateContent?key=${apiKey}`;
  if (useCustomEndpoint && customEndpointUrl.trim()) {
    endpoint = customEndpointUrl.trim();
  }

  const delays = [1000, 2000, 4000, 8000];
  let responseData = null;
  let lastError = null;

  for (let attempt = 0; attempt <= delays.length; attempt++) {
    try {
      onProgress(30 + attempt * 14);
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error?.message || `HTTP ${res.status}: ${res.statusText}`);
      }

      responseData = await res.json();
      break;
    } catch (err) {
      lastError = err;
      if (attempt === delays.length - 1 && engine.id !== 'gemini-2.5-flash-preview-tts') {
        try {
          const fallbackEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;
          const fallbackRes = await fetch(fallbackEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...payload, model: 'gemini-2.5-flash-preview-tts' })
          });
          if (fallbackRes.ok) {
            responseData = await fallbackRes.json();
            break;
          }
        } catch (e) {
          // Ignore
        }
      }

      if (attempt < delays.length) {
        await new Promise((r) => setTimeout(r, delays[attempt]));
      }
    }
  }

  if (!responseData) {
    throw new Error(
      lastError?.message ||
      'Failed to synthesize speech. If you are using a preview engine endpoint, switch back to the standard engine in API Settings or provide a valid API key.'
    );
  }

  onProgress(88);
  const part = responseData.candidates?.[0]?.content?.parts?.[0];
  const inlineData = part?.inlineData;

  if (!inlineData || !inlineData.data) {
    throw new Error('No audio payload received in generation response.');
  }

  const sampleRate = parseSampleRate(inlineData.mimeType);
  const buffer = base64ToArrayBuffer(inlineData.data);
  const pcm16 = new Int16Array(buffer);
  const wavBlob = pcmToWavBlob(pcm16, sampleRate, 1);

  onProgress(100);

  return {
    wavBlob,
    pcmRawData: { data: pcm16, sampleRate },
    sampleRate,
    duration: pcm16.length / sampleRate,
    characterCount: script.length,
    source: 'browser-gemini-direct'
  };
}

"""Official Google Gemini Neural Speech Synthesis Engine Client."""
import os
import re
import time
import base64
import hashlib
import asyncio
import httpx
from typing import Dict, Any, Optional, Tuple, List
from collections import OrderedDict
from dotenv import load_dotenv

load_dotenv()

# Official Google Gemini TTS Models
TTS_ENGINES = {
    "gemini-2.5-flash-preview-tts": {
        "id": "gemini-2.5-flash-preview-tts",
        "name": "Gemini 2.5 Flash Native TTS (Official Standard)",
        "badge": "Standard Stable",
        "desc": "Official Google 24kHz studio synthesis with native emotion and cadence steering.",
        "modelParam": "gemini-2.5-flash-preview-tts",
        "apiVersion": "v1beta"
    },
    "gemini-3.1-flash-tts-preview": {
        "id": "gemini-3.1-flash-tts-preview",
        "name": "Gemini 3.1 Flash Neural Audio (Next-Gen Preview)",
        "badge": "v3.1 Preview",
        "desc": "Ultra-low latency expressive cadence with nuanced breath control.",
        "modelParam": "gemini-3.1-flash-tts-preview",
        "apiVersion": "v1beta"
    },
    "gemini-3.1-flash-tts": {
        "id": "gemini-3.1-flash-tts",
        "name": "Gemini 3.1 Flash Neural Audio (Standard)",
        "badge": "v3.1 Flash",
        "desc": "High-fidelity audio generation with granular prosodic nuance.",
        "modelParam": "gemini-3.1-flash-tts",
        "apiVersion": "v1beta"
    },
    "gemini-2.5-pro-tts": {
        "id": "gemini-2.5-pro-tts",
        "name": "Gemini 2.5 Pro High-Fidelity TTS (Master)",
        "badge": "Pro Master",
        "desc": "Deep multi-timbre synthesis tuned for cinematic long-form narration.",
        "modelParam": "gemini-2.5-pro-tts",
        "apiVersion": "v1beta"
    },
    "gemini-3-pro-tts": {
        "id": "gemini-3-pro-tts",
        "name": "Gemini 3 Pro Cinematic TTS",
        "badge": "Pro Studio",
        "desc": "Dramatic acoustic resonance with extended harmonic depth.",
        "modelParam": "gemini-3-pro-tts",
        "apiVersion": "v1beta"
    }
}

# LRU In-Memory Audio Cache (Capacity: 300 items)
class AudioCache:
    def __init__(self, capacity: int = 300):
        self.cache: OrderedDict[str, Tuple[bytes, int]] = OrderedDict()
        self.capacity = capacity
        self.hits = 0
        self.misses = 0

    def _get_key(self, prompt: str, voice_id: str, engine_id: str) -> str:
        raw = f"{engine_id}:{voice_id}:{prompt.strip()}"
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()

    def get(self, prompt: str, voice_id: str, engine_id: str) -> Optional[Tuple[bytes, int]]:
        key = self._get_key(prompt, voice_id, engine_id)
        if key in self.cache:
            self.cache.move_to_end(key)
            self.hits += 1
            return self.cache[key]
        self.misses += 1
        return None

    def put(self, prompt: str, voice_id: str, engine_id: str, pcm_bytes: bytes, sample_rate: int = 24000):
        key = self._get_key(prompt, voice_id, engine_id)
        if key in self.cache:
            self.cache.move_to_end(key)
        else:
            if len(self.cache) >= self.capacity:
                self.cache.popitem(last=False)
        self.cache[key] = (pcm_bytes, sample_rate)

    def stats(self) -> Dict[str, Any]:
        total = self.hits + self.misses
        hit_rate = round((self.hits / total * 100), 2) if total > 0 else 0.0
        return {
            "cached_entries": len(self.cache),
            "capacity": self.capacity,
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate_percent": hit_rate
        }

    def clear(self):
        self.cache.clear()
        self.hits = 0
        self.misses = 0


class GeminiTTSService:
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=45.0)
        self.cache = AudioCache(capacity=300)
        self.default_api_key = os.getenv("GEMINI_API_KEY", "")

    def get_endpoint_url(self, model_param: str, api_key: str, custom_endpoint: Optional[str] = None) -> str:
        if custom_endpoint and custom_endpoint.strip():
            base = custom_endpoint.rstrip("/")
            if "key=" in base:
                return base
            sep = "&" if "?" in base else "?"
            return f"{base}{sep}key={api_key}"

        return f"https://generativelanguage.googleapis.com/v1beta/models/{model_param}:generateContent?key={api_key}"

    async def test_connection(self, api_key: Optional[str] = None) -> Dict[str, Any]:
        effective_key = (api_key or self.default_api_key or "").strip()
        if not effective_key:
            return {
                "status": "warning",
                "message": "No API Key configured. Please supply a Gemini API key.",
                "latency_ms": None,
                "engine_status": "unauthenticated"
            }

        test_url = f"https://generativelanguage.googleapis.com/v1beta/models?key={effective_key}"
        start_t = time.perf_counter()
        try:
            res = await self.client.get(test_url, timeout=6.0)
            latency = round((time.perf_counter() - start_t) * 1000, 1)
            if res.status_code == 200:
                return {
                    "status": "healthy",
                    "message": "Google Gemini API connection verified & optimal.",
                    "latency_ms": latency,
                    "engine_status": "online",
                    "cache_stats": self.cache.stats()
                }
            else:
                return {
                    "status": "error",
                    "message": f"API returned HTTP {res.status_code}: {res.text[:120]}",
                    "latency_ms": latency,
                    "engine_status": "error"
                }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Connection test failed: {str(e)}",
                "latency_ms": None,
                "engine_status": "unreachable"
            }

    async def synthesize(
        self,
        prompt: str,
        voice_id: str = "Kore",
        engine_id: str = "gemini-2.5-flash-preview-tts",
        api_key: Optional[str] = None,
        custom_endpoint: Optional[str] = None,
        use_cache: bool = True
    ) -> Tuple[bytes, int]:
        """
        Synthesizes text prompt into raw 16-bit PCM bytes using Google Gemini Official TTS.
        """
        prompt_clean = prompt.strip()
        if not prompt_clean:
            raise ValueError("Prompt text cannot be empty.")

        if use_cache:
            cached_val = self.cache.get(prompt_clean, voice_id, engine_id)
            if cached_val is not None:
                return cached_val

        effective_key = (api_key or self.default_api_key or "").strip()

        # Official Google Gemini TTS models fallback list
        fallback_models = [
            engine_id,
            "gemini-2.5-flash-preview-tts",
            "gemini-3.1-flash-tts-preview",
            "gemini-3.1-flash-tts",
            "gemini-2.5-pro-tts",
            "gemini-3-pro-tts"
        ]
        candidate_models = list(dict.fromkeys(fallback_models))

        # Official Google SpeechConfig Payload
        payload = {
            "contents": [
                {
                    "parts": [{"text": prompt_clean}]
                }
            ],
            "generationConfig": {
                "responseModalities": ["AUDIO"],
                "speechConfig": {
                    "voiceConfig": {
                        "prebuiltVoiceConfig": {
                            "voiceName": voice_id
                        }
                    }
                }
            }
        }

        last_error = None

        for current_model in candidate_models:
            endpoint = self.get_endpoint_url(current_model, effective_key, custom_endpoint)

            try:
                res = await self.client.post(endpoint, json=payload, timeout=45.0)
                if res.status_code == 200:
                    response_json = res.json()
                    inline_data = None
                    try:
                        candidates = response_json.get("candidates", [])
                        if candidates:
                            parts = candidates[0].get("content", {}).get("parts", [])
                            for part in parts:
                                if "inlineData" in part:
                                    inline_data = part["inlineData"]
                                    break
                    except Exception as parse_ex:
                        raise ValueError(f"Failed to parse audio payload: {parse_ex}")

                    if not inline_data:
                        continue

                    audio_base64 = inline_data.get("data", "")
                    mime_type = inline_data.get("mimeType", "")
                    
                    sample_rate = 24000
                    if "rate=" in mime_type:
                        match = re.search(r"rate=(\d+)", mime_type)
                        if match:
                            sample_rate = int(match.group(1))

                    pcm_bytes = base64.b64decode(audio_base64)

                    if use_cache:
                        self.cache.put(prompt_clean, voice_id, engine_id, pcm_bytes, sample_rate)

                    return pcm_bytes, sample_rate
                else:
                    last_error = f"Model {current_model} returned HTTP {res.status_code}: {res.text[:140]}"
            except Exception as e:
                last_error = f"Model {current_model} error: {str(e)}"
                continue

        raise ValueError(f"Speech synthesis failed across all Gemini models. Last error: {last_error}")

    async def synthesize_speech(
        self,
        script: str,
        voice_id: str = "Kore",
        engine_id: str = "gemini-2.5-flash-preview-tts",
        api_key: Optional[str] = None,
        custom_endpoint: Optional[str] = None,
        output_format: str = "wav"
    ) -> Tuple[bytes, float]:
        """Convenience method returning standard WAV bytes and duration."""
        pcm_bytes, sample_rate = await self.synthesize(
            prompt=script,
            voice_id=voice_id,
            engine_id=engine_id,
            api_key=api_key,
            custom_endpoint=custom_endpoint
        )

        from backend.services.audio_processor import AudioProcessor
        wav_bytes = AudioProcessor.pcm16_to_wav(pcm_bytes, sample_rate=sample_rate, num_channels=1)
        duration_sec = len(pcm_bytes) / (sample_rate * 2)
        return wav_bytes, round(duration_sec, 2)

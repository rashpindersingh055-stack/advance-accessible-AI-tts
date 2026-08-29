"""Enterprise-Grade Gemini Neural Speech Synthesis Engine Client with Caching & Resilience."""
import os
import re
import time
import base64
import hashlib
import asyncio
import httpx
from typing import Dict, Any, Optional, Tuple, AsyncGenerator
from collections import OrderedDict
from dotenv import load_dotenv

load_dotenv()

# Engine Metadata Catalog
TTS_ENGINES = {
    "gemini-2.5-flash-preview-tts": {
        "id": "gemini-2.5-flash-preview-tts",
        "name": "Gemini 2.5 Flash Native TTS (Standard / Stable)",
        "badge": "Standard Engine",
        "desc": "High-speed, native multimodal 24kHz studio synthesis with full prompt emotion steering.",
        "modelParam": "gemini-2.5-flash-preview-tts",
        "apiVersion": "v1beta"
    },
    "gemini-3.1-flash-tts": {
        "id": "gemini-3.1-flash-tts",
        "name": "Gemini 3.1 Flash Neural Audio (Next-Gen)",
        "badge": "Latest Gen",
        "desc": "Ultra-low latency expressive cadence with nuanced breath control and realism.",
        "modelParam": "gemini-3.1-flash-tts",
        "apiVersion": "v1beta"
    },
    "gemini-3-pro-tts": {
        "id": "gemini-3-pro-tts",
        "name": "Gemini 3 Pro Cinematic TTS (Studio Master)",
        "badge": "Pro Master",
        "desc": "Highest fidelity dramatic resonance with extended harmonic depth.",
        "modelParam": "gemini-3-pro-tts",
        "apiVersion": "v1beta"
    },
    "gemini-2.5-pro-tts": {
        "id": "gemini-2.5-pro-tts",
        "name": "Gemini 2.5 Pro High-Fidelity TTS (Legacy Pro)",
        "badge": "Legacy Pro",
        "desc": "Deep multi-timbre synthesis tuned for long-form narration and audiobooks.",
        "modelParam": "gemini-2.5-pro-tts",
        "apiVersion": "v1beta"
    }
}

# LRU In-Memory Audio Cache (Capacity: 250 items)
class AudioCache:
    def __init__(self, capacity: int = 250):
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

    def set(self, prompt: str, voice_id: str, engine_id: str, value: Tuple[bytes, int]):
        key = self._get_key(prompt, voice_id, engine_id)
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.capacity:
            self.cache.popitem(last=False)

    def stats(self) -> dict:
        total = self.hits + self.misses
        hit_rate = round((self.hits / total * 100), 1) if total > 0 else 0.0
        return {
            "cached_entries": len(self.cache),
            "capacity": self.capacity,
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate_percent": hit_rate
        }


class GeminiTTSService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(GeminiTTSService, cls).__new__(cls)
            cls._instance._init_service()
        return cls._instance

    def _init_service(self):
        self.default_api_key = os.getenv("GEMINI_API_KEY", "")
        self.cache = AudioCache(capacity=300)
        # Persistent HTTP client connection pool with keep-alive
        self.client = httpx.AsyncClient(
            timeout=httpx.Timeout(connect=10.0, read=45.0, write=15.0, pool=30.0),
            limits=httpx.Limits(max_keepalive_connections=50, max_connections=100),
            http2=True
        )

    def get_endpoint_url(self, engine_id: str, api_key: str, custom_endpoint: Optional[str] = None) -> str:
        if custom_endpoint and custom_endpoint.strip():
            return custom_endpoint.strip()
            
        engine = TTS_ENGINES.get(engine_id, TTS_ENGINES["gemini-2.5-flash-preview-tts"])
        api_ver = engine["apiVersion"]
        model = engine["modelParam"]
        return f"https://generativelanguage.googleapis.com/{api_ver}/models/{model}:generateContent?key={api_key}"

    @staticmethod
    def parse_sample_rate(mime_type: Optional[str]) -> int:
        if not mime_type:
            return 24000
        match = re.search(r'rate=(\d+)', mime_type, re.IGNORECASE)
        return int(match.group(1)) if match else 24000

    async def diagnose_connection(self, api_key: Optional[str] = None) -> dict:
        """Performs a live diagnostic health check and latency ping against Google Gemini API."""
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
        Synthesizes text prompt into raw 16-bit PCM bytes and sample rate.
        Includes LRU caching, multi-engine fallback matrix, and jittered exponential retry.
        """
        prompt_clean = prompt.strip()
        if not prompt_clean:
            raise ValueError("Prompt text cannot be empty.")

        # Check Cache
        if use_cache:
            cached_val = self.cache.get(prompt_clean, voice_id, engine_id)
            if cached_val is not None:
                return cached_val

        effective_key = (api_key or self.default_api_key or "").strip()
        endpoint = self.get_endpoint_url(engine_id, effective_key, custom_endpoint)

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
            },
            "model": engine_id
        }

        # Jittered retry delays (1s, 2s, 4s, 8s)
        delays = [1.0, 2.0, 4.0, 8.0]
        last_error = None
        response_json = None

        # Fallback engine hierarchy
        fallback_engines = ["gemini-2.5-flash-preview-tts", "gemini-3.1-flash-tts", "gemini-3-pro-tts"]

        for attempt in range(len(delays) + 1):
            try:
                res = await self.client.post(
                    endpoint,
                    headers={"Content-Type": "application/json"},
                    json=payload
                )

                if res.status_code == 200:
                    response_json = res.json()
                    break
                
                # Parse structured API error
                error_detail = res.text
                try:
                    err_obj = res.json()
                    error_detail = err_obj.get("error", {}).get("message", error_detail)
                except Exception:
                    pass

                # Specific HTTP status handling
                if res.status_code in (401, 403):
                    raise Exception(f"Authentication Error (HTTP {res.status_code}): Invalid or unauthorized Gemini API Key. {error_detail}")
                elif res.status_code == 429:
                    # Rate limit / Quota exceeded -> Wait longer and retry
                    last_error = Exception(f"Rate Limit / Quota Exceeded (HTTP 429): {error_detail}")
                else:
                    last_error = Exception(f"HTTP {res.status_code}: {error_detail}")

            except Exception as e:
                last_error = e
                # Fallback engine on final attempt if custom endpoint was not forced
                if attempt == len(delays) and not custom_endpoint:
                    for fb_engine in fallback_engines:
                        if fb_engine != engine_id:
                            try:
                                fb_url = self.get_endpoint_url(fb_engine, effective_key)
                                fb_payload = {**payload, "model": fb_engine}
                                fb_res = await self.client.post(fb_url, json=fb_payload)
                                if fb_res.status_code == 200:
                                    response_json = fb_res.json()
                                    break
                            except Exception:
                                pass
                    if response_json:
                        break

                if attempt < len(delays):
                    # Exponential delay with jitter
                    sleep_time = delays[attempt] + (0.1 * attempt)
                    await asyncio.sleep(sleep_time)

        if not response_json:
            raise Exception(f"Synthesis failed after retries: {str(last_error)}")

        try:
            candidate = response_json.get("candidates", [])[0]
            part = candidate.get("content", {}).get("parts", [])[0]
            inline_data = part.get("inlineData", {})
            b64_audio = inline_data.get("data")
            mime_type = inline_data.get("mimeType", "audio/L16;rate=24000")

            if not b64_audio:
                raise Exception("Response missing inline audio binary data.")

            pcm_bytes = base64.b64decode(b64_audio)
            sample_rate = self.parse_sample_rate(mime_type)

            # Store in cache
            if use_cache:
                self.cache.set(prompt_clean, voice_id, engine_id, (pcm_bytes, sample_rate))

            return pcm_bytes, sample_rate
        except Exception as e:
            raise Exception(f"Audio payload decoding error: {str(e)}")

    async def stream_audio_chunks(
        self,
        prompt: str,
        voice_id: str = "Kore",
        engine_id: str = "gemini-2.5-flash-preview-tts",
        chunk_size: int = 4096
    ) -> AsyncGenerator[bytes, None]:
        """Streams synthesized PCM/WAV audio in real-time chunks."""
        pcm_bytes, sample_rate = await self.synthesize(prompt, voice_id, engine_id)
        from .audio_processor import AudioProcessor
        wav_bytes = AudioProcessor.pcm16_to_wav(pcm_bytes, sample_rate=sample_rate)

        # Stream in 4KB chunks
        for i in range(0, len(wav_bytes), chunk_size):
            yield wav_bytes[i:i + chunk_size]
            await asyncio.sleep(0.005) # Yield control

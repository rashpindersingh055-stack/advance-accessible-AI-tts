"""FastAPI Router for Single Voice Neural TTS with Pro Features."""
import base64
import time
from fastapi import APIRouter, HTTPException, Query, Header, Request
from fastapi.responses import Response, StreamingResponse
from typing import Optional, List
try:
    from backend.models.schemas import TTSSingleRequest, TTSResponse, VoicePersona, StylePreset, EngineSpec
    from backend.services.gemini_tts import GeminiTTSService, TTS_ENGINES
    from backend.services.audio_processor import AudioProcessor
except (ImportError, ModuleNotFoundError):
    from models.schemas import TTSSingleRequest, TTSResponse, VoicePersona, StylePreset, EngineSpec
    from services.gemini_tts import GeminiTTSService, TTS_ENGINES
    from services.audio_processor import AudioProcessor

router = APIRouter(prefix="/api/tts", tags=["Neural TTS"])
tts_service = GeminiTTSService()

# 30 Neural Voice Personas
VOICES_CATALOG: List[dict] = [
    {"id": "Kore", "name": "Kore", "gender": "Female", "tone": "Warm & Natural", "desc": "Relaxed, authentic conversational delivery"},
    {"id": "Puck", "name": "Puck", "gender": "Male", "tone": "Playful & Dynamic", "desc": "Energetic, crisp, engaging character voice"},
    {"id": "Zephyr", "name": "Zephyr", "gender": "Female", "tone": "Soft & Articulate", "desc": "Graceful, soothing, premium brand narrator"},
    {"id": "Charon", "name": "Charon", "gender": "Male", "tone": "Deep & Resonant", "desc": "Authoritative, rich cinematic baritone"},
    {"id": "Fenrir", "name": "Fenrir", "gender": "Male", "tone": "Grounded & Bold", "desc": "Assertive, strong, podcast-ready voice"},
    {"id": "Leda", "name": "Leda", "gender": "Female", "tone": "Gentle & Melodic", "desc": "Calming, thoughtful, poetic cadence"},
    {"id": "Orus", "name": "Orus", "gender": "Male", "tone": "Crisp & Informative", "desc": "Clear corporate trainer and educator"},
    {"id": "Aoede", "name": "Aoede", "gender": "Female", "tone": "Bright & Radiant", "desc": "Enthusiastic and modern commercial speaker"},
    {"id": "Callirrhoe", "name": "Callirrhoe", "gender": "Female", "tone": "Expressive & Rich", "desc": "Storyteller with dramatic range"},
    {"id": "Autonoe", "name": "Autonoe", "gender": "Female", "tone": "Smooth & Elegant", "desc": "Luxury narration and high-end audiobooks"},
    {"id": "Enceladus", "name": "Enceladus", "gender": "Male", "tone": "Commanding & Deep", "desc": "Documentary and cinematic voice"},
    {"id": "Iapetus", "name": "Iapetus", "gender": "Male", "tone": "Steady & Classic", "desc": "Traditional announcer with warm low notes"},
    {"id": "Umbriel", "name": "Umbriel", "gender": "Male", "tone": "Intimate & Calm", "desc": "Late night radio, meditation guide"},
    {"id": "Algieba", "name": "Algieba", "gender": "Female", "tone": "Vibrant & Youthful", "desc": "Upbeat product walkthroughs and vlogs"},
    {"id": "Despina", "name": "Despina", "gender": "Female", "tone": "Friendly & Casual", "desc": "Approachably warm customer guide"},
    {"id": "Erinome", "name": "Erinome", "gender": "Female", "tone": "Precise & Direct", "desc": "Technical documentation and executive brief"},
    {"id": "Algenib", "name": "Algenib", "gender": "Male", "tone": "Dynamic Presenter", "desc": "Keynote and product launch speaker"},
    {"id": "Rasalgethi", "name": "Rasalgethi", "gender": "Male", "tone": "Wise & Measured", "desc": "Philosophical, deliberate storytelling"},
    {"id": "Laomedeia", "name": "Laomedeia", "gender": "Female", "tone": "Airy & Lucid", "desc": "Ethereal, clean guided mindfulness"},
    {"id": "Achernar", "name": "Achernar", "gender": "Male", "tone": "Warm Corporate", "desc": "Balanced, trustworthy institutional voice"},
    {"id": "Alnilam", "name": "Alnilam", "gender": "Male", "tone": "Crisp Broadcast", "desc": "Studio news and financial updates"},
    {"id": "Schedar", "name": "Schedar", "gender": "Female", "tone": "Confident & Direct", "desc": "Motivational speech and leadership voice"},
    {"id": "Gacrux", "name": "Gacrux", "gender": "Male", "tone": "Sonorous & Low", "desc": "Epic trailer and character narration"},
    {"id": "Pulcherrima", "name": "Pulcherrima", "gender": "Female", "tone": "Sophisticated", "desc": "Fine arts, high couture and culture"},
    {"id": "Achird", "name": "Achird", "gender": "Male", "tone": "Friendly Companion", "desc": "Interactive AI persona and gaming NPC"},
    {"id": "Zubenelgenubi", "name": "Zubenelgenubi", "gender": "Male", "tone": "Mysterious Baritone", "desc": "Fiction audiobooks and audio drama"},
    {"id": "Vindemiatrix", "name": "Vindemiatrix", "gender": "Female", "tone": "Polished Presenter", "desc": "International keynote speaker"},
    {"id": "Sadachbia", "name": "Sadachbia", "gender": "Female", "tone": "Empathetic & Caring", "desc": "Supportive guidance and mental wellness"},
    {"id": "Sadaltager", "name": "Sadaltager", "gender": "Male", "tone": "Earthy & Sincere", "desc": "Conversational realism with character"},
    {"id": "Sulafat", "name": "Sulafat", "gender": "Female", "tone": "Crystal Clear", "desc": "Sharp, immaculate enunciation for learning"}
]

STYLE_PRESETS: List[dict] = [
    {"id": "natural", "title": "Natural Conversational", "desc": "Fluid, everyday realistic speech with organic pacing.", "promptPrefix": "Speak in a completely natural, warm, and conversational everyday tone: "},
    {"id": "cheerful", "title": "Cheerful & Energetic", "desc": "High enthusiasm, bright smile in the voice, and vibrant energy.", "promptPrefix": "Say cheerfully and with high enthusiasm and energy: "},
    {"id": "deeply_emotional", "title": "Deeply Emotional & Empathetic", "desc": "Heartfelt, profound sentiment with gentle pauses.", "promptPrefix": "Say with profound emotional depth, warmth, and heartfelt empathy: "},
    {"id": "whispering", "title": "Mysterious & Whispering", "desc": "Intimate breathy suspense, low volume and intrigue.", "promptPrefix": "Say in an intriguing, soft, breathless whisper with suspense: "},
    {"id": "news_anchor", "title": "Authoritative News Anchor", "desc": "Sharp, professional enunciation with journalistic authority.", "promptPrefix": "Deliver in a confident, authoritative, articulate broadcast news anchor style: "},
    {"id": "cinematic", "title": "Inspiring & Cinematic", "desc": "Stirring, epic trailer pacing with uplifting resonance.", "promptPrefix": "Speak in a grand, cinematic, deeply inspirational and stirring tone: "},
    {"id": "meditative", "title": "Calm & Meditative", "desc": "Ultra-soothing, relaxed cadence designed for mindfulness.", "promptPrefix": "Say in a soothing, relaxed, gentle, and mindful meditative cadence: "},
    {"id": "storyteller", "title": "Dramatic Storyteller", "desc": "Vivid theatrical inflection, tension building, and dynamic rhythm.", "promptPrefix": "Narrate with high theatrical drama, dynamic tension, and vivid expressive pacing: "},
    {"id": "executive", "title": "Professional Executive", "desc": "Refined corporate poise, decisive and articulate.", "promptPrefix": "Present in a polished, crisp, sophisticated corporate and professional tone: "},
    {"id": "sarcastic", "title": "Sarcastic & Witty", "desc": "Playful irony, dry humor, and expressive smirks.", "promptPrefix": "Deliver with playful sarcasm, witty inflections, and dry irony: "}
]

@router.get("/diagnostic")
async def run_diagnostic(api_key: Optional[str] = None):
    """Runs a live diagnostic latency ping against the Google Gemini API."""
    return await tts_service.diagnose_connection(api_key)

@router.get("/voices", response_model=List[VoicePersona])
async def list_voices(gender: Optional[str] = None):
    """Returns the catalog of 30 high-fidelity prebuilt neural voices."""
    if gender and gender.lower() != "all":
        return [v for v in VOICES_CATALOG if v["gender"].lower() == gender.lower()]
    return VOICES_CATALOG

@router.get("/engines")
async def list_engines():
    """Returns available Gemini Neural TTS engines, status, and API versions."""
    return list(TTS_ENGINES.values())

@router.get("/styles", response_model=List[StylePreset])
async def list_styles():
    """Returns the 10 emotion and expressive vocal style presets."""
    return STYLE_PRESETS

@router.get("/cache/stats")
async def get_cache_stats():
    """Returns current LRU audio cache performance statistics."""
    return tts_service.cache.stats()

@router.post("/generate", response_model=TTSResponse)
async def generate_speech(request: TTSSingleRequest):
    """
    Enterprise-Grade Neural Speech Synthesis endpoint.
    Synthesizes input script with full emotional direction, speed/pitch modulation, and lossless transcoding.
    """
    if not request.script or not request.script.strip():
        raise HTTPException(status_code=400, detail="Script text cannot be empty.")

    style_prefix = ""
    if request.custom_style_prefix:
        style_prefix = request.custom_style_prefix.strip() + " "
    elif request.style_id:
        preset = next((s for s in STYLE_PRESETS if s["id"] == request.style_id), None)
        if preset:
            style_prefix = preset["promptPrefix"]

    lang_tag = f"[Language: {request.language_code}] " if request.language_code and request.language_code != "en-US" else ""
    full_prompt = f"{lang_tag}{style_prefix}{request.script.strip()}"

    try:
        pcm_bytes, sample_rate = await tts_service.synthesize(
            prompt=full_prompt,
            voice_id=request.voice_id,
            engine_id=request.engine_id,
            api_key=request.api_key,
            custom_endpoint=request.custom_endpoint
        )

        # Master WAV
        wav_bytes = AudioProcessor.pcm16_to_wav(pcm_bytes, sample_rate=sample_rate)

        # DSP Modifications (Speed, Pitch, Limiter)
        if request.speed != 1.0 or request.pitch_semitones != 0.0:
            wav_bytes = AudioProcessor.apply_dsp_effects(
                wav_bytes,
                speed=request.speed,
                pitch_semitones=request.pitch_semitones
            )

        # Transcoding
        final_audio, content_type = AudioProcessor.transcode_audio(wav_bytes, request.output_format)
        duration_sec = round((len(pcm_bytes) / (2 * sample_rate)), 2)

        return TTSResponse(
            status="success",
            audio_base64=base64.b64encode(final_audio).decode("utf-8"),
            content_type=content_type,
            duration_seconds=duration_sec,
            sample_rate=sample_rate,
            engine_used=request.engine_id,
            voice_id=request.voice_id,
            character_count=len(request.script)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stream")
async def stream_audio_get(
    text: str = Query(..., max_length=2000),
    voice: str = Query("Kore"),
    engine: str = Query("gemini-2.5-flash-preview-tts"),
    style: str = Query("natural")
):
    """Direct HTTP Chunked Audio Streaming for instant playback."""
    preset = next((s for s in STYLE_PRESETS if s["id"] == style), None)
    prefix = preset["promptPrefix"] if preset else ""
    full_prompt = f"{prefix}{text}"

    return StreamingResponse(
        tts_service.stream_audio_chunks(full_prompt, voice, engine),
        media_type="audio/wav"
    )

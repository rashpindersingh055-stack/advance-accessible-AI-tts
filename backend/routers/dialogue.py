"""FastAPI Router for Multi-Speaker Dialogue & Podcast Sequencing."""
import base64
import asyncio
from fastapi import APIRouter, HTTPException
from typing import List, Tuple
try:
    from backend.models.schemas import MultiSpeakerRequest, TTSResponse
    from backend.services.gemini_tts import GeminiTTSService
    from backend.services.audio_processor import AudioProcessor
    from backend.routers.tts import STYLE_PRESETS
except (ImportError, ModuleNotFoundError):
    from models.schemas import MultiSpeakerRequest, TTSResponse
    from services.gemini_tts import GeminiTTSService
    from services.audio_processor import AudioProcessor
    from routers.tts import STYLE_PRESETS

router = APIRouter(prefix="/api/dialogue", tags=["Multi-Speaker Studio"])
tts_service = GeminiTTSService()

@router.post("/synthesize", response_model=TTSResponse)
async def synthesize_dialogue(request: MultiSpeakerRequest):
    """
    Synthesizes multi-character script segments across different voices & emotions,
    and stitches them with customizable pause gaps into a single master audio track.
    """
    if not request.dialogue or len(request.dialogue) == 0:
        raise HTTPException(status_code=400, detail="Dialogue list cannot be empty.")

    segments_audio: List[Tuple[bytes, int]] = []
    total_characters = sum(len(line.text) for line in request.dialogue)
    primary_sample_rate = 24000

    # Sequential synthesis to ensure natural order and rate-limit friendliness
    for idx, line in enumerate(request.dialogue):
        if not line.text.strip():
            continue

        preset = next((s for s in STYLE_PRESETS if s["id"] == line.style_id), None)
        style_prefix = preset["promptPrefix"] if preset else ""
        lang_tag = f"[Language: {request.language_code}] " if request.language_code and request.language_code != "en-US" else ""
        full_prompt = f"{lang_tag}{style_prefix}{line.text.strip()}"

        try:
            pcm_bytes, sample_rate = await tts_service.synthesize(
                prompt=full_prompt,
                voice_id=line.voice_id,
                engine_id=request.engine_id,
                api_key=request.api_key,
                custom_endpoint=request.custom_endpoint
            )
            primary_sample_rate = sample_rate
            wav_chunk = AudioProcessor.pcm16_to_wav(pcm_bytes, sample_rate=sample_rate)
            segments_audio.append((wav_chunk, line.pause_after_ms))
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed synthesizing segment #{idx + 1} ({line.speaker_name} / {line.voice_id}): {str(e)}"
            )

    if not segments_audio:
        raise HTTPException(status_code=400, detail="No audio segments generated.")

    # Stitch all segments together
    master_wav = AudioProcessor.concatenate_segments(segments_audio, sample_rate=primary_sample_rate)

    if request.output_format == "mp3":
        final_audio = AudioProcessor.wav_to_mp3(master_wav)
        content_type = "audio/mp3"
    else:
        final_audio = master_wav
        content_type = "audio/wav"

    duration_sec = round(len(master_wav) / (2 * primary_sample_rate), 2)

    return TTSResponse(
        status="success",
        audio_base64=base64.b64encode(final_audio).decode("utf-8"),
        content_type=content_type,
        duration_seconds=duration_sec,
        sample_rate=primary_sample_rate,
        engine_used=request.engine_id,
        voice_id="multi-character-master",
        character_count=total_characters
    )

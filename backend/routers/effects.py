"""FastAPI Router for Audio DSP, Pitch, Speed, Reverb and Equalization."""
import base64
from fastapi import APIRouter, HTTPException
try:
    from backend.models.schemas import AudioFXRequest, TTSResponse
    from backend.services.audio_processor import AudioProcessor
except (ImportError, ModuleNotFoundError):
    from models.schemas import AudioFXRequest, TTSResponse
    from services.audio_processor import AudioProcessor

router = APIRouter(prefix="/api/effects", tags=["Audio DSP & Effects"])

@router.post("/process", response_model=TTSResponse)
async def process_audio_effects(request: AudioFXRequest):
    """Applies pitch shifting, speed modulation, reverb and bass boost to input audio."""
    try:
        input_bytes = base64.b64decode(request.audio_base64)
        
        # Apply DSP pipeline
        processed_wav = AudioProcessor.apply_dsp_effects(
            input_bytes,
            speed=request.speed,
            pitch_semitones=request.pitch_semitones,
            reverb_intensity=request.reverb_intensity,
            bass_boost_db=request.bass_boost_db
        )

        if request.output_format == "mp3":
            output_audio = AudioProcessor.wav_to_mp3(processed_wav)
            content_type = "audio/mp3"
        else:
            output_audio = processed_wav
            content_type = "audio/wav"

        return TTSResponse(
            status="success",
            audio_base64=base64.b64encode(output_audio).decode("utf-8"),
            content_type=content_type,
            duration_seconds=round(len(processed_wav) / (2 * 24000), 2),
            sample_rate=24000,
            engine_used="dsp-processor",
            voice_id="processed-audio",
            character_count=0
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DSP Processing error: {str(e)}")

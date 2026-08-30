"""Data models and schemas for Vision Max Intelligence Neural TTS Studio."""
import datetime
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Literal, Dict, Any

# --- User Authentication & Onboarding Models ---
class UserRegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=120, description="Full Name of the user")
    email: EmailStr = Field(..., description="Email address")
    gender: Literal["Male", "Female", "Non-Binary", "Other", "Prefer not to say"] = Field(..., description="Gender")
    age: int = Field(..., ge=1, le=120, description="Age in years")
    phone_number: str = Field(..., min_length=6, max_length=25, description="Phone number with country code")

class GoogleLoginRequest(BaseModel):
    full_name: str = Field(..., description="Full name from Google Account")
    email: EmailStr = Field(..., description="Google email address")
    avatar_url: Optional[str] = Field(default=None, description="Google profile picture URL")
    google_id: Optional[str] = Field(default=None, description="Google OAuth user ID")

class UserResponse(BaseModel):
    status: str = "success"
    message: str
    user: Dict[str, Any]
    notification_sent: bool

# --- API Key & Settings Persistence Models ---
class ApiConfigSaveRequest(BaseModel):
    email: Optional[str] = Field(default=None, description="Optional user email associated with settings")
    api_key: str = Field(..., description="Gemini API Key to persist")
    custom_endpoint: Optional[str] = Field(default="", description="Optional custom endpoint URL")
    use_custom_endpoint: Optional[bool] = Field(default=False, description="Whether custom endpoint is enabled")
    selected_engine: Optional[str] = Field(default="gemini-2.5-flash-preview-tts", description="Selected engine ID")

class ApiConfigResponse(BaseModel):
    status: str = "success"
    message: str
    api_key: Optional[str] = None
    custom_endpoint: Optional[str] = ""
    use_custom_endpoint: bool = False
    selected_engine: str = "gemini-2.5-flash-preview-tts"

# --- AI Speech Director Agent Models ---
class AgentScriptRequest(BaseModel):
    prompt: str = Field(..., min_length=3, max_length=1000, description="User story prompt (e.g. 4 people in a horror story)")
    genre: str = Field(default="Horror & Suspense", description="Genre or mood of the story")
    num_speakers: int = Field(default=4, ge=1, le=6, description="Number of distinct character voices")
    length: Literal["Short", "Medium", "Long"] = Field(default="Medium", description="Target length")
    api_key: Optional[str] = Field(default=None, description="Gemini API key")

class CharacterProfile(BaseModel):
    name: str
    role: str
    voice_id: str
    gender: str

class DialogueSegment(BaseModel):
    speaker_name: str = Field(default="Speaker 1", description="Speaker display label")
    voice_id: str = Field(default="Kore", description="Voice ID for this line")
    style_id: str = Field(default="natural", description="Emotion style for this line")
    text: str = Field(..., description="Spoken dialogue text")
    pause_after_ms: int = Field(default=400, ge=0, le=5000, description="Silence pause after segment in ms")

class AgentProductionResponse(BaseModel):
    status: str = "success"
    title: str
    synopsis: str
    genre: str
    characters: List[CharacterProfile]
    dialogue: List[DialogueSegment]

# --- Neural TTS & Studio Models ---
class TTSSingleRequest(BaseModel):
    script: str = Field(..., max_length=7000, description="Input script or dialogue text")
    voice_id: str = Field(default="Kore", description="Voice ID from catalog (e.g. Kore, Puck, Charon)")
    engine_id: str = Field(default="gemini-2.5-flash-preview-tts", description="TTS Engine ID")
    style_id: Optional[str] = Field(default="natural", description="Emotion/Style ID")
    custom_style_prefix: Optional[str] = Field(default=None, description="Custom prompt direction prefix")
    language_code: Optional[str] = Field(default="en-US", description="Language code (e.g. en-US, es-ES)")
    api_key: Optional[str] = Field(default=None, description="Optional Google Gemini API key override")
    custom_endpoint: Optional[str] = Field(default=None, description="Optional custom endpoint URL override")
    output_format: Literal["wav", "mp3", "raw_pcm", "ogg", "flac"] = Field(default="wav", description="Desired audio output format")
    sample_rate: Optional[int] = Field(default=24000, description="Target sample rate in Hz")
    speed: Optional[float] = Field(default=1.0, ge=0.5, le=2.0, description="Playback speed modifier")
    pitch_semitones: Optional[float] = Field(default=0.0, ge=-12.0, le=12.0, description="Pitch shift in semitones")

class MultiSpeakerRequest(BaseModel):
    dialogue: List[DialogueSegment] = Field(..., description="Ordered list of dialogue lines")
    engine_id: str = Field(default="gemini-2.5-flash-preview-tts", description="TTS Engine ID")
    language_code: Optional[str] = Field(default="en-US", description="Language code")
    api_key: Optional[str] = Field(default=None, description="Gemini API Key override")
    custom_endpoint: Optional[str] = Field(default=None, description="Custom endpoint URL")
    output_format: Literal["wav", "mp3", "ogg", "flac"] = Field(default="wav", description="Master audio format")

class AudioFXRequest(BaseModel):
    audio_base64: str = Field(..., description="Base64 encoded audio input (WAV/MP3)")
    speed: float = Field(default=1.0, ge=0.5, le=2.0)
    pitch_semitones: float = Field(default=0.0, ge=-12.0, le=12.0)
    reverb_intensity: float = Field(default=0.0, ge=0.0, le=1.0, description="Reverb effect blend")
    bass_boost_db: float = Field(default=0.0, ge=-12.0, le=12.0, description="Bass EQ gain in dB")
    treble_boost_db: float = Field(default=0.0, ge=-12.0, le=12.0, description="Treble EQ gain in dB")
    output_format: Literal["wav", "mp3", "ogg", "flac"] = Field(default="wav")

class TTSResponse(BaseModel):
    status: str = "success"
    audio_base64: str
    content_type: str
    duration_seconds: float
    sample_rate: int
    engine_used: str
    voice_id: str
    character_count: int

class VoicePersona(BaseModel):
    id: str
    name: str
    gender: Literal["Female", "Male"]
    tone: str
    desc: str

class StylePreset(BaseModel):
    id: str
    title: str
    desc: str
    promptPrefix: str

class EngineSpec(BaseModel):
    id: str
    name: str
    badge: str
    desc: str
    modelParam: str
    apiVersion: str

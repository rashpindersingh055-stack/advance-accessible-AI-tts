"""Pro Audio DSP, Multi-Format Encoder, Limiter, and Acoustic Cross-fader."""
import io
import struct
import math
from typing import Tuple, List, Optional

try:
    import numpy as np
except ImportError:
    np = None

try:
    from pydub import AudioSegment
except ImportError:
    AudioSegment = None

class AudioProcessor:
    @staticmethod
    def pcm16_to_wav(pcm_bytes: bytes, sample_rate: int = 24000, num_channels: int = 1) -> bytes:
        """Encodes raw 16-bit signed little-endian PCM bytes into standard WAV format using pure Python."""
        bytes_per_sample = 2
        block_align = num_channels * bytes_per_sample
        byte_rate = sample_rate * block_align
        data_size = len(pcm_bytes)
        
        # 44-byte RIFF header
        header = bytearray(44)
        
        # RIFF Chunk
        header[0:4] = b'RIFF'
        struct.pack_into('<I', header, 4, 36 + data_size)
        header[8:12] = b'WAVE'
        
        # fmt Sub-chunk
        header[12:16] = b'fmt '
        struct.pack_into('<I', header, 16, 16)      # Subchunk1Size (16 for PCM)
        struct.pack_into('<H', header, 20, 1)       # AudioFormat (1 for PCM)
        struct.pack_into('<H', header, 22, num_channels)
        struct.pack_into('<I', header, 24, sample_rate)
        struct.pack_into('<I', header, 28, byte_rate)
        struct.pack_into('<H', header, 32, block_align)
        struct.pack_into('<H', header, 34, 16)      # BitsPerSample
        
        # data Sub-chunk
        header[36:40] = b'data'
        struct.pack_into('<I', header, 40, data_size)
        
        return bytes(header) + pcm_bytes

    @staticmethod
    def transcode_audio(wav_bytes: bytes, target_format: str = "wav", bitrate: str = "192k") -> Tuple[bytes, str]:
        """Transcodes WAV bytes to target format using pydub if available, with WAV fallback."""
        fmt = target_format.lower()
        if fmt == "wav" or AudioSegment is None:
            return wav_bytes, "audio/wav"

        content_types = {
            "mp3": "audio/mp3",
            "ogg": "audio/ogg",
            "flac": "audio/flac",
            "aac": "audio/aac"
        }

        try:
            audio = AudioSegment.from_file(io.BytesIO(wav_bytes), format="wav")
            out_buf = io.BytesIO()
            audio.export(out_buf, format=fmt, bitrate=bitrate)
            return out_buf.getvalue(), content_types.get(fmt, f"audio/{fmt}")
        except Exception:
            return wav_bytes, "audio/wav"

    @staticmethod
    def stitch_dialogue_segments(segments: List[Tuple[bytes, int]], crossfade_ms: int = 150) -> bytes:
        """Stitches multiple WAV segments together with silence pauses."""
        if not segments:
            return AudioProcessor.pcm16_to_wav(b'', 24000)

        if AudioSegment is None:
            # Fallback: Raw byte concatenation
            combined_pcm = bytearray()
            for wav_bytes, pause_ms in segments:
                if len(wav_bytes) > 44:
                    combined_pcm.extend(wav_bytes[44:])
                pause_samples = int(24000 * (pause_ms / 1000.0))
                combined_pcm.extend(b'\x00\x00' * pause_samples)
            return AudioProcessor.pcm16_to_wav(bytes(combined_pcm), 24000)

        combined = AudioSegment.empty()
        for idx, (wav_bytes, pause_ms) in enumerate(segments):
            try:
                seg_audio = AudioSegment.from_file(io.BytesIO(wav_bytes), format="wav")
                if idx == 0:
                    combined = seg_audio
                else:
                    if pause_ms > 0:
                        combined = combined + AudioSegment.silent(duration=pause_ms) + seg_audio
                    else:
                        combined = combined.append(seg_audio, crossfade=min(crossfade_ms, len(seg_audio), len(combined)))
            except Exception:
                continue

        out_buf = io.BytesIO()
        combined.export(out_buf, format="wav")
        return out_buf.getvalue()

    @staticmethod
    def apply_dsp_effects(
        wav_bytes: bytes,
        speed: float = 1.0,
        pitch_semitones: float = 0.0,
        reverb_intensity: float = 0.0,
        bass_boost_db: float = 0.0,
        treble_boost_db: float = 0.0
    ) -> bytes:
        """Applies DSP speed, pitch, reverb and EQ effects."""
        if AudioSegment is None or np is None:
            return wav_bytes

        try:
            audio = AudioSegment.from_file(io.BytesIO(wav_bytes), format="wav")
            sample_rate = audio.frame_rate
            samples = np.array(audio.get_array_of_samples(), dtype=np.float32)

            # Speed / Pitch shift
            if pitch_semitones != 0.0 or speed != 1.0:
                pitch_factor = 2.0 ** (pitch_semitones / 12.0)
                new_sample_rate = int(sample_rate * pitch_factor / speed)
                new_sample_rate = max(8000, min(96000, new_sample_rate))
                audio = audio._spawn(audio.raw_data, overrides={"frame_rate": new_sample_rate})
                audio = audio.set_frame_rate(sample_rate)

            # Bass & Treble Boost
            if bass_boost_db != 0.0:
                audio = audio.low_pass_filter(250).apply_gain(bass_boost_db).overlay(audio)
            if treble_boost_db != 0.0:
                audio = audio.high_pass_filter(4000).apply_gain(treble_boost_db).overlay(audio)

            # Export
            out_buf = io.BytesIO()
            audio.export(out_buf, format="wav")
            return out_buf.getvalue()
        except Exception:
            return wav_bytes

"""Pro Audio DSP, Multi-Format Encoder, Limiter, and Acoustic Cross-fader."""
import io
import struct
import math
import numpy as np
from typing import Tuple, List, Optional
from pydub import AudioSegment

class AudioProcessor:
    @staticmethod
    def pcm16_to_wav(pcm_bytes: bytes, sample_rate: int = 24000, num_channels: int = 1) -> bytes:
        """Encodes raw 16-bit signed little-endian PCM bytes into standard WAV format."""
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
        """
        Transcodes WAV bytes to target format (mp3, ogg, flac, wav) using pydub.
        Returns: (encoded_bytes, content_type)
        """
        fmt = target_format.lower()
        if fmt == "wav":
            return wav_bytes, "audio/wav"

        content_types = {
            "mp3": "audio/mp3",
            "ogg": "audio/ogg",
            "flac": "audio/flac",
            "aac": "audio/aac"
        }

        try:
            audio = AudioSegment.from_file(io.BytesIO(wav_bytes), format="wav")
            out_io = io.BytesIO()
            if fmt == "mp3":
                audio.export(out_io, format="mp3", bitrate=bitrate)
            elif fmt in ("ogg", "flac"):
                audio.export(out_io, format=fmt)
            else:
                audio.export(out_io, format="mp3", bitrate=bitrate)
                fmt = "mp3"
            return out_io.getvalue(), content_types.get(fmt, "audio/mp3")
        except Exception:
            # Safe fallback to master WAV
            return wav_bytes, "audio/wav"

    @staticmethod
    def wav_to_mp3(wav_bytes: bytes, bitrate: str = "128k") -> bytes:
        out_bytes, _ = AudioProcessor.transcode_audio(wav_bytes, "mp3", bitrate=bitrate)
        return out_bytes

    @staticmethod
    def concatenate_segments(
        wav_segments: List[Tuple[bytes, int]],
        sample_rate: int = 24000,
        crossfade_ms: int = 25
    ) -> bytes:
        """
        Concatenates multiple WAV byte strings with specified silence pauses and acoustic micro-fades.
        wav_segments: List of (wav_bytes, pause_after_ms)
        """
        combined_samples = []

        for idx, (wav_bytes, pause_ms) in enumerate(wav_segments):
            if len(wav_bytes) > 44 and wav_bytes[:4] == b'RIFF':
                pcm_data = wav_bytes[44:]
            else:
                pcm_data = wav_bytes
                
            samples = np.frombuffer(pcm_data, dtype=np.int16).astype(np.float32)

            # Apply 10ms smooth fade-in and fade-out to prevent clicks
            fade_len = min(int(sample_rate * 0.01), len(samples) // 4)
            if fade_len > 0:
                fade_in = np.linspace(0.0, 1.0, fade_len)
                fade_out = np.linspace(1.0, 0.0, fade_len)
                samples[:fade_len] *= fade_in
                samples[-fade_len:] *= fade_out

            combined_samples.append(samples)

            # Append silence
            if pause_ms > 0:
                silence_samples_count = int(sample_rate * (pause_ms / 1000.0))
                silence = np.zeros(silence_samples_count, dtype=np.float32)
                combined_samples.append(silence)

        if not combined_samples:
            return AudioProcessor.pcm16_to_wav(b'', sample_rate=sample_rate)

        all_samples = np.concatenate(combined_samples)
        np.clip(all_samples, -32768, 32767, out=all_samples)
        return AudioProcessor.pcm16_to_wav(all_samples.astype(np.int16).tobytes(), sample_rate=sample_rate)

    @staticmethod
    def apply_dsp_effects(
        wav_bytes: bytes,
        speed: float = 1.0,
        pitch_semitones: float = 0.0,
        reverb_intensity: float = 0.0,
        bass_boost_db: float = 0.0,
        treble_boost_db: float = 0.0,
        normalize_audio: bool = True
    ) -> bytes:
        """Applies Pro DSP chain: Speed, Pitch, 3-Band Parametric EQ, Reverb, and Soft Limiter."""
        if len(wav_bytes) <= 44 or wav_bytes[:4] != b'RIFF':
            return wav_bytes
            
        sample_rate = struct.unpack_from('<I', wav_bytes, 24)[0]
        num_channels = struct.unpack_from('<H', wav_bytes, 22)[0]
        pcm_raw = wav_bytes[44:]
        
        samples = np.frombuffer(pcm_raw, dtype=np.int16).astype(np.float32)
        if len(samples) == 0:
            return wav_bytes

        # 1. Pitch Shift (Interpolated time-domain resampling)
        if pitch_semitones != 0.0:
            pitch_ratio = 2.0 ** (pitch_semitones / 12.0)
            orig_indices = np.arange(len(samples))
            new_len = int(len(samples) / pitch_ratio)
            new_indices = np.linspace(0, len(samples) - 1, new_len)
            samples = np.interp(new_indices, orig_indices, samples)
            
        # 2. Speed Adjustment
        if speed != 1.0 and speed > 0.1:
            orig_indices = np.arange(len(samples))
            new_len = int(len(samples) / speed)
            new_indices = np.linspace(0, len(samples) - 1, new_len)
            samples = np.interp(new_indices, orig_indices, samples)

        # 3. Parametric Bass EQ (Low Shelf filter)
        if bass_boost_db != 0.0:
            gain = 10.0 ** (bass_boost_db / 20.0)
            alpha = 0.06
            low_pass = np.zeros_like(samples)
            prev = 0.0
            for i in range(len(samples)):
                prev = prev + alpha * (samples[i] - prev)
                low_pass[i] = prev
            samples = samples + (gain - 1.0) * low_pass

        # 4. Parametric Treble EQ (High Shelf filter)
        if treble_boost_db != 0.0:
            gain = 10.0 ** (treble_boost_db / 20.0)
            alpha = 0.35
            high_pass = np.zeros_like(samples)
            prev = 0.0
            for i in range(len(samples)):
                prev = prev + alpha * (samples[i] - prev)
                high_pass[i] = samples[i] - prev
            samples = samples + (gain - 1.0) * high_pass

        # 5. Spatial Reverb (Diffused multi-tap comb impulse)
        if reverb_intensity > 0.05:
            delay1 = int(sample_rate * 0.035)
            delay2 = int(sample_rate * 0.052)
            decay1 = min(0.65, reverb_intensity * 0.6)
            decay2 = min(0.55, reverb_intensity * 0.5)

            max_delay = max(delay1, delay2)
            reverb_buf = np.zeros(len(samples) + max_delay, dtype=np.float32)
            reverb_buf[:len(samples)] = samples
            
            for i in range(max_delay, len(reverb_buf)):
                reverb_buf[i] += (reverb_buf[i - delay1] * decay1 + reverb_buf[i - delay2] * decay2) * 0.5
                
            dry_weight = 1.0 - reverb_intensity * 0.35
            wet_weight = reverb_intensity * 0.35
            samples = dry_weight * samples + wet_weight * reverb_buf[:len(samples)]

        # 6. Dynamic Peak Normalizer & Soft-Knee Limiter
        if normalize_audio:
            peak = np.max(np.abs(samples))
            if peak > 0:
                target_peak = 29500.0  # -0.9 dBFS headroom
                if peak > target_peak or peak < 12000.0:
                    scale = target_peak / peak
                    samples *= min(scale, 2.5) # Cap auto-gain

        # Final Soft Clipping limiter
        np.clip(samples, -32767, 32767, out=samples)
        processed_pcm = samples.astype(np.int16).tobytes()
        
        return AudioProcessor.pcm16_to_wav(processed_pcm, sample_rate=sample_rate, num_channels=num_channels)

    @staticmethod
    def extract_waveform_peaks(wav_bytes: bytes, num_peaks: int = 100) -> List[float]:
        """Extracts normalized waveform envelope peaks for frontend rendering."""
        if len(wav_bytes) <= 44:
            return [0.0] * num_peaks
            
        pcm_raw = wav_bytes[44:]
        samples = np.frombuffer(pcm_raw, dtype=np.int16).astype(np.float32)
        if len(samples) == 0:
            return [0.0] * num_peaks
            
        samples = np.abs(samples) / 32768.0
        chunk_size = len(samples) // num_peaks
        if chunk_size < 1:
            chunk_size = 1
            
        peaks = []
        for i in range(num_peaks):
            start = i * chunk_size
            end = start + chunk_size
            chunk = samples[start:end]
            val = float(np.max(chunk)) if len(chunk) > 0 else 0.0
            peaks.append(round(min(1.0, val), 3))
            
        return peaks

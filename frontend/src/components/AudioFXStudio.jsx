import React, { useState } from 'react';
import { Sliders, Play, Pause, Download, Volume2, Sparkles, Music, Wind, Radio, RotateCcw } from 'lucide-react';
import { pcmToWavBlob, triggerFileDownload, encodePcmToMp3 } from '../utils/audio';

export default function AudioFXStudio({
  audioBlob,
  pcmRawData,
  isPlaying,
  onTogglePlay
}) {
  const [pitchSemitones, setPitchSemitones] = useState(0);
  const [speedMod, setSpeedMod] = useState(1.0);
  const [reverbWet, setReverbWet] = useState(0.2);
  const [bassGainDb, setBassGainDb] = useState(3.0);
  const [ambientSound, setAmbientSound] = useState('none');
  const [ambientVolume, setAmbientVolume] = useState(0.3);

  const [processedBlob, setProcessedBlob] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEncodingMp3, setIsEncodingMp3] = useState(false);

  const ambientTracks = [
    { id: 'none', label: 'None (Pure Voice)' },
    { id: 'space', label: '🌌 Deep Space Drone' },
    { id: 'rain', label: '🌧️ Gentle Rain Ambience' },
    { id: 'cyber', label: '⚡ Cyberpunk Synth Beat' },
    { id: 'lofi', label: '☕ Chill Lo-Fi Room' }
  ];

  const resetEffects = () => {
    setPitchSemitones(0);
    setSpeedMod(1.0);
    setReverbWet(0.0);
    setBassGainDb(0.0);
    setAmbientSound('none');
    setProcessedBlob(null);
  };

  // DSP Processor (In-Browser Web Audio & PCM Resampling)
  const handleApplyDSP = async () => {
    if (!pcmRawData) return;
    setIsProcessing(true);

    try {
      const { data, sampleRate } = pcmRawData;
      let samples = new Float32Array(data.length);
      for (let i = 0; i < data.length; i++) {
        samples[i] = data[i];
      }

      // 1. Resample for pitch modulation
      if (pitchSemitones !== 0) {
        const pitchRatio = Math.pow(2, pitchSemitones / 12);
        const newLen = Math.floor(samples.length / pitchRatio);
        const newSamples = new Float32Array(newLen);
        for (let i = 0; i < newLen; i++) {
          const origIdx = (i / newLen) * (samples.length - 1);
          const i0 = Math.floor(origIdx);
          const i1 = Math.min(i0 + 1, samples.length - 1);
          const frac = origIdx - i0;
          newSamples[i] = samples[i0] * (1 - frac) + samples[i1] * frac;
        }
        samples = newSamples;
      }

      // 2. Simulated Reverb Feedback
      if (reverbWet > 0.05) {
        const delaySamples = Math.floor(sampleRate * 0.045);
        const decay = Math.min(0.7, reverbWet * 0.65);
        const reverbBuf = new Float32Array(samples.length + delaySamples);
        reverbBuf.set(samples);

        for (let i = delaySamples; i < reverbBuf.length; i++) {
          reverbBuf[i] += reverbBuf[i - delaySamples] * decay;
        }

        for (let i = 0; i < samples.length; i++) {
          samples[i] = (1 - reverbWet * 0.3) * samples[i] + reverbWet * 0.3 * reverbBuf[i];
        }
      }

      // 3. Bass Boost Simulation
      if (bassGainDb !== 0) {
        const gain = Math.pow(10, bassGainDb / 20);
        let prev = 0;
        const alpha = 0.06;
        for (let i = 0; i < samples.length; i++) {
          prev = prev + alpha * (samples[i] - prev);
          samples[i] = samples[i] + (gain - 1) * prev;
        }
      }

      // Convert back to Int16
      const outPcm = new Int16Array(samples.length);
      for (let i = 0; i < samples.length; i++) {
        outPcm[i] = Math.max(-32768, Math.min(32767, Math.round(samples[i])));
      }

      const outWav = pcmToWavBlob(outPcm, sampleRate, 1);
      setProcessedBlob(outWav);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-600 via-purple-600 to-indigo-600 p-0.5 shadow-lg shadow-pink-500/25 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sliders className="w-6 h-6 text-pink-400" />
            </div>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white">Audio FX & DSP Mastering Lab</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Transform vocal acoustics with parametric pitch, spatial reverb, bass EQ, and ambient soundscapes.
            </p>
          </div>
        </div>

        <button
          onClick={resetEffects}
          className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset DSP</span>
        </button>
      </div>

      {!pcmRawData && (
        <div className="glass-panel rounded-3xl p-8 text-center text-slate-400 border border-slate-800 space-y-2">
          <p className="font-semibold text-slate-200">No Master Audio Track Loaded</p>
          <p className="text-xs">Generate a voice track in the Neural Studio tab first to apply DSP mastering effects.</p>
        </div>
      )}

      {pcmRawData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* DSP Controls Column 1 */}
          <div className="glass-panel rounded-3xl p-5 border border-slate-800 space-y-5 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Pitch Shift & Timbre Modulation</span>
            </h3>

            {/* Pitch slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Pitch Shift (Semitones)</span>
                <span className="font-mono text-indigo-300">
                  {pitchSemitones > 0 ? `+${pitchSemitones}` : pitchSemitones} st
                </span>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                step="1"
                value={pitchSemitones}
                onChange={(e) => setPitchSemitones(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>-12st (Deep Baritone)</span>
                <span>0 (Natural)</span>
                <span>+12st (Bright)</span>
              </div>
            </div>

            {/* Bass Gain Slider */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Bass Warmth / Proximity EQ</span>
                <span className="font-mono text-purple-300">+{bassGainDb} dB</span>
              </div>
              <input
                type="range"
                min="0"
                max="12"
                step="0.5"
                value={bassGainDb}
                onChange={(e) => setBassGainDb(parseFloat(e.target.value))}
                className="w-full accent-purple-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0 dB (Flat)</span>
                <span>+6 dB (Broadcast Warmth)</span>
                <span>+12 dB (Heavy)</span>
              </div>
            </div>
          </div>

          {/* DSP Controls Column 2 */}
          <div className="glass-panel rounded-3xl p-5 border border-slate-800 space-y-5 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Wind className="w-4 h-4 text-pink-400" />
              <span>Spatial Reverb & Ambient Mix</span>
            </h3>

            {/* Spatial Reverb */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Spatial Acoustic Reverb</span>
                <span className="font-mono text-pink-300">{Math.round(reverbWet * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={reverbWet}
                onChange={(e) => setReverbWet(parseFloat(e.target.value))}
                className="w-full accent-pink-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Dry (Direct Studio)</span>
                <span>Room Hall</span>
                <span>Cathedral Reverb</span>
              </div>
            </div>

            {/* Ambient Soundscapes */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <label className="block text-xs font-semibold text-slate-400">Atmospheric Soundscape</label>
              <select
                value={ambientSound}
                onChange={(e) => setAmbientSound(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-pink-500"
              >
                {ambientTracks.map((track) => (
                  <option key={track.id} value={track.id}>
                    {track.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {pcmRawData && (
        <div className="glass-panel-glow rounded-3xl p-6 border border-pink-500/30 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-white text-base">Render Mastered DSP Output</h3>
            <p className="text-xs text-slate-400 mt-0.5">Applies acoustic DSP pipeline to create high-fidelity master output.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleApplyDSP}
              disabled={isProcessing}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-pink-600/30 flex items-center gap-2 hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isProcessing ? 'Processing DSP...' : 'Process Audio Effects'}</span>
            </button>

            {processedBlob && (
              <button
                onClick={() => triggerFileDownload(processedBlob, `VisionMax_DSP_${Date.now()}.wav`)}
                className="px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-white flex items-center gap-1.5 hover:scale-105"
              >
                <Download className="w-4 h-4 text-pink-400" />
                <span>Download Mastered WAV</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

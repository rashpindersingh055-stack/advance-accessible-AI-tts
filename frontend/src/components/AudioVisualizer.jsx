import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Download, Disc, Sparkles } from 'lucide-react';
import { formatTime } from '../utils/audio';

export default function AudioVisualizer({
  audioBlob,
  pcmRawData,
  isPlaying,
  currentTime,
  audioDuration,
  playbackSpeed,
  volume,
  isMuted,
  isEncodingMp3,
  voiceName,
  engineName,
  onTogglePlay,
  onSeek,
  onSkipSeconds,
  onSpeedChange,
  onVolumeChange,
  onToggleMute,
  onDownloadWav,
  onDownloadMp3
}) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const [hoverTime, setHoverTime] = useState(null);

  // Dynamic Multi-Bar Waveform Rendering (60 FPS)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      const numBars = 56;
      const barWidth = width / numBars - 2;

      for (let i = 0; i < numBars; i++) {
        let barHeight;
        if (isPlaying) {
          const freq = Math.sin(phase + i * 0.28) * Math.cos(phase * 0.6 + i * 0.16);
          barHeight = Math.max(6, Math.abs(freq) * (height * 0.85));
        } else if (audioBlob) {
          const wave = Math.sin(i * 0.32) * Math.cos(i * 0.18);
          barHeight = Math.max(4, Math.abs(wave) * (height * 0.55));
        } else {
          barHeight = 4;
        }

        const progressPercent = audioDuration > 0 ? currentTime / audioDuration : 0;
        const currentBarProgress = i / numBars;
        const isPast = currentBarProgress <= progressPercent;

        const grad = ctx.createLinearGradient(0, centerY - barHeight / 2, 0, centerY + barHeight / 2);
        if (isPast) {
          grad.addColorStop(0, '#818cf8'); // Indigo-400
          grad.addColorStop(0.5, '#c084fc'); // Purple-400
          grad.addColorStop(1, '#ec4899'); // Pink-500
        } else {
          grad.addColorStop(0, '#334155');
          grad.addColorStop(1, '#1e293b');
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(i * (barWidth + 2), centerY - barHeight / 2, barWidth, barHeight, [3]);
        ctx.fill();
      }

      if (isPlaying) {
        phase += 0.08 * playbackSpeed;
      }
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isPlaying, audioBlob, currentTime, audioDuration, playbackSpeed]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    setHoverTime(Math.max(0, Math.min(audioDuration, pos * audioDuration)));
  };

  const handleMouseLeave = () => setHoverTime(null);

  const handleScrubClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    onSeek(pos * audioDuration);
  };

  const progressPercent = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;

  return (
    <div className="glass-panel-glow rounded-3xl p-5 sm:p-6 shadow-2xl border border-indigo-500/30 transition-all">
      {/* Track Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 border border-indigo-400/30 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Disc className={`w-5 h-5 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base">
                Master Audio Deck — {voiceName}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                24kHz Lossless
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Engine: <span className="font-mono text-indigo-300">{engineName}</span>
            </p>
          </div>
        </div>

        {/* Action Downloads */}
        <div className="flex items-center gap-2">
          <button
            onClick={onDownloadWav}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white transition-all flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95"
            title="Download uncompressed studio WAV"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Download WAV</span>
          </button>

          <button
            onClick={onDownloadMp3}
            disabled={isEncodingMp3}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-xs font-bold text-white transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95 disabled:opacity-50"
            title="Encode and download compressed MP3"
          >
            {isEncodingMp3 ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-white" />
                <span>Encoding MP3...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-white" />
                <span>Download MP3</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Waveform Canvas & Scrub Timeline */}
      <div className="mt-5 space-y-2">
        <div
          onClick={handleScrubClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full h-24 sm:h-28 bg-slate-950/90 rounded-2xl p-2 border border-slate-800/90 relative cursor-pointer group overflow-hidden"
        >
          <canvas ref={canvasRef} width={900} height={100} className="w-full h-full block" />

          {/* Progress Overlay bar */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-indigo-500/10 pointer-events-none transition-all"
            style={{ width: `${progressPercent}%` }}
          />

          {/* Scrub Needle Line */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-pink-500 pointer-events-none shadow-glow transition-all"
            style={{ left: `${progressPercent}%` }}
          />

          {/* Hover Time Tooltip */}
          {hoverTime !== null && (
            <div
              className="absolute top-2 -translate-x-1/2 bg-slate-900/90 border border-slate-700 text-indigo-300 font-mono text-[10px] px-2 py-0.5 rounded pointer-events-none"
              style={{ left: `${(hoverTime / audioDuration) * 100}%` }}
            >
              {formatTime(hoverTime)}
            </div>
          )}
        </div>

        {/* Time Elapsed / Total Duration */}
        <div className="flex justify-between text-xs font-mono text-slate-400 px-1">
          <span>{formatTime(currentTime)}</span>
          <span className="text-slate-500">• 24,000 Hz Studio PCM •</span>
          <span>{formatTime(audioDuration)}</span>
        </div>
      </div>

      {/* Control Transport Deck */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 pt-2">
        {/* Playback Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSkipSeconds(-5)}
            className="w-10 h-10 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            title="Rewind 5s"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onTogglePlay}
            className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white shadow-xl shadow-indigo-600/40 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={() => onSkipSeconds(5)}
            className="w-10 h-10 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            title="Forward 5s"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Speed & Volume Multipliers */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Speed Selector */}
          <div className="flex items-center bg-slate-900/90 rounded-2xl p-1 border border-slate-800">
            {[0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
              <button
                key={rate}
                onClick={() => onSpeedChange(rate)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                  playbackSpeed === rate
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          {/* Volume Slider */}
          <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-2xl border border-slate-800">
            <button onClick={onToggleMute} className="text-slate-400 hover:text-white transition-colors">
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-indigo-400" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-16 sm:w-20 accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

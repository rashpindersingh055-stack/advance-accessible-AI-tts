import React, { useState } from 'react';
import { Mic, Sparkles, Globe, Smile, ChevronRight, Wand2, Trash2, ArrowUpRight, Volume2, AlertCircle } from 'lucide-react';
import { SAMPLE_SCRIPTS, STYLES, LANGUAGES } from '../constants/voices';
import AudioVisualizer from './AudioVisualizer';

export default function SingleSpeakerStudio({
  selectedVoice,
  selectedStyle,
  selectedLanguage,
  selectedEngine,
  scriptText,
  isGenerating,
  generationProgress,
  errorMsg,
  audioBlob,
  pcmRawData,
  isPlaying,
  currentTime,
  audioDuration,
  playbackSpeed,
  volume,
  isMuted,
  isEncodingMp3,
  onOpenVoiceModal,
  onSelectStyle,
  onSelectLanguage,
  onScriptChange,
  onGenerate,
  onClearScript,
  onTogglePlay,
  onSeek,
  onSkipSeconds,
  onSpeedChange,
  onVolumeChange,
  onToggleMute,
  onDownloadWav,
  onDownloadMp3,
  onDismissError
}) {
  const [isLangOpen, setIsLangOpen] = useState(false);

  const insertPause = (seconds = 1) => {
    onScriptChange(scriptText + ` ... [pause ${seconds}s] ... `);
  };

  return (
    <div className="space-y-6">
      {/* Error Alert Box */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-950/70 border border-red-800/80 text-red-200 text-sm flex items-start gap-3 shadow-xl animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-red-300">Speech Synthesis Notice</p>
            <p className="text-xs mt-0.5 text-red-200/90 leading-relaxed">{errorMsg}</p>
          </div>
          <button onClick={onDismissError} className="text-red-400 hover:text-white text-xs p-1">
            ✕
          </button>
        </div>
      )}

      {/* Top Controls Deck: Voice Persona, Emotion Style, Spoken Language */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Voice Selector Card */}
        <div className="glass-panel rounded-3xl p-4 sm:p-5 flex flex-col justify-between shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-indigo-400" />
              Primary Voice Persona
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              selectedVoice.gender === 'Female'
                ? 'bg-pink-500/10 text-pink-400 border border-pink-500/25'
                : 'bg-blue-500/10 text-blue-400 border border-blue-500/25'
            }`}>
              {selectedVoice.gender}
            </span>
          </div>

          <div className="my-2">
            <div className="text-xl font-extrabold text-white flex items-center gap-2">
              <span>{selectedVoice.name}</span>
              <span className="text-xs font-normal text-indigo-300">({selectedVoice.tone})</span>
            </div>
            <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">{selectedVoice.desc}</p>
          </div>

          <button
            onClick={onOpenVoiceModal}
            className="w-full mt-3 py-2.5 px-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs font-bold text-indigo-300 flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Explore 30 Voice Gallery</span>
            <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
          </button>
        </div>

        {/* 2. Emotion & Vocal Style Selector */}
        <div className="glass-panel rounded-3xl p-4 sm:p-5 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Smile className="w-4 h-4 text-purple-400" />
              Emotion & Vocal Style
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/25 font-bold">
              10 Modes
            </span>
          </div>

          <div className="relative">
            <select
              value={selectedStyle.id}
              onChange={(e) => {
                const style = STYLES.find((s) => s.id === e.target.value);
                if (style) onSelectStyle(style);
              }}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-2xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer"
            >
              {STYLES.map((style) => (
                <option key={style.id} value={style.id} className="bg-slate-900 py-1">
                  {style.title}
                </option>
              ))}
            </select>
          </div>

          <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">{selectedStyle.desc}</p>
        </div>

        {/* 3. Spoken Language Selector */}
        <div className="glass-panel rounded-3xl p-4 sm:p-5 flex flex-col justify-between shadow-xl relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-400" />
              Language & Accent
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 font-bold">
              13 Locales
            </span>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-2xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{selectedLanguage.flag}</span>
                <span>{selectedLanguage.name}</span>
              </div>
              <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isLangOpen ? 'rotate-90' : ''}`} />
            </button>

            {isLangOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-30 max-h-56 overflow-y-auto divide-y divide-slate-800">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onSelectLanguage(lang);
                      setIsLangOpen(false);
                    }}
                    className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center gap-2.5 transition-colors ${
                      selectedLanguage.code === lang.code
                        ? 'bg-indigo-600/30 text-indigo-300 font-bold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-sm">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <p className="text-xs text-slate-400 mt-2 leading-relaxed">Multimodal acoustic timbre with native resonance.</p>
        </div>
      </div>

      {/* Script & Dialogue Editor Studio Box */}
      <div className="glass-panel rounded-3xl p-5 lg:p-6 shadow-2xl border border-slate-800 relative">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>Script & Direction Console</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-900 text-indigo-300 border border-slate-700">
                {selectedEngine.badge}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Type or paste dialogue. Punctuation (commas, ellipses, quotes) creates natural acoustic breathing.
            </p>
          </div>

          {/* Quick Sample Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
            <span className="text-xs font-semibold text-slate-400 mr-1 hidden sm:inline">Presets:</span>
            {SAMPLE_SCRIPTS.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => onScriptChange(sample.text)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-[11px] font-semibold text-slate-300 whitespace-nowrap transition-all hover:scale-105 active:scale-95"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text Area */}
        <div className="mt-4 relative">
          <textarea
            rows={7}
            value={scriptText}
            onChange={(e) => onScriptChange(e.target.value)}
            placeholder="Enter your script here (up to 7,000 characters). Feel free to use commas, ellipses (...), question marks, and exclamation points for expressive pauses and emotional intonations..."
            maxLength={7000}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-slate-100 text-sm sm:text-base leading-relaxed placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500 transition-all resize-y min-h-[170px]"
          />

          {/* Bottom Text Area Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 px-1 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <span className={`font-mono ${scriptText.length > 6800 ? 'text-amber-400 font-bold' : ''}`}>
                {scriptText.length.toLocaleString()} / 7,000 chars
              </span>
              {scriptText.length > 0 && (
                <button
                  onClick={onClearScript}
                  className="text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 hidden sm:inline">Active Emotion:</span>
              <span className="text-xs px-2 py-0.5 rounded-lg bg-indigo-950/60 text-indigo-300 border border-indigo-800/60 font-semibold">
                {selectedStyle.title}
              </span>
            </div>
          </div>
        </div>

        {/* Generate Button Row */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
            <span>Engine: <b className="text-slate-200 font-mono">{selectedEngine.modelParam}</b></span>
            <span className="hidden md:inline">• Format: <b className="text-indigo-300">24kHz PCM16 WAV</b></span>
          </div>

          <button
            onClick={onGenerate}
            disabled={isGenerating || !scriptText.trim()}
            className={`px-8 py-3.5 rounded-2xl font-bold text-sm tracking-wide transition-all shadow-2xl flex items-center gap-2.5 ${
              isGenerating || !scriptText.trim()
                ? 'bg-slate-900 text-slate-500 cursor-not-allowed border border-slate-800'
                : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white shadow-indigo-600/35 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-white" />
                <span>Synthesizing Voice... ({generationProgress}%)</span>
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5 text-indigo-200" />
                <span>Generate Speech</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Custom Studio Audio Deck */}
      {audioBlob && (
        <AudioVisualizer
          audioBlob={audioBlob}
          pcmRawData={pcmRawData}
          isPlaying={isPlaying}
          currentTime={currentTime}
          audioDuration={audioDuration}
          playbackSpeed={playbackSpeed}
          volume={volume}
          isMuted={isMuted}
          isEncodingMp3={isEncodingMp3}
          voiceName={selectedVoice.name}
          engineName={selectedEngine.modelParam}
          onTogglePlay={onTogglePlay}
          onSeek={onSeek}
          onSkipSeconds={onSkipSeconds}
          onSpeedChange={onSpeedChange}
          onVolumeChange={onVolumeChange}
          onToggleMute={onToggleMute}
          onDownloadWav={onDownloadWav}
          onDownloadMp3={onDownloadMp3}
        />
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Layers, Plus, Trash2, Play, Pause, Download, Wand2, Sparkles, User, Clock, ArrowDown } from 'lucide-react';
import { VOICES, STYLES, SAMPLE_DIALOGUE } from '../constants/voices';
import { pcmToWavBlob, triggerFileDownload, encodePcmToMp3 } from '../utils/audio';
import { generateGeminiSpeechDirect } from '../services/api';

export default function MultiSpeakerStudio({
  selectedEngine,
  apiKey,
  customEndpointUrl,
  useCustomEndpoint
}) {
  const [lines, setLines] = useState(SAMPLE_DIALOGUE);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthProgress, setSynthProgress] = useState(0);
  const [masterAudioBlob, setMasterAudioBlob] = useState(null);
  const [masterPcmData, setMasterPcmData] = useState(null);
  const [masterDuration, setMasterDuration] = useState(0);
  const [isPlayingMaster, setIsPlayingMaster] = useState(false);
  const [activeLinePlaying, setActiveLinePlaying] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isEncodingMp3, setIsEncodingMp3] = useState(false);

  const audioRef = React.useRef(null);

  const addLine = () => {
    const newLine = {
      id: `line-${Date.now()}`,
      speaker_name: `Speaker ${lines.length + 1}`,
      voice_id: VOICES[(lines.length + 1) % VOICES.length].id,
      style_id: 'natural',
      text: '',
      pause_after_ms: 400
    };
    setLines([...lines, newLine]);
  };

  const removeLine = (id) => {
    if (lines.length <= 1) return;
    setLines(lines.filter((l) => l.id !== id));
  };

  const updateLine = (id, field, value) => {
    setLines(lines.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  // Synthesize entire dialogue multi-speaker sequence
  const handleSynthesizeDialogue = async () => {
    setErrorMsg(null);
    setIsSynthesizing(true);
    setSynthProgress(5);

    try {
      const pcmChunks = [];
      let totalSampleRate = 24000;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line.text.trim()) continue;

        const currentStyle = STYLES.find((s) => s.id === line.style_id) || STYLES[0];
        setSynthProgress(Math.round(((i + 1) / lines.length) * 85));

        const result = await generateGeminiSpeechDirect({
          script: line.text,
          voiceId: line.voice_id,
          engine: selectedEngine,
          stylePrefix: currentStyle.promptPrefix,
          apiKey,
          customEndpointUrl,
          useCustomEndpoint
        });

        totalSampleRate = result.sampleRate;
        pcmChunks.push(result.pcmRawData.data);

        // Add silence gap
        if (line.pause_after_ms > 0) {
          const silenceLength = Math.round(totalSampleRate * (line.pause_after_ms / 1000));
          pcmChunks.push(new Int16Array(silenceLength));
        }
      }

      if (pcmChunks.length === 0) {
        throw new Error('Please fill in at least one dialogue line text.');
      }

      // Concatenate all PCM chunks
      const totalSamples = pcmChunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const compositePcm = new Int16Array(totalSamples);
      let offset = 0;
      for (const chunk of pcmChunks) {
        compositePcm.set(chunk, offset);
        offset += chunk.length;
      }

      const compositeWav = pcmToWavBlob(compositePcm, totalSampleRate, 1);
      setMasterAudioBlob(compositeWav);
      setMasterPcmData({ data: compositePcm, sampleRate: totalSampleRate });
      setMasterDuration(compositePcm.length / totalSampleRate);
      setSynthProgress(100);
    } catch (err) {
      setErrorMsg(err.message || 'Dialogue synthesis failed.');
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleDownloadMasterWav = () => {
    if (!masterAudioBlob) return;
    triggerFileDownload(masterAudioBlob, `VisionMax_Dialogue_Master_${Date.now()}.wav`);
  };

  const handleDownloadMasterMp3 = async () => {
    if (!masterPcmData) return;
    setIsEncodingMp3(true);
    try {
      const mp3Blob = await encodePcmToMp3(masterPcmData.data, masterPcmData.sampleRate);
      triggerFileDownload(mp3Blob, `VisionMax_Dialogue_Master_${Date.now()}.mp3`);
    } catch (err) {
      handleDownloadMasterWav();
    } finally {
      setIsEncodingMp3(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden Master Audio */}
      {masterAudioBlob && (
        <audio
          ref={audioRef}
          src={URL.createObjectURL(masterAudioBlob)}
          onEnded={() => setIsPlayingMaster(false)}
        />
      )}

      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-indigo-600 p-0.5 shadow-lg shadow-purple-500/25 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Layers className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-white">Multi-Speaker Podcast & Dialogue Studio</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Continuous Stitched Track
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Cast multiple voices, orchestrate emotion shifts, and insert precision pauses between dialogue turns.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={addLine}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white transition-all flex items-center gap-1.5 hover:scale-105"
          >
            <Plus className="w-4 h-4 text-purple-400" />
            <span>Add Dialogue Line</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-950/70 border border-red-800 text-red-200 text-xs shadow-lg">
          {errorMsg}
        </div>
      )}

      {/* Dialogue Script Timeline Items */}
      <div className="space-y-3">
        {lines.map((line, idx) => (
          <div
            key={line.id}
            className="glass-card rounded-2xl p-4 transition-all space-y-3 border border-slate-800/80 shadow-lg hover:border-slate-700"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Speaker Label & Index */}
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-600/20 border border-purple-500/40 text-purple-300 font-mono text-xs font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  value={line.speaker_name}
                  onChange={(e) => updateLine(line.id, 'speaker_name', e.target.value)}
                  placeholder="Speaker Name"
                  className="bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-purple-500 w-32 sm:w-40"
                />
              </div>

              {/* Voice & Style Selectors */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Voice Selection */}
                <select
                  value={line.voice_id}
                  onChange={(e) => updateLine(line.id, 'voice_id', e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs font-semibold text-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  {VOICES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.gender}, {v.tone})
                    </option>
                  ))}
                </select>

                {/* Emotion Selection */}
                <select
                  value={line.style_id}
                  onChange={(e) => updateLine(line.id, 'style_id', e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs font-semibold text-purple-300 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                >
                  {STYLES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>

                {/* Pause after (ms) */}
                <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-xl border border-slate-700 text-xs">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <input
                    type="number"
                    min="0"
                    max="5000"
                    step="100"
                    value={line.pause_after_ms}
                    onChange={(e) => updateLine(line.id, 'pause_after_ms', parseInt(e.target.value, 10) || 0)}
                    className="w-12 bg-transparent text-white font-mono text-[11px] focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500">ms gap</span>
                </div>

                {/* Delete Line */}
                {lines.length > 1 && (
                  <button
                    onClick={() => removeLine(line.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                    title="Remove line"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Line Text Area */}
            <textarea
              rows={2}
              value={line.text}
              onChange={(e) => updateLine(line.id, 'text', e.target.value)}
              placeholder={`Dialogue script for ${line.speaker_name}...`}
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-slate-100 text-xs sm:text-sm leading-relaxed placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500/60 transition-all resize-y"
            />
          </div>
        ))}
      </div>

      {/* Synthesize Button & Master Dialogue Player */}
      <div className="glass-panel-glow rounded-3xl p-5 sm:p-6 border border-purple-500/30 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <span>Render Stitched Multi-Speaker Track</span>
            <span className="text-xs text-slate-400 font-normal">({lines.length} segments queued)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Synthesizes all speaker nodes and stitches continuous studio audio with gap pauses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSynthesizeDialogue}
            disabled={isSynthesizing}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs sm:text-sm transition-all shadow-xl shadow-purple-600/30 flex items-center gap-2 hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {isSynthesizing ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-white" />
                <span>Synthesizing Dialogue ({synthProgress}%)...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 text-white" />
                <span>Synthesize Master Dialogue</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Master Track Player Deck */}
      {masterAudioBlob && (
        <div className="glass-panel rounded-3xl p-5 border border-purple-500/40 shadow-2xl space-y-4 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (audioRef.current) {
                    if (isPlayingMaster) {
                      audioRef.current.pause();
                      setIsPlayingMaster(false);
                    } else {
                      audioRef.current.play();
                      setIsPlayingMaster(true);
                    }
                  }
                }}
                className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/40 hover:scale-105 transition-transform"
              >
                {isPlayingMaster ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
              <div>
                <h4 className="font-bold text-white text-sm">Master Dialogue Output Track</h4>
                <p className="text-xs text-slate-400">Duration: ~{masterDuration.toFixed(1)}s • 24kHz Studio Quality</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadMasterWav}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-white flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-purple-400" />
                <span>Download Master WAV</span>
              </button>

              <button
                onClick={handleDownloadMasterMp3}
                disabled={isEncodingMp3}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-purple-600/30"
              >
                <Download className="w-3.5 h-3.5 text-white" />
                <span>{isEncodingMp3 ? 'Encoding MP3...' : 'Download Master MP3'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

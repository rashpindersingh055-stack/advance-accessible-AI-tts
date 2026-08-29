import React, { useState } from 'react';
import { Radio, Plus, Trash2, Play, Pause, Download, Sparkles, Wand2, CheckCircle2, AlertCircle } from 'lucide-react';
import { VOICES, STYLES } from '../constants/voices';
import { generateGeminiSpeechDirect } from '../services/api';
import { triggerFileDownload, encodePcmToMp3 } from '../utils/audio';

export default function BatchStudio({
  selectedEngine,
  apiKey,
  customEndpointUrl,
  useCustomEndpoint
}) {
  const [batchItems, setBatchItems] = useState([
    { id: 'item-1', label: 'Chapter 1 Intro', text: 'Welcome to the deep dive audio series.', voice_id: 'Kore', style_id: 'natural', status: 'idle', result: null },
    { id: 'item-2', label: 'System Alert', text: 'Attention all personnel, warp drive initialization sequence engaged.', voice_id: 'Fenrir', style_id: 'news_anchor', status: 'idle', result: null },
    { id: 'item-3', label: 'Wellness Thought', text: 'Peace comes from within. Do not seek it without.', voice_id: 'Zephyr', style_id: 'meditative', status: 'idle', result: null }
  ]);

  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [playingItemId, setPlayingItemId] = useState(null);
  const audioRef = React.useRef(null);

  const addItem = () => {
    setBatchItems([
      ...batchItems,
      {
        id: `item-${Date.now()}`,
        label: `Item ${batchItems.length + 1}`,
        text: '',
        voice_id: 'Kore',
        style_id: 'natural',
        status: 'idle',
        result: null
      }
    ]);
  };

  const removeItem = (id) => {
    setBatchItems(batchItems.filter((i) => i.id !== id));
  };

  const updateItem = (id, field, value) => {
    setBatchItems(batchItems.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const synthesizeSingleItem = async (item) => {
    if (!item.text.trim()) return;

    updateItem(item.id, 'status', 'synthesizing');
    const style = STYLES.find((s) => s.id === item.style_id) || STYLES[0];

    try {
      const res = await generateGeminiSpeechDirect({
        script: item.text,
        voiceId: item.voice_id,
        engine: selectedEngine,
        stylePrefix: style.promptPrefix,
        apiKey,
        customEndpointUrl,
        useCustomEndpoint
      });

      setBatchItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'done', result: res } : i))
      );
    } catch (e) {
      setBatchItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'error', errorMsg: e.message } : i))
      );
    }
  };

  const handleSynthesizeAll = async () => {
    setIsProcessingAll(true);
    for (const item of batchItems) {
      if (item.text.trim()) {
        await synthesizeSingleItem(item);
      }
    }
    setIsProcessingAll(false);
  };

  const togglePlayItem = (item) => {
    if (!item.result || !item.result.wavBlob) return;
    if (playingItemId === item.id) {
      if (audioRef.current) audioRef.current.pause();
      setPlayingItemId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = URL.createObjectURL(item.result.wavBlob);
        audioRef.current.play();
        setPlayingItemId(item.id);
      }
    }
  };

  return (
    <div className="space-y-6">
      <audio ref={audioRef} onEnded={() => setPlayingItemId(null)} />

      {/* Header */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 p-0.5 shadow-lg shadow-emerald-500/25 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Radio className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white">Batch Voice Production Center</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Generate multiple voice tracks in bulk with individual persona steering and lossless exports.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={addItem}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Add Batch Line</span>
          </button>

          <button
            onClick={handleSynthesizeAll}
            disabled={isProcessingAll}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isProcessingAll ? 'Synthesizing All...' : 'Synthesize All'}</span>
          </button>
        </div>
      </div>

      {/* Batch Items List */}
      <div className="space-y-3">
        {batchItems.map((item, idx) => (
          <div
            key={item.id}
            className="glass-card rounded-2xl p-4 border border-slate-800 space-y-3 shadow-lg"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => updateItem(item.id, 'label', e.target.value)}
                  placeholder="Track Label"
                  className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 w-36"
                />

                {item.status === 'done' && (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/60">
                    <CheckCircle2 className="w-3 h-3" /> Ready
                  </span>
                )}
                {item.status === 'synthesizing' && (
                  <span className="text-[10px] text-amber-400 animate-pulse bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-800/60">
                    Synthesizing...
                  </span>
                )}
                {item.status === 'error' && (
                  <span className="flex items-center gap-1 text-[10px] text-red-400 bg-red-950/60 px-2 py-0.5 rounded-md border border-red-800/60">
                    <AlertCircle className="w-3 h-3" /> Failed
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={item.voice_id}
                  onChange={(e) => updateItem(item.id, 'voice_id', e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs font-semibold text-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {VOICES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.gender})
                    </option>
                  ))}
                </select>

                <select
                  value={item.style_id}
                  onChange={(e) => updateItem(item.id, 'style_id', e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs font-semibold text-purple-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  {STYLES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>

                {item.result && (
                  <>
                    <button
                      onClick={() => togglePlayItem(item)}
                      className="p-2 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600 hover:text-white transition-colors"
                      title={playingItemId === item.id ? 'Pause' : 'Play'}
                    >
                      {playingItemId === item.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => triggerFileDownload(item.result.wavBlob, `VisionMax_${item.label}_${item.voice_id}.wav`)}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Download WAV"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}

                <button
                  onClick={() => synthesizeSingleItem(item)}
                  disabled={item.status === 'synthesizing'}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-indigo-300 hover:text-indigo-200 transition-colors"
                >
                  Synthesize
                </button>

                <button
                  onClick={() => removeItem(item.id)}
                  className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <textarea
              rows={2}
              value={item.text}
              onChange={(e) => updateItem(item.id, 'text', e.target.value)}
              placeholder="Script content for this batch track..."
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-slate-100 text-xs sm:text-sm leading-relaxed placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/60 transition-all resize-y"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

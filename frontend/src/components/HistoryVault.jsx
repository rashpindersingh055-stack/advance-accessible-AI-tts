import React from 'react';
import { History, Play, Pause, Download, Trash2, Sparkles, Clock } from 'lucide-react';
import { triggerFileDownload, formatTime } from '../utils/audio';

export default function HistoryVault({
  historyItems,
  onPlayItem,
  playingItemIndex,
  onClearHistory,
  onDeleteItem
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-600 to-indigo-600 p-0.5 shadow-lg shadow-amber-500/25 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <History className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white">Audio History Vault</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review and re-download generated master takes and vocal experiments from your session.
            </p>
          </div>
        </div>

        {historyItems.length > 0 && (
          <button
            onClick={onClearHistory}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {historyItems.length === 0 ? (
        <div className="glass-panel rounded-3xl p-10 text-center text-slate-400 border border-slate-800 space-y-2">
          <Clock className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="font-bold text-slate-200">No Audio Takes in History</p>
          <p className="text-xs">Generated voice audio clips in this session will automatically appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {historyItems.map((item, idx) => (
            <div
              key={idx}
              className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-lg hover:border-slate-700"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onPlayItem(item, idx)}
                  className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white flex items-center justify-center transition-colors"
                >
                  {playingItemIndex === idx ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-sm">{item.voiceName}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
                      {item.styleTitle}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {item.timestamp || 'Just now'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1 mt-0.5 max-w-xl">{item.script}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => triggerFileDownload(item.wavBlob, `VisionMax_${item.voiceName}_${Date.now()}.wav`)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Download WAV</span>
                </button>

                <button
                  onClick={() => onDeleteItem(idx)}
                  className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                  title="Remove from history"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

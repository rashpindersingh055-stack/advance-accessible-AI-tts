import React from 'react';
import { Sparkles, X, Cpu, Mic } from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function AboutModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative animate-scale-in">
        {/* Header with Brand Logo */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <BrandLogo size="md" />
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="mt-4 space-y-3.5 text-xs text-slate-300 leading-relaxed">
          <p>
            <strong className="text-white">Vision Max Intelligence</strong> develops next-generation acoustic architectures that combine neural timbre mapping with emotional nuance.
          </p>

          <div className="space-y-2.5 pt-2">
            <div className="flex items-start gap-2.5 bg-slate-950/50 p-2.5 rounded-2xl border border-slate-800">
              <Cpu className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Dynamic Engine Switcher:</strong> Effortlessly toggle between Standard, Latest Gen, and Legacy Pro synthesis engines with instant endpoint reconfiguration.
              </span>
            </div>

            <div className="flex items-start gap-2.5 bg-slate-950/50 p-2.5 rounded-2xl border border-slate-800">
              <Mic className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">30 Neural Personas:</strong> Complete catalogue of studio voices across all tonal spectrums with gender and timbre filtering.
              </span>
            </div>

            <div className="flex items-start gap-2.5 bg-slate-950/50 p-2.5 rounded-2xl border border-slate-800">
              <Sparkles className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Lossless Studio Processing:</strong> Instant client-side and backend conversion from raw PCM16 buffers to master WAV and 128kbps MP3 audio formats.
              </span>
            </div>
          </div>

          <div className="p-3 bg-indigo-950/30 rounded-2xl border border-indigo-800/40 text-[11px] text-slate-400">
            Crafted with pride by <strong className="text-slate-200">Vision Max Intelligence</strong>. Engineered for global creators, filmmakers, educators, and enterprise AI applications.
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

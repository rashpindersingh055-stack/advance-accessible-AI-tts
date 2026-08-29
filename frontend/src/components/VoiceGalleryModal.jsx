import React, { useState } from 'react';
import { Search, X, Mic, Check } from 'lucide-react';
import { VOICES } from '../constants/voices';

export default function VoiceGalleryModal({
  isOpen,
  onClose,
  selectedVoice,
  onSelectVoice
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('All');

  if (!isOpen) return null;

  const filteredVoices = VOICES.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.tone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.desc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGender = genderFilter === 'All' || v.gender === genderFilter;
    return matchesSearch && matchesGender;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-scale-in">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Mic className="w-5 h-5 text-indigo-400" />
              <span>Voice Persona Gallery</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold">
                30 Neural Personas
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select a neural voice profile matched to your brand resonance and narrative cadence.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex flex-wrap gap-3 items-center justify-between">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by voice name or acoustic tone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            {['All', 'Female', 'Male'].map((gender) => (
              <button
                key={gender}
                onClick={() => setGenderFilter(gender)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  genderFilter === gender ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {gender}
              </button>
            ))}
          </div>
        </div>

        {/* Voice Cards Grid */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredVoices.map((voice) => {
            const isSelected = selectedVoice.id === voice.id;
            return (
              <div
                key={voice.id}
                onClick={() => {
                  onSelectVoice(voice);
                  onClose();
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/40'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-white text-sm group-hover:text-indigo-300 transition-colors">
                      {voice.name}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        voice.gender === 'Female'
                          ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}
                    >
                      {voice.gender}
                    </span>
                  </div>
                  <div className="text-xs text-indigo-400 font-semibold mb-1">{voice.tone}</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">{voice.desc}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>24kHz Studio</span>
                  {isSelected ? (
                    <span className="flex items-center gap-1 text-indigo-400 font-bold">
                      <Check className="w-3.5 h-3.5" /> Selected
                    </span>
                  ) : (
                    <span className="text-slate-400 group-hover:text-indigo-300">Click to Select →</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

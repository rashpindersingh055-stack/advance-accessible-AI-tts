import React, { useState, useEffect } from 'react';
import { Settings, X, Key, Cpu, Link2, Check, Eye, EyeOff, Activity, Wifi, Database } from 'lucide-react';
import { TTS_ENGINES } from '../constants/voices';
import { runApiDiagnostic, checkBackendHealth, saveApiConfigToBackend } from '../services/api';

export default function SettingsModal({
  isOpen,
  onClose,
  selectedEngine,
  onSelectEngine,
  apiKey,
  onSaveApiKey,
  customEndpointUrl,
  onSaveCustomEndpointUrl,
  useCustomEndpoint,
  onToggleUseCustomEndpoint,
  userProfile
}) {
  const [tempKey, setTempKey] = useState(apiKey);
  const [tempEndpoint, setTempEndpoint] = useState(customEndpointUrl);
  const [showKey, setShowKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [diagResult, setDiagResult] = useState(null);
  const [backendStatus, setBackendStatus] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setTempKey(apiKey);
      setTempEndpoint(customEndpointUrl);
      checkBackendHealth().then(setBackendStatus);
    }
  }, [isOpen, apiKey, customEndpointUrl]);

  if (!isOpen) return null;

  const handleApply = async () => {
    const cleanKey = tempKey.trim();
    const cleanEndpoint = tempEndpoint.trim();

    onSaveApiKey(cleanKey);
    onSaveCustomEndpointUrl(cleanEndpoint);

    // Save to Backend Database and Persistent Store
    await saveApiConfigToBackend({
      apiKey: cleanKey,
      customEndpoint: cleanEndpoint,
      useCustomEndpoint,
      selectedEngine: selectedEngine.id,
      email: userProfile?.email || null
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 500);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setDiagResult(null);
    try {
      const res = await runApiDiagnostic(tempKey.trim());
      setDiagResult(res);
    } catch (e) {
      setDiagResult({ status: 'error', message: e.message, latency_ms: null });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl relative animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base">API & Engine Switcher</h3>
                {backendStatus?.isOnline ? (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <Wifi className="w-2.5 h-2.5" /> Database Sync Active
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Browser Local Storage
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">Settings automatically persist across all your sessions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-5 text-xs text-slate-300">
          {/* Engine Selector */}
          <div>
            <label className="block text-slate-200 mb-2 font-bold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-400" />
                Select Neural TTS Engine
              </span>
              <span className="text-[10px] text-indigo-400 font-normal">Auto-configures endpoints</span>
            </label>

            <div className="space-y-2">
              {TTS_ENGINES.map((engine) => {
                const isSelected = selectedEngine.id === engine.id;
                return (
                  <div
                    key={engine.id}
                    onClick={() => onSelectEngine(engine)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-indigo-950/50 border-indigo-500 ring-1 ring-indigo-500/50'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-100 flex items-center gap-2">
                        {engine.name}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                          isSelected
                            ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-500/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {engine.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{engine.desc}</p>
                    <div className="text-[10px] font-mono text-indigo-400/80 mt-1 truncate">
                      Endpoint Model: {engine.modelParam}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gemini API Key with Ping Diagnostic Button */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-200 font-bold flex items-center gap-1.5">
                <Key className="w-4 h-4 text-purple-400" />
                <span>Google Gemini API Key</span>
              </label>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                <Activity className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Testing Latency...' : 'Test Connection & Ping'}</span>
              </button>
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                placeholder="AIzaSy... (Paste your Google AI Studio API key here)"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-emerald-400/90 font-medium">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>API key will be securely saved to backend database &amp; reloaded next time you visit.</span>
            </div>

            {/* Diagnostic Result Banner */}
            {diagResult && (
              <div
                className={`mt-2.5 p-2.5 rounded-xl border text-[11px] flex items-center justify-between animate-fade-in ${
                  diagResult.status === 'healthy'
                    ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                    : 'bg-red-950/40 border-red-800/60 text-red-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {diagResult.status === 'healthy' ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <span className="text-red-400 font-bold">✕</span>
                  )}
                  <span>{diagResult.message}</span>
                </div>
                {diagResult.latency_ms !== null && (
                  <span className="font-mono font-bold">{diagResult.latency_ms} ms</span>
                )}
              </div>
            )}
          </div>

          {/* Endpoint Customization */}
          <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300 text-[11px] flex items-center gap-1">
                <Link2 className="w-3.5 h-3.5 text-indigo-400" />
                Active Resolved Endpoint
              </span>
              <button
                type="button"
                onClick={onToggleUseCustomEndpoint}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                {useCustomEndpoint ? 'Switch to Auto-Endpoint' : 'Override Endpoint URL'}
              </button>
            </div>

            {useCustomEndpoint ? (
              <input
                type="text"
                value={tempEndpoint}
                onChange={(e) => setTempEndpoint(e.target.value)}
                placeholder="https://generativelanguage.googleapis.com/v1beta/models/..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-[11px] font-mono text-indigo-300 focus:outline-none"
              />
            ) : (
              <div className="font-mono text-[10px] text-indigo-400 break-all bg-slate-900/90 p-2.5 rounded-xl border border-slate-800/80">
                {`https://generativelanguage.googleapis.com/${selectedEngine.apiVersion}/models/${selectedEngine.modelParam}:generateContent?key=${tempKey ? '●●●●●●●●' : '(runtime_key)'}`}
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={handleApply}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved &amp; Synced to Database!</span>
              </>
            ) : (
              <span>Save &amp; Persist Settings</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

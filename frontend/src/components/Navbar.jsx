import React, { useState, useRef, useEffect } from 'react';
import { Mic, Sparkles, Settings, Info, Radio, Layers, Sliders, History, Code2, User, LogOut, Edit3, ShieldCheck, ChevronDown, Bot } from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function Navbar({
  activeTab,
  setActiveTab,
  selectedEngine,
  onOpenSettings,
  onOpenAbout,
  onOpenProfile,
  onLogout,
  hasApiKey,
  userProfile
}) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  const navTabs = [
    { id: 'agent', label: 'AI Speech Director', icon: Bot, badge: 'AI Agent', highlight: true },
    { id: 'single', label: 'Neural Studio', icon: Mic, badge: 'Standard' },
    { id: 'dialogue', label: 'Multi-Speaker Podcast', icon: Layers, badge: 'Pro' },
    { id: 'effects', label: 'Audio FX & DSP', icon: Sliders },
    { id: 'batch', label: 'Batch Synthesizer', icon: Radio },
    { id: 'history', label: 'History Vault', icon: History },
    { id: 'apidocs', label: 'API Playground', icon: Code2 }
  ];

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-2xl sticky top-0 z-40 px-3 sm:px-6 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Logo Component */}
        <BrandLogo size="md" />

        {/* Desktop Navigation Tabs */}
        <nav className="hidden xl:flex items-center gap-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800/90">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all relative ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                    : tab.highlight
                    ? 'text-indigo-300 hover:text-white hover:bg-indigo-950/40 border border-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : tab.highlight ? 'text-indigo-400 animate-pulse' : 'text-indigo-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-md ${
                    isActive ? 'bg-white/20 text-white' : tab.highlight ? 'bg-indigo-950 text-indigo-300 border border-indigo-700/50' : 'bg-slate-800 text-indigo-300'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Actions, User Profile Menu & Settings Pill */}
        <div className="flex items-center gap-2 shrink-0">
          {/* User Account Profile Pill & Dropdown Menu */}
          {userProfile ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 transition-all cursor-pointer group"
                title="Account Menu"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-[11px] font-bold text-white uppercase shadow-sm">
                  {userProfile.full_name?.charAt(0) || 'U'}
                </div>
                <span className="font-semibold text-slate-200 max-w-[100px] truncate hidden sm:inline">
                  {userProfile.full_name?.split(' ')[0]}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-scale-in backdrop-blur-xl divide-y divide-slate-800/80">
                  {/* User Info Header */}
                  <div className="p-3">
                    <p className="font-bold text-sm text-white truncate">{userProfile.full_name}</p>
                    <p className="text-xs text-indigo-400 truncate font-mono mt-0.5">{userProfile.email}</p>
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-800/50 w-fit">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{userProfile.auth_method === 'Google Sign-In' ? 'Google Account' : 'Registered Studio User'}</span>
                    </div>
                  </div>

                  {/* Menu Options */}
                  <div className="py-1 space-y-0.5">
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onOpenProfile();
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Edit Account Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onOpenSettings();
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5 text-purple-400" />
                      <span>API &amp; Engine Settings</span>
                    </button>
                  </div>

                  {/* Logout Button */}
                  <div className="pt-1">
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/40 flex items-center gap-2.5 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-400" />
                      <span>Log Out of Account</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-xs font-bold text-indigo-300 transition-all hover:scale-105"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In / Register</span>
            </button>
          )}

          {/* Active Engine Badge */}
          <button
            onClick={onOpenSettings}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-xs transition-all cursor-pointer group"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse group-hover:scale-125 transition-transform"></span>
            <span className="font-medium text-slate-300">{selectedEngine.badge}</span>
            <span className="font-mono text-[10px] text-indigo-300 hidden lg:inline">({selectedEngine.modelParam})</span>
          </button>

          {/* API Key Status */}
          <button
            onClick={onOpenSettings}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              hasApiKey
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                : 'bg-amber-950/40 text-amber-300 border-amber-800/60 animate-pulse'
            }`}
            title={hasApiKey ? 'Custom API Key active' : 'Click to configure API Key'}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{hasApiKey ? 'API Ready' : 'Set API Key'}</span>
          </button>

          {/* About Modal Trigger */}
          <button
            onClick={onOpenAbout}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all"
            title="About Vision Max"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 transition-all hover:scale-105"
            title="Engine & API Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

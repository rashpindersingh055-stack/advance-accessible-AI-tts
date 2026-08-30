import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import AgentStudio from './components/AgentStudio';
import SingleSpeakerStudio from './components/SingleSpeakerStudio';
import MultiSpeakerStudio from './components/MultiSpeakerStudio';
import AudioFXStudio from './components/AudioFXStudio';
import BatchStudio from './components/BatchStudio';
import ApiDocsTab from './components/ApiDocsTab';
import HistoryVault from './components/HistoryVault';
import VoiceGalleryModal from './components/VoiceGalleryModal';
import SettingsModal from './components/SettingsModal';
import AboutModal from './components/AboutModal';
import RegisterModal from './components/RegisterModal';
import ContactTab from './components/ContactTab';
import AdminCenterTab from './components/AdminCenterTab';
import NotificationsModal from './components/NotificationsModal';

import { TTS_ENGINES, VOICES, STYLES, LANGUAGES, SAMPLE_SCRIPTS } from './constants/voices';
import { generateSpeechUnified, loadApiConfigFromBackend, saveApiConfigToBackend } from './services/api';
import { triggerFileDownload, encodePcmToMp3 } from './utils/audio';
import { soundFx } from './utils/soundfx';
import { Mic, Layers, Sliders, Radio, History, Code2, Bot, PhoneCall, Crown } from 'lucide-react';

export default function App() {
  // User Profile State & Onboarding
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('vm_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Website Creator Superadmin Check (dev019@gmail.com / admin star)
  const isAdmin = 
    userProfile?.email?.toLowerCase() === 'dev019@gmail.com' || 
    userProfile?.full_name?.toLowerCase() === 'admin star' ||
    userProfile?.email?.toLowerCase() === 'rashpindertechwith@gmail.com';

  // Navigation (Default to Admin if Creator, otherwise AI Speech Director)
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('vm_user_profile');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u.email?.toLowerCase() === 'dev019@gmail.com' || u.full_name?.toLowerCase() === 'admin star') {
          return 'admin';
        }
      } catch {}
    }
    return 'agent';
  });

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(1);

  // Engine & API Settings State
  const [selectedEngine, setSelectedEngine] = useState(TTS_ENGINES[0]);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('vm_gemini_api_key') || '');
  const [customEndpointUrl, setCustomEndpointUrl] = useState(() => localStorage.getItem('vm_custom_endpoint') || '');
  const [useCustomEndpoint, setUseCustomEndpoint] = useState(() => localStorage.getItem('vm_use_custom_endpoint') === 'true');

  // Auto-restore API Key and Engine Configuration from Backend Database on Visit
  useEffect(() => {
    loadApiConfigFromBackend(userProfile?.email).then((remoteConfig) => {
      if (remoteConfig && remoteConfig.api_key) {
        setApiKey(remoteConfig.api_key);
        localStorage.setItem('vm_gemini_api_key', remoteConfig.api_key);
        
        if (remoteConfig.custom_endpoint) {
          setCustomEndpointUrl(remoteConfig.custom_endpoint);
          localStorage.setItem('vm_custom_endpoint', remoteConfig.custom_endpoint);
        }
        if (remoteConfig.use_custom_endpoint !== undefined) {
          setUseCustomEndpoint(remoteConfig.use_custom_endpoint);
          localStorage.setItem('vm_use_custom_endpoint', String(remoteConfig.use_custom_endpoint));
        }
        if (remoteConfig.selected_engine) {
          const matched = TTS_ENGINES.find((e) => e.id === remoteConfig.selected_engine);
          if (matched) setSelectedEngine(matched);
        }
      }
    });
  }, [userProfile]);

  // Auto-prompt registration modal on first time visit
  useEffect(() => {
    if (!userProfile) {
      const timer = setTimeout(() => {
        setShowRegisterModal(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [userProfile]);

  // Fetch initial notifications unread count
  useEffect(() => {
    fetch(`/api/admin/user-notifications?user_email=${encodeURIComponent(userProfile?.email || '')}`)
      .then((res) => res.json())
      .then((data) => {
        const readIds = JSON.parse(localStorage.getItem('vm_read_notifs') || '[]');
        const unread = (data.notifications || []).filter((n) => !readIds.includes(n.id)).length;
        setUnreadNotifsCount(unread);
      })
      .catch(() => {});
  }, [userProfile]);

  // Modals Visibility
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  // Single Speaker Studio State
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0]);
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);
  const [scriptText, setScriptText] = useState(SAMPLE_SCRIPTS[0].text);

  // Audio Playback & Synthesis States
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState(null);

  const [audioBlob, setAudioBlob] = useState(null);
  const [pcmRawData, setPcmRawData] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [isEncodingMp3, setIsEncodingMp3] = useState(false);

  // History Vault
  const [historyItems, setHistoryItems] = useState([]);
  const [playingHistoryIndex, setPlayingHistoryIndex] = useState(null);

  const audioRef = useRef(null);

  // Synchronize Audio URL with Blob
  useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setAudioUrl(null);
    }
  }, [audioBlob]);

  // Sync HTML5 Audio element properties
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [playbackSpeed, volume, isMuted]);

  // Audio Event Listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => setAudioDuration(audio.duration || 0);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
    };
  }, [audioUrl]);

  // Settings Handlers
  const handleSaveApiKey = async (key) => {
    setApiKey(key);
    localStorage.setItem('vm_gemini_api_key', key);
    await saveApiConfigToBackend({
      email: userProfile?.email,
      apiKey: key,
      customEndpoint: customEndpointUrl,
      useCustomEndpoint: useCustomEndpoint,
      selectedEngine: selectedEngine.id
    });
  };

  const handleSaveCustomEndpoint = async (url) => {
    setCustomEndpointUrl(url);
    localStorage.setItem('vm_custom_endpoint', url);
    await saveApiConfigToBackend({
      email: userProfile?.email,
      apiKey: apiKey,
      customEndpoint: url,
      useCustomEndpoint: useCustomEndpoint,
      selectedEngine: selectedEngine.id
    });
  };

  const handleToggleUseCustomEndpoint = async (enabled) => {
    setUseCustomEndpoint(enabled);
    localStorage.setItem('vm_use_custom_endpoint', String(enabled));
    await saveApiConfigToBackend({
      email: userProfile?.email,
      apiKey: apiKey,
      customEndpoint: customEndpointUrl,
      useCustomEndpoint: enabled,
      selectedEngine: selectedEngine.id
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('vm_user_profile');
    setUserProfile(null);
    setShowRegisterModal(true);
  };

  // Play / Pause Toggle
  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;
    soundFx.playTransport(!isPlaying);
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch((err) => {
        console.warn('Playback blocked by browser:', err);
      });
    }
  };

  const handleSeek = (newTime) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleSkipSeconds = (seconds) => {
    if (audioRef.current) {
      const target = Math.max(0, Math.min(audioDuration, audioRef.current.currentTime + seconds));
      audioRef.current.currentTime = target;
      setCurrentTime(target);
    }
  };

  // WAV Download Trigger
  const handleDownloadWav = () => {
    if (!audioBlob) return;
    soundFx.playDownloadBeep();
    triggerFileDownload(
      audioBlob,
      `VisionMax_${selectedVoice.name}_${selectedStyle.id}_${Date.now()}.wav`
    );
  };

  // Client-side MP3 Download Trigger
  const handleDownloadMp3 = async () => {
    if (!pcmRawData) {
      if (audioBlob) handleDownloadWav();
      return;
    }
    soundFx.playDownloadBeep();
    setIsEncodingMp3(true);
    try {
      const mp3Blob = await encodePcmToMp3(pcmRawData.data, pcmRawData.sampleRate);
      triggerFileDownload(
        mp3Blob,
        `VisionMax_${selectedVoice.name}_${selectedStyle.id}_${Date.now()}.mp3`
      );
    } catch (e) {
      console.error('MP3 client encode failed, falling back to WAV:', e);
      handleDownloadWav();
    } finally {
      setIsEncodingMp3(false);
    }
  };

  // Single Speaker TTS Generation Execution
  const handleGenerateTTS = async () => {
    if (!scriptText.trim()) {
      soundFx.playErrorThud();
      setErrorMsg('Please enter or select a script before synthesizing.');
      return;
    }

    soundFx.playGenerateStart();
    setErrorMsg(null);
    setIsGenerating(true);
    setGenerationProgress(10);

    const progressInterval = setInterval(() => {
      setGenerationProgress((prev) => (prev < 85 ? prev + 15 : prev));
    }, 200);

    try {
      const result = await generateSpeechUnified({
        script: scriptText,
        voice: selectedVoice,
        engine: selectedEngine,
        style: selectedStyle,
        language: selectedLanguage,
        apiKey: apiKey || undefined,
        customEndpoint: useCustomEndpoint ? customEndpointUrl : undefined
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      setAudioBlob(result.wavBlob);
      setPcmRawData(result.pcmRawData);
      setAudioDuration(result.duration);

      // Play Celestial Success Fanfare!
      soundFx.playSuccessFanfare();

      // Auto-add to History Vault
      const newHistoryItem = {
        id: 'hist_' + Date.now(),
        script: scriptText,
        voiceName: selectedVoice.name,
        voiceId: selectedVoice.id,
        voiceGender: selectedVoice.gender,
        styleTitle: selectedStyle.title,
        engineBadge: selectedEngine.badge,
        durationSeconds: result.duration,
        characterCount: scriptText.length,
        timestamp: new Date().toISOString(),
        wavBlob: result.wavBlob,
        pcmData: result.pcmRawData
      };
      setHistoryItems((prev) => [newHistoryItem, ...prev].slice(0, 50));

      // Auto-play synthesized audio
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      }, 300);
    } catch (err) {
      clearInterval(progressInterval);
      soundFx.playErrorThud();
      setErrorMsg(err.message || 'Speech generation failed. Please verify your connection.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayHistoryItem = (item, idx) => {
    if (item.wavBlob) {
      setAudioBlob(item.wavBlob);
      setPcmRawData(item.pcmData);
      setPlayingHistoryIndex(idx);
      togglePlay();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white pb-12 xl:pb-0">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Hidden Audio Element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="auto"
          className="hidden"
        />
      )}

      {/* Primary Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedEngine={selectedEngine}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenAbout={() => setShowAboutModal(true)}
        onOpenProfile={() => setShowRegisterModal(true)}
        onOpenNotifications={() => setShowNotificationsModal(true)}
        onLogout={handleLogout}
        hasApiKey={Boolean(apiKey)}
        userProfile={userProfile}
        unreadNotifsCount={unreadNotifsCount}
      />

      {/* Main Studio Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 space-y-6 relative z-10">
        {/* Hidden Creator Admin Center Tab */}
        {activeTab === 'admin' && isAdmin && (
          <AdminCenterTab userProfile={userProfile} />
        )}

        {activeTab === 'agent' && (
          <AgentStudio
            selectedEngine={selectedEngine}
            apiKey={apiKey}
            customEndpointUrl={customEndpointUrl}
            useCustomEndpoint={useCustomEndpoint}
          />
        )}

        {activeTab === 'single' && (
          <SingleSpeakerStudio
            selectedVoice={selectedVoice}
            selectedStyle={selectedStyle}
            selectedLanguage={selectedLanguage}
            selectedEngine={selectedEngine}
            scriptText={scriptText}
            isGenerating={isGenerating}
            generationProgress={generationProgress}
            errorMsg={errorMsg}
            audioBlob={audioBlob}
            pcmRawData={pcmRawData}
            isPlaying={isPlaying}
            currentTime={currentTime}
            audioDuration={audioDuration}
            playbackSpeed={playbackSpeed}
            volume={volume}
            isMuted={isMuted}
            isEncodingMp3={isEncodingMp3}
            onOpenVoiceModal={() => setShowVoiceModal(true)}
            onSelectStyle={setSelectedStyle}
            onSelectLanguage={setSelectedLanguage}
            onScriptChange={setScriptText}
            onGenerate={handleGenerateTTS}
            onClearScript={() => setScriptText('')}
            onTogglePlay={togglePlay}
            onSeek={handleSeek}
            onSkipSeconds={handleSkipSeconds}
            onSpeedChange={setPlaybackSpeed}
            onVolumeChange={setVolume}
            onToggleMute={() => setIsMuted(!isMuted)}
            onDownloadWav={handleDownloadWav}
            onDownloadMp3={handleDownloadMp3}
            onDismissError={() => setErrorMsg(null)}
          />
        )}

        {activeTab === 'dialogue' && (
          <MultiSpeakerStudio
            selectedEngine={selectedEngine}
            apiKey={apiKey}
            customEndpointUrl={customEndpointUrl}
            useCustomEndpoint={useCustomEndpoint}
          />
        )}

        {activeTab === 'effects' && (
          <AudioFXStudio
            audioBlob={audioBlob}
            pcmRawData={pcmRawData}
            isPlaying={isPlaying}
            onTogglePlay={togglePlay}
          />
        )}

        {activeTab === 'batch' && (
          <BatchStudio
            selectedEngine={selectedEngine}
            apiKey={apiKey}
            customEndpointUrl={customEndpointUrl}
            useCustomEndpoint={useCustomEndpoint}
          />
        )}

        {activeTab === 'history' && (
          <HistoryVault
            historyItems={historyItems}
            onPlayItem={handlePlayHistoryItem}
            playingItemIndex={playingHistoryIndex}
            onClearHistory={() => setHistoryItems([])}
            onDeleteItem={(idx) => setHistoryItems(historyItems.filter((_, i) => i !== idx))}
          />
        )}

        {activeTab === 'apidocs' && (
          <ApiDocsTab selectedEngine={selectedEngine} apiKey={apiKey} />
        )}

        {activeTab === 'contact' && (
          <ContactTab />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/90 px-2 py-2 flex items-center justify-around">
        {[
          ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: Crown }] : []),
          { id: 'agent', label: 'AI Agent', icon: Bot },
          { id: 'single', label: 'Studio', icon: Mic },
          { id: 'dialogue', label: 'Podcast', icon: Layers },
          { id: 'effects', label: 'DSP Lab', icon: Sliders },
          { id: 'batch', label: 'Batch', icon: Radio },
          { id: 'history', label: 'Vault', icon: History },
          { id: 'contact', label: 'Contact', icon: PhoneCall }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundFx.playTabSwitch();
                setActiveTab(tab.id);
              }}
              className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all ${
                isActive ? 'text-indigo-400 font-bold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${tab.id === 'admin' ? 'text-amber-400 animate-pulse' : ''}`} />
              <span className="text-[10px]">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Modals */}
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onUserRegistered={(profile) => setUserProfile(profile)}
        isEditMode={Boolean(userProfile)}
        currentUser={userProfile}
      />

      <NotificationsModal
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        userProfile={userProfile}
        onUnreadCountChange={(count) => setUnreadNotifsCount(count)}
      />

      <VoiceGalleryModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        selectedVoice={selectedVoice}
        onSelectVoice={(v) => {
          setSelectedVoice(v);
          setShowVoiceModal(false);
        }}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        selectedEngine={selectedEngine}
        onSelectEngine={setSelectedEngine}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
        customEndpointUrl={customEndpointUrl}
        onSaveCustomEndpoint={handleSaveCustomEndpoint}
        useCustomEndpoint={useCustomEndpoint}
        onToggleUseCustomEndpoint={handleToggleUseCustomEndpoint}
        userProfile={userProfile}
      />

      <AboutModal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
      />
    </div>
  );
}

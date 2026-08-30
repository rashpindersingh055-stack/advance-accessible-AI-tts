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

import { TTS_ENGINES, VOICES, STYLES, LANGUAGES, SAMPLE_SCRIPTS } from './constants/voices';
import { generateSpeechUnified, loadApiConfigFromBackend, saveApiConfigToBackend } from './services/api';
import { triggerFileDownload, encodePcmToMp3 } from './utils/audio';
import { soundFx } from './utils/soundfx';
import { Mic, Layers, Sliders, Radio, History, Code2, Bot, PhoneCall } from 'lucide-react';

export default function App() {
  // Navigation (Default to the powerful AI Speech Director Agent)
  const [activeTab, setActiveTab] = useState('agent');

  // User Profile State & Onboarding
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('vm_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [showRegisterModal, setShowRegisterModal] = useState(false);

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

  // Modals Visibility
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  // Single Speaker Studio State
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0]); // Kore
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0]); // Natural
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]); // en-US
  const [scriptText, setScriptText] = useState(SAMPLE_SCRIPTS[0].text);

  // Synthesis & Audio Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState(null);

  // Audio Playback & Master Data
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

  // History Vault State
  const [historyItems, setHistoryItems] = useState(() => {
    try {
      const saved = localStorage.getItem('vm_history_vault');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [playingHistoryIndex, setPlayingHistoryIndex] = useState(null);

  const audioRef = useRef(null);

  // Persist History Vault
  useEffect(() => {
    try {
      localStorage.setItem('vm_history_vault', JSON.stringify(historyItems));
    } catch (e) {
      console.warn('History storage limit reached:', e);
    }
  }, [historyItems]);

  // Audio Object URL management
  useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      setCurrentTime(0);
      setIsPlaying(false);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [audioBlob]);

  // Audio playback event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => setAudioDuration(audio.duration || 0);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onEnded = () => {
      setIsPlaying(false);
      setPlayingHistoryIndex(null);
    };

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
    };
  }, [audioUrl]);

  // Volume & Mute Sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Playback Rate Sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

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

  const handleSaveCustomEndpointUrl = async (url) => {
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
      setErrorMsg(err.message || 'Speech synthesis failed. Check your API key or connection.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Play Item from History Vault
  const handlePlayHistoryItem = (item, index) => {
    if (playingHistoryIndex === index && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      setPlayingHistoryIndex(null);
      return;
    }

    if (item.audioBlob) {
      setAudioBlob(item.audioBlob);
      setPcmRawData(item.pcmData);
      setPlayingHistoryIndex(index);
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      }, 200);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Hidden Master Audio Element */}
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}

      {/* Top Application Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedEngine={selectedEngine}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenAbout={() => setShowAboutModal(true)}
        onOpenProfile={() => setShowRegisterModal(true)}
        onLogout={handleLogout}
        hasApiKey={Boolean(apiKey)}
        userProfile={userProfile}
      />

      {/* Main Studio Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 space-y-6">
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
          { id: 'agent', label: 'AI Agent', icon: Bot },
          { id: 'single', label: 'Studio', icon: Mic },
          { id: 'dialogue', label: 'Podcast', icon: Layers },
          { id: 'effects', label: 'DSP Lab', icon: Sliders },
          { id: 'batch', label: 'Batch', icon: Radio },
          { id: 'history', label: 'Vault', icon: History },
          { id: 'apidocs', label: 'API', icon: Code2 },
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
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
                isActive ? 'text-indigo-400 font-bold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
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

      <VoiceGalleryModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        selectedVoice={selectedVoice}
        onSelectVoice={setSelectedVoice}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        selectedEngine={selectedEngine}
        onSelectEngine={setSelectedEngine}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
        customEndpointUrl={customEndpointUrl}
        onSaveCustomEndpointUrl={handleSaveCustomEndpointUrl}
        useCustomEndpoint={useCustomEndpoint}
        onToggleUseCustomEndpoint={handleToggleUseCustomEndpoint}
        userProfile={userProfile}
      />

      <AboutModal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-4 lg:px-8 py-5 text-center text-xs text-slate-500 hidden xl:flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-slate-400 tracking-tight">VISION MAX INTELLIGENCE</span>
          <span>© 2026</span>
          <span>•</span>
          <span className="text-indigo-400/80">Neural Acoustic Audio Studio</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>Agent: <b className="text-purple-400">Autonomous Director Active</b></span>
          <span>•</span>
          <span>Database: <b className="text-emerald-400">SQLite Pro Active</b></span>
          <span>•</span>
          <span>Engine: <b className="text-slate-300 font-mono">{selectedEngine.modelParam}</b></span>
          <span>•</span>
          <span>30 Voices</span>
          <span>•</span>
          <span>Lossless WAV & MP3</span>
        </div>
      </footer>
    </div>
  );
}

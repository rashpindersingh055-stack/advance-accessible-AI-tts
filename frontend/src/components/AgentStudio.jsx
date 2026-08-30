import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, Sparkles, Play, Pause, Download, Wand2, Volume2, Users, RefreshCw, 
  Layers, CheckCircle2, AlertCircle, Film, Edit3, Trash2, Plus, ArrowRight, ShieldCheck, HeartHandshake
} from 'lucide-react';
import AudioVisualizer from './AudioVisualizer';
import { VOICES, STYLES } from '../constants/voices';
import { triggerFileDownload, encodePcmToMp3, base64ToArrayBuffer, pcmToWavBlob } from '../utils/audio';

export default function AgentStudio({
  selectedEngine,
  apiKey,
  customEndpointUrl,
  useCustomEndpoint
}) {
  // Agent Input States
  const [promptText, setPromptText] = useState('Create a terrifying audio horror story with 4 people exploring an abandoned sanitarium at midnight, encountering whispered shadows and paranormal anomalies.');
  const [genre, setGenre] = useState('Horror & Suspense');
  const [numSpeakers, setNumSpeakers] = useState(4);
  const [targetLength, setTargetLength] = useState('Medium');

  // Agent Progress Stages
  const [isAgentWorking, setIsAgentWorking] = useState(false);
  const [agentStep, setAgentStep] = useState(0); // 0: Idle, 1: Drafting, 2: Humanizing, 3: Synthesizing Audio
  const [agentStepText, setAgentStepText] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);

  // Generated Production Data
  const [productionData, setProductionData] = useState(null);
  const [isProducingAudio, setIsProducingAudio] = useState(false);
  const [productionProgress, setProductionProgress] = useState(0);

  // Audio Deck State
  const [audioBlob, setAudioBlob] = useState(null);
  const [pcmRawData, setPcmRawData] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isEncodingMp3, setIsEncodingMp3] = useState(false);

  const audioRef = useRef(null);

  // Quick Inspiration Prompts
  const inspirationPrompts = [
    {
      label: '👻 4-Person Horror Story',
      genre: 'Horror & Suspense',
      speakers: 4,
      text: 'Create a terrifying audio horror story with 4 people exploring an abandoned sanitarium at midnight, encountering whispered shadows and paranormal anomalies.'
    },
    {
      label: '🚀 Deep Space Distress Call',
      genre: 'Sci-Fi Thriller',
      speakers: 4,
      text: 'An emergency on an interstellar cargo vessel: the Commander, Chief Engineer, Doctor, and AI voice detect an alien entity in the warp reactor.'
    },
    {
      label: '🕵️ Cyberpunk Heist Trio',
      genre: 'Crime & Cyberpunk',
      speakers: 3,
      text: 'A high-stakes corporate data heist in Neo-Tokyo: a master Netrunner, a combat specialist, and the inside operative communicating over encrypted radio.'
    },
    {
      label: '🎙️ Late Night Tech Comedy Trio',
      genre: 'Comedy & Banter',
      speakers: 3,
      text: 'Three witty tech startup co-founders hilariously arguing about whether their new AI toaster has achieved sentience and started judging their diet.'
    }
  ];

  // Sync Audio Blob URL
  useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      setCurrentTime(0);
      setIsPlaying(false);
      return () => URL.revokeObjectURL(url);
    }
  }, [audioBlob]);

  // Audio Time Update Listeners
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

  // Step 1 & 2: Autonomous Script Writing & Humanizing Pass
  const handleRunAgentScriptwriter = async () => {
    if (!promptText.trim()) return;

    setErrorMsg(null);
    setIsAgentWorking(true);
    setProductionData(null);
    setAudioBlob(null);
    setPcmRawData(null);

    try {
      // Step 1: Brainstorming & Drafting Plot
      setAgentStep(1);
      setAgentStepText(`Drafting dramatic narrative with ${numSpeakers} characters via Gemini AI...`);

      const res = await fetch('/api/agent/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText.trim(),
          genre,
          num_speakers: parseInt(numSpeakers, 10),
          length: targetLength,
          api_key: apiKey || null
        })
      });

      if (!res.ok) {
        // Fallback: Direct Browser Script Generator if backend offline
        const data = await generateDirectBrowserScript();
        setProductionData(data);
      } else {
        const data = await res.json();
        setProductionData(data);
      }

      setAgentStep(2);
      setAgentStepText('Dialogue humanized, emotional inflections applied & voices cast!');
    } catch (err) {
      setErrorMsg(err.message || 'AI Director script generation failed. Please check your API key.');
    } finally {
      setIsAgentWorking(false);
    }
  };

  // Direct Browser Fallback for Script Creation with Gemini
  const generateDirectBrowserScript = async () => {
    if (!apiKey) {
      throw new Error('Google Gemini API Key is required. Please set your API key in Settings.');
    }

    const systemPrompt = `You are an AI Audio Drama Director. Write a humanized multi-speaker dialogue script in JSON for:
    PROMPT: ${promptText}
    GENRE: ${genre}
    SPEAKERS: ${numSpeakers}
    LENGTH: ${targetLength}

    Return JSON:
    {
      "title": "Title",
      "synopsis": "Synopsis",
      "genre": "${genre}",
      "characters": [
        {"name": "Char 1", "role": "Role", "voice_id": "Charon", "gender": "Male"},
        {"name": "Char 2", "role": "Role", "voice_id": "Kore", "gender": "Female"}
      ],
      "dialogue": [
        {"speaker_name": "Char 1", "voice_id": "Charon", "style_id": "mysterious", "text": "Line...", "pause_after_ms": 400}
      ]
    }`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${res.status}`);
    }

    const resJson = await res.json();
    return JSON.parse(resJson.candidates[0].content.parts[0].text);
  };

  // Step 3: Studio Multi-Speaker Audio Synthesis
  const handleProduceFullAudio = async () => {
    if (!productionData || !productionData.dialogue?.length) return;

    setErrorMsg(null);
    setIsProducingAudio(true);
    setProductionProgress(5);
    setAgentStep(3);
    setAgentStepText('Synthesizing neural voices and stitching master audio drama...');

    try {
      // 1. Try Backend Multi-Speaker Sequencer
      const res = await fetch('/api/agent/produce-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dialogue: productionData.dialogue,
          engine_id: selectedEngine.id,
          api_key: apiKey || null,
          custom_endpoint: useCustomEndpoint ? customEndpointUrl : null,
          output_format: 'wav'
        })
      });

      if (res.ok) {
        setProductionProgress(90);
        const data = await res.json();
        const buffer = base64ToArrayBuffer(data.audio_base64);
        const pcm16 = new Int16Array(buffer.slice(44));
        const wavBlob = new Blob([buffer], { type: 'audio/wav' });

        setAudioBlob(wavBlob);
        setPcmRawData({ data: pcm16, sampleRate: data.sample_rate || 24000 });
        setAudioDuration(data.duration_seconds);
        setProductionProgress(100);
        setAgentStepText('✨ Master Audio Drama successfully produced and ready for playback!');
        
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
          }
        }, 400);
        return;
      }
    } catch (e) {
      console.info('Routing through browser multi-line synthesis...');
    }

    // Direct Browser Multi-Speaker Synthesis fallback
    try {
      const segments = [];
      const total = productionData.dialogue.length;

      for (let i = 0; i < total; i++) {
        const line = productionData.dialogue[i];
        setProductionProgress(Math.round(((i + 1) / total) * 85));
        setAgentStepText(`Synthesizing line ${i + 1}/${total}: ${line.speaker_name}...`);

        const styleObj = STYLES.find((s) => s.id === line.style_id) || STYLES[0];
        const promptWithStyle = `${styleObj.promptPrefix || ''}${line.text}`;

        const payload = {
          contents: [{ parts: [{ text: promptWithStyle }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: line.voice_id } }
            }
          },
          model: selectedEngine.modelParam
        };

        const ttsUrl = `https://generativelanguage.googleapis.com/${selectedEngine.apiVersion}/models/${selectedEngine.modelParam}:generateContent?key=${apiKey}`;
        const ttsRes = await fetch(ttsUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!ttsRes.ok) throw new Error(`Line ${i + 1} synthesis failed.`);
        const ttsJson = await ttsRes.json();
        const b64 = ttsJson.candidates[0].content.parts[0].inlineData.data;
        const pcm = new Int16Array(base64ToArrayBuffer(b64));
        segments.push(pcm);
      }

      // Combine all PCM segments
      let totalSamples = 0;
      segments.forEach((s) => (totalSamples += s.length));
      const masterPcm = new Int16Array(totalSamples);
      let offset = 0;
      segments.forEach((s) => {
        masterPcm.set(s, offset);
        offset += s.length;
      });

      const masterWavBlob = pcmToWavBlob(masterPcm, 24000, 1);
      setAudioBlob(masterWavBlob);
      setPcmRawData({ data: masterPcm, sampleRate: 24000 });
      setAudioDuration(masterPcm.length / 24000);
      setProductionProgress(100);
      setAgentStepText('✨ Master Audio Drama successfully produced and ready for playback!');
    } catch (err) {
      setErrorMsg(`Audio production failed: ${err.message}`);
    } finally {
      setIsProducingAudio(false);
    }
  };

  // Playback Deck Handlers
  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (newTime) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleDownloadWav = () => {
    if (!audioBlob) return;
    triggerFileDownload(
      audioBlob,
      `VisionMax_AI_Director_${productionData?.title?.replace(/\s+/g, '_') || 'Story'}_${Date.now()}.wav`
    );
  };

  const handleDownloadMp3 = async () => {
    if (!pcmRawData) return;
    setIsEncodingMp3(true);
    try {
      const mp3Blob = await encodePcmToMp3(pcmRawData.data, pcmRawData.sampleRate);
      triggerFileDownload(
        mp3Blob,
        `VisionMax_AI_Director_${productionData?.title?.replace(/\s+/g, '_') || 'Story'}_${Date.now()}.mp3`
      );
    } catch (e) {
      handleDownloadWav();
    } finally {
      setIsEncodingMp3(false);
    }
  };

  // Dialogue Line Updates
  const handleUpdateLineText = (idx, newText) => {
    if (!productionData) return;
    const updated = [...productionData.dialogue];
    updated[idx].text = newText;
    setProductionData({ ...productionData, dialogue: updated });
  };

  const handleUpdateLineVoice = (idx, newVoiceId) => {
    if (!productionData) return;
    const updated = [...productionData.dialogue];
    updated[idx].voice_id = newVoiceId;
    setProductionData({ ...productionData, dialogue: updated });
  };

  const handleUpdateLineStyle = (idx, newStyleId) => {
    if (!productionData) return;
    const updated = [...productionData.dialogue];
    updated[idx].style_id = newStyleId;
    setProductionData({ ...productionData, dialogue: updated });
  };

  const handleDeleteLine = (idx) => {
    if (!productionData) return;
    const updated = productionData.dialogue.filter((_, i) => i !== idx);
    setProductionData({ ...productionData, dialogue: updated });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Hidden Audio Player */}
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950/80 via-purple-950/60 to-slate-900/90 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Bot className="w-3.5 h-3.5 animate-pulse" />
              <span>Autonomous AI Speech Director</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Prompt-to-Audio Drama Studio
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Describe any scenario in plain words (e.g. <i>"A horror story with 4 people in an abandoned hospital"</i>). The AI Agent drafts the plot, humanizes dialogue cadences, casts optimal neural voices, and produces a master multi-character audio story!
            </p>
          </div>

          <div className="flex items-center gap-2 p-3 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs text-slate-300 shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Powered by <b>Google Gemini 2.5</b> + <b>Neural Studio TTS</b></span>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-white font-bold text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* 1. Prompt Command Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <label className="text-sm font-extrabold text-white flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-indigo-400" />
                <span>Describe Your Story / Dialogue Scenario</span>
              </label>
              <span className="text-[11px] text-slate-400">Natural Language Prompt</span>
            </div>

            <textarea
              rows={4}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="e.g. Create an intense audio horror story with 4 people trapped in a haunted asylum at midnight, hearing whispering voices in the walls..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none leading-relaxed"
            />

            {/* Quick Inspiration Templates */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                💡 1-Click Story Templates:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {inspirationPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPromptText(p.text);
                      setGenre(p.genre);
                      setNumSpeakers(p.speakers);
                    }}
                    className="p-2.5 rounded-xl bg-slate-950/70 hover:bg-indigo-950/40 border border-slate-800/80 hover:border-indigo-500/50 text-left text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center justify-between group"
                  >
                    <span>{p.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Director Settings Controls */}
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Film className="w-4 h-4 text-purple-400" />
              <span>Director Controls</span>
            </h3>

            {/* Genre */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Genre / Mood</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Horror & Suspense">👻 Horror &amp; Suspense</option>
                <option value="Sci-Fi Thriller">🚀 Sci-Fi Thriller</option>
                <option value="Crime & Cyberpunk">🕵️ Crime &amp; Cyberpunk</option>
                <option value="Comedy & Banter">🎙️ Comedy &amp; Banter</option>
                <option value="Dramatic Storytelling">🎭 Dramatic Storytelling</option>
                <option value="Documentary & Educational">📚 Documentary &amp; Educational</option>
                <option value="Romance & Emotion">💖 Romance &amp; Emotion</option>
              </select>
            </div>

            {/* Number of Characters */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Number of Characters</span>
                <span className="font-mono text-indigo-400 font-bold">{numSpeakers} People</span>
              </label>
              <input
                type="range"
                min="1"
                max="6"
                step="1"
                value={numSpeakers}
                onChange={(e) => setNumSpeakers(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>1 Solo</span>
                <span>2 Duet</span>
                <span>3 Trio</span>
                <span>4 Cast</span>
                <span>5-6 Ensemble</span>
              </div>
            </div>

            {/* Story Length */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Target Production Length</label>
              <div className="grid grid-cols-3 gap-1.5">
                {['Short', 'Medium', 'Long'].map((len) => (
                  <button
                    key={len}
                    type="button"
                    onClick={() => setTargetLength(len)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      targetLength === len
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {len}
                  </button>
                ))}
              </div>
            </div>

            {/* Run Agent Scriptwriter Button */}
            <button
              type="button"
              onClick={handleRunAgentScriptwriter}
              disabled={isAgentWorking || isProducingAudio}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-extrabold text-xs sm:text-sm transition-all shadow-xl shadow-indigo-600/35 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {isAgentWorking ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Agent Working...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Write &amp; Humanize Story Script</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Progress Status Bar (If Agent Working) */}
      {(isAgentWorking || isProducingAudio || agentStepText) && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-indigo-500/40 shadow-xl flex items-center gap-3 animate-fade-in">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            {isAgentWorking || isProducingAudio ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200">
              <span>{agentStepText}</span>
              {isProducingAudio && <span>{productionProgress}%</span>}
            </div>
            {isProducingAudio && (
              <div className="w-full bg-slate-950 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full transition-all duration-300"
                  style={{ width: `${productionProgress}%` }}
                ></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Generated Cast & Script Production Deck */}
      {productionData && (
        <div className="space-y-6 animate-scale-in">
          {/* Production Title Header */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800 uppercase">
                  {productionData.genre}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1.5">
                  {productionData.title}
                </h2>
                <p className="text-xs text-slate-400 mt-1 italic">
                  "{productionData.synopsis}"
                </p>
              </div>

              {/* Master Audio Production Action */}
              <button
                type="button"
                onClick={handleProduceFullAudio}
                disabled={isProducingAudio}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm transition-all shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 disabled:opacity-50 shrink-0"
              >
                {isProducingAudio ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Studio Audio...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Produce Master Audio Drama</span>
                  </>
                )}
              </button>
            </div>

            {/* Character Profiles */}
            <div>
              <span className="text-xs font-extrabold text-slate-300 flex items-center gap-1.5 mb-2.5">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>Assigned Neural Cast ({productionData.characters?.length || 0} Voices)</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                {productionData.characters?.map((char, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-2.5"
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white uppercase shrink-0">
                      {char.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{char.name}</p>
                      <p className="text-[10px] text-indigo-400 font-mono">Voice: {char.voice_id}</p>
                      <p className="text-[9px] text-slate-400 truncate">{char.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Audio Master Player Deck (When Produced) */}
          {audioBlob && (
            <div className="bg-gradient-to-br from-indigo-950/90 via-slate-900 to-purple-950/90 border border-indigo-500/40 rounded-3xl p-6 shadow-2xl space-y-4 animate-scale-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
                  <h3 className="text-base font-extrabold text-white">Master Audio Drama Output</h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadWav}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-all"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-400" />
                    <span>24kHz WAV</span>
                  </button>

                  <button
                    onClick={handleDownloadMp3}
                    disabled={isEncodingMp3}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isEncodingMp3 ? 'Encoding MP3...' : '128k MP3'}</span>
                  </button>
                </div>
              </div>

              {/* 60FPS Reactive Audio Waveform Visualizer */}
              <div className="rounded-2xl overflow-hidden bg-slate-950/90 border border-slate-800 p-2 shadow-inner">
                <AudioVisualizer
                  isPlaying={isPlaying}
                  audioBlob={audioBlob}
                  currentTime={currentTime}
                  duration={audioDuration}
                  onSeek={handleSeek}
                />
              </div>

              {/* Transport Bar */}
              <div className="flex items-center justify-between gap-4 pt-2">
                <button
                  onClick={togglePlay}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 transition-transform active:scale-95"
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
                </button>

                <div className="flex-1 font-mono text-xs text-slate-400">
                  <span className="text-white font-bold">
                    {Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}
                  </span>
                  <span> / </span>
                  <span>
                    {Math.floor(audioDuration / 60)}:{(Math.floor(audioDuration % 60)).toString().padStart(2, '0')}
                  </span>
                </div>

                <div className="text-xs text-indigo-300 font-semibold">
                  <span>{productionData.dialogue.length} Dialogue Sequences</span>
                </div>
              </div>
            </div>
          )}

          {/* 4. Interactive Humanized Dialogue Timeline Editor */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-400" />
                <span>Interactive Dialogue Sequencer ({productionData.dialogue?.length || 0} Lines)</span>
              </h3>
              <span className="text-[11px] text-slate-400">Edit any line or change voices before generating</span>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {productionData.dialogue?.map((line, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 space-y-2.5 transition-all"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-950 text-indigo-400 text-xs font-bold flex items-center justify-center border border-indigo-800/40">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-white">{line.speaker_name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Voice Selector */}
                      <select
                        value={line.voice_id}
                        onChange={(e) => handleUpdateLineVoice(idx, e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-[11px] text-indigo-300 focus:outline-none"
                      >
                        {VOICES.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name} ({v.gender})
                          </option>
                        ))}
                      </select>

                      {/* Emotion Style */}
                      <select
                        value={line.style_id}
                        onChange={(e) => handleUpdateLineStyle(idx, e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-[11px] text-purple-300 focus:outline-none"
                      >
                        {STYLES.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.title}
                          </option>
                        ))}
                      </select>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDeleteLine(idx)}
                        className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                        title="Delete line"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Textarea for Line Text */}
                  <textarea
                    rows={2}
                    value={line.text}
                    onChange={(e) => handleUpdateLineText(idx, e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-medium"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

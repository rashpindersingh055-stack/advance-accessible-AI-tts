// Vision Max Intelligence — Complete Constant Definitions

export const TTS_ENGINES = [
  {
    id: 'gemini-3.6-flash-preview-tts',
    name: 'Gemini 3.6 Flash Neural Audio (Ultra Next-Gen)',
    badge: 'v3.6 Flash',
    desc: 'Cutting-edge dynamic audio synthesis with state-of-the-art breath cadence and emotion responsiveness.',
    modelParam: 'gemini-3.6-flash-preview-tts',
    apiVersion: 'v1beta'
  },
  {
    id: 'gemini-3.5-flash-tts',
    name: 'Gemini 3.5 Flash Expressive TTS',
    badge: 'v3.5 Flash',
    desc: 'Ultra-high speed 24kHz studio rendering with granular prosodic control.',
    modelParam: 'gemini-3.5-flash-tts',
    apiVersion: 'v1beta'
  },
  {
    id: 'gemini-3.1-flash-tts',
    name: 'Gemini 3.1 Flash Neural Audio',
    badge: 'v3.1 Flash',
    desc: 'Nuanced speech cadence, breath modulation, and ultra-low latency.',
    modelParam: 'gemini-3.1-flash-tts',
    apiVersion: 'v1beta'
  },
  {
    id: 'gemini-2.5-flash-preview-tts',
    name: 'Gemini 2.5 Flash Native TTS (Standard / Stable)',
    badge: 'Standard Engine',
    desc: 'High-speed, native multimodal 24kHz studio synthesis with full prompt emotion steering.',
    modelParam: 'gemini-2.5-flash-preview-tts',
    apiVersion: 'v1beta'
  },
  {
    id: 'gemini-3-pro-tts',
    name: 'Gemini 3 Pro Cinematic TTS (Studio Master)',
    badge: 'Pro Master',
    desc: 'Highest fidelity dramatic resonance with extended harmonic depth.',
    modelParam: 'gemini-3-pro-tts',
    apiVersion: 'v1beta'
  },
  {
    id: 'gemini-2.5-pro-tts',
    name: 'Gemini 2.5 Pro High-Fidelity TTS (Legacy Pro)',
    badge: 'Legacy Pro',
    desc: 'Deep multi-timbre synthesis tuned for long-form narration and audiobooks.',
    modelParam: 'gemini-2.5-pro-tts',
    apiVersion: 'v1beta'
  }
];

export const VOICES = [
  { id: 'Kore', name: 'Kore', gender: 'Female', tone: 'Warm & Natural', desc: 'Relaxed, authentic conversational delivery' },
  { id: 'Puck', name: 'Puck', gender: 'Male', tone: 'Playful & Dynamic', desc: 'Energetic, crisp, engaging character voice' },
  { id: 'Zephyr', name: 'Zephyr', gender: 'Female', tone: 'Soft & Articulate', desc: 'Graceful, soothing, premium brand narrator' },
  { id: 'Charon', name: 'Charon', gender: 'Male', tone: 'Deep & Resonant', desc: 'Authoritative, rich cinematic baritone' },
  { id: 'Fenrir', name: 'Fenrir', gender: 'Male', tone: 'Grounded & Bold', desc: 'Assertive, strong, podcast-ready voice' },
  { id: 'Leda', name: 'Leda', gender: 'Female', tone: 'Gentle & Melodic', desc: 'Calming, thoughtful, poetic cadence' },
  { id: 'Orus', name: 'Orus', gender: 'Male', tone: 'Crisp & Informative', desc: 'Clear corporate trainer and educator' },
  { id: 'Aoede', name: 'Aoede', gender: 'Female', tone: 'Bright & Radiant', desc: 'Enthusiastic and modern commercial speaker' },
  { id: 'Callirrhoe', name: 'Callirrhoe', gender: 'Female', tone: 'Expressive & Rich', desc: 'Storyteller with dramatic range' },
  { id: 'Autonoe', name: 'Autonoe', gender: 'Female', tone: 'Smooth & Elegant', desc: 'Luxury narration and high-end audiobooks' },
  { id: 'Enceladus', name: 'Enceladus', gender: 'Male', tone: 'Commanding & Deep', desc: 'Documentary and cinematic voice' },
  { id: 'Iapetus', name: 'Iapetus', gender: 'Male', tone: 'Steady & Classic', desc: 'Traditional announcer with warm low notes' },
  { id: 'Umbriel', name: 'Umbriel', gender: 'Male', tone: 'Intimate & Calm', desc: 'Late night radio, meditation guide' },
  { id: 'Algieba', name: 'Algieba', gender: 'Female', tone: 'Vibrant & Youthful', desc: 'Upbeat product walkthroughs and vlogs' },
  { id: 'Despina', name: 'Despina', gender: 'Female', tone: 'Friendly & Casual', desc: 'Approachably warm customer guide' },
  { id: 'Erinome', name: 'Erinome', gender: 'Female', tone: 'Precise & Direct', desc: 'Technical documentation and executive brief' },
  { id: 'Algenib', name: 'Algenib', gender: 'Male', tone: 'Dynamic Presenter', desc: 'Keynote and product launch speaker' },
  { id: 'Rasalgethi', name: 'Rasalgethi', gender: 'Male', tone: 'Wise & Measured', desc: 'Philosophical, deliberate storytelling' },
  { id: 'Laomedeia', name: 'Laomedeia', gender: 'Female', tone: 'Airy & Lucid', desc: 'Ethereal, clean guided mindfulness' },
  { id: 'Achernar', name: 'Achernar', gender: 'Male', tone: 'Warm Corporate', desc: 'Balanced, trustworthy institutional voice' },
  { id: 'Alnilam', name: 'Alnilam', gender: 'Male', tone: 'Crisp Broadcast', desc: 'Studio news and financial updates' },
  { id: 'Schedar', name: 'Schedar', gender: 'Female', tone: 'Confident & Direct', desc: 'Motivational speech and leadership voice' },
  { id: 'Deneb', name: 'Deneb', gender: 'Female', tone: 'Warm Educator', desc: 'Patient instructional narration' },
  { id: 'Castor', name: 'Castor', gender: 'Male', tone: 'Friendly Specialist', desc: 'Explainer videos and tech audio' },
  { id: 'Pollux', name: 'Pollux', gender: 'Male', tone: 'Resonant Baritone', desc: 'Dramatic movie trailer style' },
  { id: 'Sirius', name: 'Sirius', gender: 'Male', tone: 'Punchy Commercial', desc: 'High-energy advertising voice' },
  { id: 'Vega', name: 'Vega', gender: 'Female', tone: 'Modern Tech', desc: 'AI assistant and crisp UX voice' },
  { id: 'Capella', name: 'Capella', gender: 'Female', tone: 'Warm Host', desc: 'Podcast host and interviewer' },
  { id: 'Rigel', name: 'Rigel', gender: 'Male', tone: 'Deep Authority', desc: 'Scientific documentaries and nature films' },
  { id: 'Betelgeuse', name: 'Betelgeuse', gender: 'Male', tone: 'Dramatic Grit', desc: 'Suspense thriller and character narration' }
];

export const STYLES = [
  {
    id: 'natural',
    title: 'Natural Conversational',
    desc: 'Relaxed, human, organic pacing and authentic cadence.',
    promptPrefix: 'Speak in a completely natural, relaxed, and conversational tone: '
  },
  {
    id: 'dramatic',
    title: 'Cinematic Dramatic',
    desc: 'High emotional tension, rich harmonic resonance, theatrical timing.',
    promptPrefix: 'Deliver this with intense dramatic weight, emotional gravity, and cinematic pauses: '
  },
  {
    id: 'whispering',
    title: 'Intimate Whisper & ASMR',
    desc: 'Soft, close-mic, hushed breathing and delicate acoustic resonance.',
    promptPrefix: 'Whisper this in a soft, intimate, hushed tone with close-mic breathiness: '
  },
  {
    id: 'warm',
    title: 'Warm Podcast Host',
    desc: 'Inviting, friendly, articulate broadcast presence.',
    promptPrefix: 'Speak as an engaging, warm, and inviting podcast host: '
  },
  {
    id: 'commercial',
    title: 'Energetic Commercial',
    desc: 'Punchy, enthusiastic, modern promotional delivery.',
    promptPrefix: 'Deliver this in an energetic, upbeat, punchy commercial presentation style: '
  },
  {
    id: 'empathetic',
    title: 'Empathetic & Caring',
    desc: 'Gentle, understanding, compassionate voice.',
    promptPrefix: 'Speak with deep empathy, kindness, warmth, and supportive compassion: '
  },
  {
    id: 'cheer',
    title: 'Cheerful & Upbeat',
    desc: 'Bright, smiling, positive, sunlit delivery.',
    promptPrefix: 'Deliver this with cheerful brightness, joy, and an upbeat smile: '
  },
  {
    id: 'mysterious',
    title: 'Eerie & Mysterious',
    desc: 'Chilling, shadowy, suspenseful narration.',
    promptPrefix: 'Speak in a dark, mysterious, suspenseful, and chilling tone: '
  },
  {
    id: 'intense',
    title: 'Urgent & Intense',
    desc: 'Fast-paced, emergency, high-stakes adrenaline.',
    promptPrefix: 'Deliver this with rapid urgency, high stakes, and intense adrenaline: '
  },
  {
    id: 'storyteller',
    title: 'Classic Audio Storyteller',
    desc: 'Immersive storybook reading with rich character inflection.',
    promptPrefix: 'Read this as a master storyteller creating an enchanting immersive world: '
  }
];

export const LANGUAGES = [
  { code: 'en-US', name: 'English (United States)', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (United Kingdom)', flag: '🇬🇧' },
  { code: 'en-AU', name: 'English (Australia)', flag: '🇦🇺' },
  { code: 'en-IN', name: 'English (India)', flag: '🇮🇳' },
  { code: 'es-ES', name: 'Spanish (Spain)', flag: '🇪🇸' },
  { code: 'es-MX', name: 'Spanish (Mexico)', flag: '🇲🇽' },
  { code: 'fr-FR', name: 'French (France)', flag: '🇫🇷' },
  { code: 'de-DE', name: 'German (Germany)', flag: '🇩🇪' },
  { code: 'it-IT', name: 'Italian (Italy)', flag: '🇮🇹' },
  { code: 'ja-JP', name: 'Japanese (Japan)', flag: '🇯🇵' },
  { code: 'ko-KR', name: 'Korean (South Korea)', flag: '🇰🇷' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', flag: '🇧🇷' },
  { code: 'hi-IN', name: 'Hindi (India)', flag: '🇮🇳' },
  { code: 'zh-CN', name: 'Chinese (Mandarin)', flag: '🇨🇳' }
];

export const SAMPLE_SCRIPTS = [
  {
    id: 'studio_intro',
    title: 'Studio Welcome',
    category: 'Welcome',
    text: 'Welcome to Vision Max Intelligence Neural Studio. This platform combines multimodal Google Gemini speech models with studio-grade acoustic rendering to deliver ultra-natural voice synthesis.'
  },
  {
    id: 'nature_doc',
    title: 'Nature Documentary',
    category: 'Cinematic',
    text: 'Deep within the ancient rainforest, where morning mist hangs suspended between centuries-old cedar trees, the forest awakens in a symphony of sound.'
  },
  {
    id: 'tech_keynote',
    title: 'Product Launch Keynote',
    category: 'Commercial',
    text: 'Today, we are thrilled to unveil the next leap in acoustic intelligence. A system designed from the ground up to render human cadence with unprecedented emotional nuance.'
  },
  {
    id: 'late_night_radio',
    title: 'Late Night Radio',
    category: 'Podcast',
    text: 'It is two in the morning across the city. The rain is drumming against the studio window, and wherever you are listening tonight, you are not alone.'
  }
];

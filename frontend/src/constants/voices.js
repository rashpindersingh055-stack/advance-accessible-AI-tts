// Vision Max Intelligence — Complete Constant Definitions

export const TTS_ENGINES = [
  {
    id: 'gemini-2.5-flash-preview-tts',
    name: 'Gemini 2.5 Flash Native TTS (Standard / Stable)',
    badge: 'Standard Engine',
    desc: 'High-speed, native multimodal 24kHz studio synthesis with full prompt emotion steering.',
    modelParam: 'gemini-2.5-flash-preview-tts',
    apiVersion: 'v1beta'
  },
  {
    id: 'gemini-3.1-flash-tts',
    name: 'Gemini 3.1 Flash Neural Audio (Next-Gen)',
    badge: 'Latest Gen',
    desc: 'Ultra-low latency expressive cadence with nuanced breath control and realism.',
    modelParam: 'gemini-3.1-flash-tts',
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
  { id: 'Gacrux', name: 'Gacrux', gender: 'Male', tone: 'Sonorous & Low', desc: 'Epic trailer and character narration' },
  { id: 'Pulcherrima', name: 'Pulcherrima', gender: 'Female', tone: 'Sophisticated', desc: 'Fine arts, high couture and culture' },
  { id: 'Achird', name: 'Achird', gender: 'Male', tone: 'Friendly Companion', desc: 'Interactive AI persona and gaming NPC' },
  { id: 'Zubenelgenubi', name: 'Zubenelgenubi', gender: 'Male', tone: 'Mysterious Baritone', desc: 'Fiction audiobooks and audio drama' },
  { id: 'Vindemiatrix', name: 'Vindemiatrix', gender: 'Female', tone: 'Polished Presenter', desc: 'International keynote speaker' },
  { id: 'Sadachbia', name: 'Sadachbia', gender: 'Female', tone: 'Empathetic & Caring', desc: 'Supportive guidance and mental wellness' },
  { id: 'Sadaltager', name: 'Sadaltager', gender: 'Male', tone: 'Earthy & Sincere', desc: 'Conversational realism with character' },
  { id: 'Sulafat', name: 'Sulafat', gender: 'Female', tone: 'Crystal Clear', desc: 'Sharp, immaculate enunciation for learning' }
];

export const STYLES = [
  {
    id: 'natural',
    title: 'Natural Conversational',
    desc: 'Fluid, everyday realistic speech with organic pacing.',
    promptPrefix: 'Speak in a completely natural, warm, and conversational everyday tone: '
  },
  {
    id: 'cheerful',
    title: 'Cheerful & Energetic',
    desc: 'High enthusiasm, bright smile in the voice, and vibrant energy.',
    promptPrefix: 'Say cheerfully and with high enthusiasm and energy: '
  },
  {
    id: 'deeply_emotional',
    title: 'Deeply Emotional & Empathetic',
    desc: 'Heartfelt, profound sentiment with gentle pauses.',
    promptPrefix: 'Say with profound emotional depth, warmth, and heartfelt empathy: '
  },
  {
    id: 'whispering',
    title: 'Mysterious & Whispering',
    desc: 'Intimate breathy suspense, low volume and intrigue.',
    promptPrefix: 'Say in an intriguing, soft, breathless whisper with suspense: '
  },
  {
    id: 'news_anchor',
    title: 'Authoritative News Anchor',
    desc: 'Sharp, professional enunciation with journalistic authority.',
    promptPrefix: 'Deliver in a confident, authoritative, articulate broadcast news anchor style: '
  },
  {
    id: 'cinematic',
    title: 'Inspiring & Cinematic',
    desc: 'Stirring, epic trailer pacing with uplifting resonance.',
    promptPrefix: 'Speak in a grand, cinematic, deeply inspirational and stirring tone: '
  },
  {
    id: 'meditative',
    title: 'Calm & Meditative',
    desc: 'Ultra-soothing, relaxed cadence designed for mindfulness.',
    promptPrefix: 'Say in a soothing, relaxed, gentle, and mindful meditative cadence: '
  },
  {
    id: 'storyteller',
    title: 'Dramatic Storyteller',
    desc: 'Vivid theatrical inflection, tension building, and dynamic rhythm.',
    promptPrefix: 'Narrate with high theatrical drama, dynamic tension, and vivid expressive pacing: '
  },
  {
    id: 'executive',
    title: 'Professional Executive',
    desc: 'Refined corporate poise, decisive and articulate.',
    promptPrefix: 'Present in a polished, crisp, sophisticated corporate and professional tone: '
  },
  {
    id: 'sarcastic',
    title: 'Sarcastic & Witty',
    desc: 'Playful irony, dry humor, and expressive smirks.',
    promptPrefix: 'Deliver with playful sarcasm, witty inflections, and dry irony: '
  }
];

export const LANGUAGES = [
  { code: 'en-US', name: 'English (United States)', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (United Kingdom)', flag: '🇬🇧' },
  { code: 'es-ES', name: 'Spanish (Español)', flag: '🇪🇸' },
  { code: 'fr-FR', name: 'French (Français)', flag: '🇫🇷' },
  { code: 'de-DE', name: 'German (Deutsch)', flag: '🇩🇪' },
  { code: 'ja-JP', name: 'Japanese (日本語)', flag: '🇯🇵' },
  { code: 'hi-IN', name: 'Hindi (हिन्दी)', flag: '🇮🇳' },
  { code: 'zh-CN', name: 'Chinese (Mandarin / 中文)', flag: '🇨🇳' },
  { code: 'pt-BR', name: 'Portuguese (Português)', flag: '🇧🇷' },
  { code: 'it-IT', name: 'Italian (Italiano)', flag: '🇮🇹' },
  { code: 'ar-SA', name: 'Arabic (العربية)', flag: '🇸🇦' },
  { code: 'ko-KR', name: 'Korean (한국어)', flag: '🇰🇷' },
  { code: 'ru-RU', name: 'Russian (Русский)', flag: '🇷🇺' }
];

export const SAMPLE_SCRIPTS = [
  {
    label: '🎙️ Studio Launch',
    text: 'Welcome to Vision Max Intelligence Neural Studio. By harmonizing state-of-the-art vocal synthesis with authentic emotional inflection, we transform raw script into breathtaking spoken art.'
  },
  {
    label: '🌌 Deep Space',
    text: 'Beyond the orbit of Neptune lies the Kuiper belt, a vast frontier of frozen relics from the dawn of our solar system. Out here, silence reigns supreme, waiting for humanity’s next great leap.'
  },
  {
    label: '💡 Product Keynote',
    text: 'Today, we are thrilled to unveil an entirely reimagined acoustic architecture. It is not merely faster; it is profoundly more personal, expressive, and undeniably human.'
  },
  {
    label: '🧘 Mindfulness Guide',
    text: 'Take a long, deep breath in through your nose... hold it gently... and release all tension as you exhale. Allow the quiet stillness of this present moment to settle within you.'
  },
  {
    label: '📰 Broadcast News',
    text: 'Good evening. Breaking developments today in artificial intelligence research, as scientists announce revolutionary advancements in real-time neural auditory synthesis.'
  },
  {
    label: '🎬 Cinematic Trailer',
    text: 'In a world where echoes shape destiny, one voice will rise above the storm. Witness the untold legend unfold across eternity.'
  }
];

export const SAMPLE_DIALOGUE = [
  {
    id: 'line-1',
    speaker_name: 'Dr. Elena Vance',
    voice_id: 'Kore',
    style_id: 'executive',
    text: 'Commander, the deep-space telemetry signals are aligning with the predicted frequency harmonics.',
    pause_after_ms: 500
  },
  {
    id: 'line-2',
    speaker_name: 'Captain Marcus',
    voice_id: 'Charon',
    style_id: 'cinematic',
    text: 'Incredible. Prepare the quantum audio transceiver. If this broadcast reaches them, history changes forever.',
    pause_after_ms: 600
  },
  {
    id: 'line-3',
    speaker_name: 'AI System Nova',
    voice_id: 'Zephyr',
    style_id: 'natural',
    text: 'Transceiver online. Neural synthesis frequency locked at 24 kilohertz. Ready for transmission on your command.',
    pause_after_ms: 300
  }
];

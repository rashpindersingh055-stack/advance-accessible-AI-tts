"""Autonomous AI Speech Director & Scriptwriter Agent powered by Google Gemini."""
import os
import json
import re
import httpx
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

load_dotenv()

VOICES_LIST = [
    {"id": "Charon", "gender": "Male", "tone": "Deep, Resonant, Authoritative, Cinematic"},
    {"id": "Fenrir", "gender": "Male", "tone": "Bold, Grounded, Intense, Gritty"},
    {"id": "Puck", "gender": "Male", "tone": "Playful, Quick-witted, Youthful, Energetic"},
    {"id": "Orus", "gender": "Male", "tone": "Crisp, Smart, Calm, Informative"},
    {"id": "Algenib", "gender": "Male", "tone": "Gravelly, Weathered, Hardboiled, Mysterious"},
    {"id": "Enif", "gender": "Male", "tone": "Warm, Reassuring, Friendly, Conversational"},
    {"id": "Kore", "gender": "Female", "tone": "Warm, Natural, Expressive, Authentic"},
    {"id": "Zephyr", "gender": "Female", "tone": "Soft, Articulate, Graceful, Premium"},
    {"id": "Leda", "gender": "Female", "tone": "Gentle, Melodic, Thoughtful, Poetic"},
    {"id": "Aoede", "gender": "Female", "tone": "Radiant, Dynamic, Vibrant, Modern"},
    {"id": "Callirrhoe", "gender": "Female", "tone": "Rich, Storyteller, Dramatic, Nuanced"},
    {"id": "Autonoe", "gender": "Female", "tone": "Smooth, Elegant, Sophisticated, Chilling"}
]

STYLE_IDS = ["natural", "dramatic", "whispering", "warm", "commercial", "empathetic", "cheer", "mysterious", "intense", "storyteller"]

class AIAgentDirectorService:
    @staticmethod
    async def create_and_humanize_audio_story(
        prompt: str,
        genre: str = "Horror & Suspense",
        num_speakers: int = 4,
        length: str = "Medium",
        api_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Multi-Step Autonomous Workflow:
        1. Writes an immersive multi-speaker audio drama/story.
        2. Humanizes dialogues with natural speech inflections, breath pauses, and realistic emotional cues.
        3. Maps distinct character personas to the optimal neural voice IDs from the 30-voice catalog.
        """
        key = api_key or os.getenv("GEMINI_API_KEY", "")
        if not key:
            raise ValueError("Google Gemini API Key is required to power the AI Speech Agent. Please set your API key in Settings.")

        system_instruction = f"""
        You are a World-Class Hollywood Audio Drama Director, Master Scriptwriter, and Dialogue Humanizer.
        Your mission is to transform the user's prompt into a broadcast-ready, hyper-immersive multi-speaker audio production.

        AVAILABLE VOICES FOR CASTING:
        {json.dumps(VOICES_LIST, indent=2)}

        AVAILABLE EMOTION STYLES:
        {json.dumps(STYLE_IDS)}

        GUIDELINES FOR THE AI AGENT:
        1. SCRIPT CREATION: Craft a compelling story with {num_speakers} distinct characters in the '{genre}' genre based on: "{prompt}".
        2. HUMANIZER PASS:
           - Make dialogue sound 100% human and unscripted.
           - Add natural conversational hesitation, emotional gasps, whisper directions, and authentic cadence.
           - Ensure each character has a unique speaking style, vocabulary, and temperament.
        3. CASTING & PACING:
           - Assign a distinct, complementary voice_id to each character from the list above.
           - Assign appropriate style_id (e.g. 'dramatic', 'whispering', 'intense', 'mysterious') to each line.
           - Add dramatic pause_after_ms (between 250ms and 900ms) to create cinematic tension.

        OUTPUT FORMAT:
        You MUST respond ONLY with a clean, valid JSON object with this exact structure:
        {{
          "title": "Short Gripping Title",
          "synopsis": "Brief 1-2 sentence dramatic summary",
          "genre": "{genre}",
          "characters": [
            {{
              "name": "Character Name",
              "role": "Archetype / Description (e.g. Skeptical Investigator)",
              "voice_id": "Charon",
              "gender": "Male"
            }}
          ],
          "dialogue": [
            {{
              "speaker_name": "Character Name",
              "voice_id": "Charon",
              "style_id": "mysterious",
              "text": "Humanized spoken line with emotion and natural cadence...",
              "pause_after_ms": 400
            }}
          ]
        }}
        """

        length_guide = {
            "Short": "6 to 8 engaging dialogue exchanges (~1-2 minutes)",
            "Medium": "10 to 14 dramatic dialogue exchanges (~3-4 minutes)",
            "Long": "16 to 22 immersive dialogue exchanges (~5-7 minutes)"
        }.get(length, "10 to 14 dialogue exchanges")

        user_content = f"""
        Create a high-impact multi-speaker audio drama production for:
        PROMPT: {prompt}
        GENRE: {genre}
        NUMBER OF CHARACTERS: {num_speakers}
        TARGET LENGTH: {length_guide}

        Deliver the fully humanized, casted JSON output now.
        """

        endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={key}"
        
        payload = {
            "contents": [
                {"role": "user", "parts": [{"text": f"{system_instruction}\n\n{user_content}"}]}
            ],
            "generationConfig": {
                "temperature": 0.85,
                "topP": 0.95,
                "responseMimeType": "application/json"
            }
        }

        async with httpx.AsyncClient(timeout=45.0) as client:
            try:
                res = await client.post(endpoint, json=payload)
                if not res.ok:
                    # Fallback to gemini-1.5-flash if 2.5 is unavailable
                    fb_endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={key}"
                    res = await client.post(fb_endpoint, json=payload)
                    if not res.ok:
                        err_json = res.json()
                        raise ValueError(err_json.get("error", {}).get("message", f"HTTP {res.status_code}"))
                
                resp_json = res.json()
                raw_text = resp_json["candidates"][0]["content"]["parts"][0]["text"]
                
                # Clean JSON markdown if present
                clean_json_str = raw_text.strip()
                if clean_json_str.startswith("```json"):
                    clean_json_str = clean_json_str[7:]
                if clean_json_str.startswith("```"):
                    clean_json_str = clean_json_str[3:]
                if clean_json_str.endswith("```"):
                    clean_json_str = clean_json_str[:-3]
                
                data = json.loads(clean_json_str.strip())
                return data
            except Exception as e:
                # If JSON parsing or API failed, raise descriptive error
                raise ValueError(f"AI Speech Agent generation error: {str(e)}")

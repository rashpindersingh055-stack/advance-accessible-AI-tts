"""Autonomous AI Speech Director & Scriptwriter Agent using Official Google Gemini Models."""
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

# Official Google Gemini Scriptwriting / Reasoning Models
OFFICIAL_SCRIPT_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-3.1-flash",
    "gemini-flash-latest",
    "gemini-1.5-flash",
    "gemini-1.5-pro"
]

class AIAgentDirectorService:
    @staticmethod
    def _clean_json_response(raw_text: str) -> Dict[str, Any]:
        """Robust multi-layer JSON parser for Gemini outputs."""
        text = raw_text.strip()
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

        try:
            return json.loads(text)
        except Exception:
            match = re.search(r"(\{[\s\S]*\})", text)
            if match:
                return json.loads(match.group(1))
            raise ValueError(f"Unable to parse structured JSON from model output: {raw_text[:200]}")

    @staticmethod
    async def create_and_humanize_audio_story(
        prompt: str,
        genre: str = "Horror & Suspense",
        num_speakers: int = 4,
        length: str = "Medium",
        model_name: Optional[str] = None,
        api_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Autonomous Multi-Speaker Scriptwriting & Casting via Google Gemini v1beta API.
        """
        key = api_key or os.getenv("GEMINI_API_KEY", "")
        if not key:
            raise ValueError("Google Gemini API Key is required. Please set your API key in Settings.")

        system_instruction = f"""
        You are a World-Class Hollywood Audio Drama Director, Master Scriptwriter, and Dialogue Humanizer.
        Your mission is to transform the user's prompt into a broadcast-ready, hyper-immersive multi-speaker audio production.

        AVAILABLE VOICES FOR CASTING:
        {json.dumps(VOICES_LIST, indent=2)}

        AVAILABLE EMOTION STYLES:
        {json.dumps(STYLE_IDS)}

        GUIDELINES:
        1. SCRIPT CREATION: Craft a compelling story with {num_speakers} distinct characters in the '{genre}' genre based on: "{prompt}".
        2. HUMANIZER PASS:
           - Make dialogue sound 100% human, authentic, and unscripted.
           - Add natural conversational pauses ('...'), emotional inflections, stuttered hesitations, and realistic subtext.
           - Give each character a distinct personality, vocabulary, and rhythm.
        3. CASTING & PACING:
           - Assign a distinct, complementary voice_id to each character from the list above.
           - Assign appropriate style_id (e.g. 'dramatic', 'whispering', 'intense', 'mysterious') to each line.
           - Add dramatic pause_after_ms (between 250ms and 800ms) to create cinematic tension.

        OUTPUT FORMAT:
        You MUST respond ONLY with a clean JSON object with this exact structure:
        {{
          "title": "Short Gripping Title",
          "synopsis": "Brief 1-2 sentence dramatic summary",
          "genre": "{genre}",
          "characters": [
            {{
              "name": "Character Name",
              "role": "Role / Archetype",
              "voice_id": "Charon",
              "gender": "Male"
            }}
          ],
          "dialogue": [
            {{
              "speaker_name": "Character Name",
              "voice_id": "Charon",
              "style_id": "mysterious",
              "text": "Humanized spoken line...",
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
        Create a master multi-character audio drama production:
        PROMPT: {prompt}
        GENRE: {genre}
        NUMBER OF CHARACTERS: {num_speakers}
        TARGET LENGTH: {length_guide}

        Deliver the complete humanized JSON production script now.
        """

        # Candidate models list with user choice prioritized
        candidate_models = []
        if model_name and model_name.strip():
            candidate_models.append(model_name.strip())
        for m in OFFICIAL_SCRIPT_MODELS:
            if m not in candidate_models:
                candidate_models.append(m)

        last_error = None

        async with httpx.AsyncClient(timeout=45.0) as client:
            for model_id in candidate_models:
                endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{model_id}:generateContent?key={key}"
                
                # Official SystemInstruction + Structured JSON
                payload = {
                    "systemInstruction": {
                        "parts": [{"text": system_instruction}]
                    },
                    "contents": [
                        {"role": "user", "parts": [{"text": user_content}]}
                    ],
                    "generationConfig": {
                        "temperature": 0.85,
                        "topP": 0.95,
                        "maxOutputTokens": 8192,
                        "responseMimeType": "application/json"
                    }
                }

                try:
                    res = await client.post(endpoint, json=payload)
                    if not res.ok:
                        # Fallback payload with combined parts
                        fallback_payload = {
                            "contents": [
                                {"role": "user", "parts": [{"text": f"{system_instruction}\n\n{user_content}"}]}
                            ],
                            "generationConfig": {
                                "temperature": 0.85,
                                "topP": 0.95,
                                "maxOutputTokens": 8192
                            }
                        }
                        res = await client.post(endpoint, json=fallback_payload)

                    if res.ok:
                        resp_json = res.json()
                        raw_text = resp_json["candidates"][0]["content"]["parts"][0]["text"]
                        data = AIAgentDirectorService._clean_json_response(raw_text)
                        data["model_used"] = model_id
                        return data
                    else:
                        last_error = f"{model_id}: HTTP {res.status_code} - {res.text[:120]}"
                except Exception as ex:
                    last_error = f"{model_id}: {str(ex)}"
                    continue

        raise ValueError(f"AI Script Generation failed across all Gemini models. Last error: {last_error}")

import json
import os
from domain.analyse.strategic_extractor import build_strategic_json
from google import genai
from google.genai import types

# print(os.getenv("GEMINI_API_KEY"))
# client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def read_system_prompt(filepath="prompts/system_prompt.txt"):
    try:
        with open(filepath, 'r', encoding='utf-8') as file:
            return file.read().strip()
    except FileNotFoundError:
        raise FileNotFoundError(f"Le fichier de prompt est introuvable au chemin : {filepath}")

async def generate_coach_analysis(move_context: dict, fen: str, immediate_threat: str, candidates_moves: list[dict]) -> str:
    """
    Construit le contexte stratégique et interroge le LLM.
    """
    
    
    system_prompt = read_system_prompt()
    strat_dict =  build_strategic_json(fen, move_context, immediate_threat, candidates_moves)
    user_prompt = json.dumps(strat_dict, ensure_ascii=False)

    try:
        response = await client.aio.models.generate_content(
            model="gemini-3.5-flash",
            contents=user_prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                response_mime_type="application/json", # Force le JSON strict
                temperature=0.7,
            )
        )
        
        # Le texte de la réponse est dans response.text
        return json.loads(response.text)
    except Exception as e:
        raise ValueError(f"Probleme de prompt {e}")

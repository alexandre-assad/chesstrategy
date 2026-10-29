from fastapi import APIRouter, HTTPException
import chess
# Import du nouveau service
from domain.openings.services import identify_current_opening
from services.llm_coach import generate_coach_analysis 
# from services.opening_identifier import identify_current_opening

router = APIRouter()

@router.post("/api/analyze")
async def analyze_game(data: dict):
    fen = data.get("fen")
    if not fen:
        raise HTTPException(status_code=400, detail="FEN manquant.")
    
    try:
        board = chess.Board(fen)
    except ValueError:
        raise HTTPException(status_code=400, detail="FEN invalide.")
            
    turn = "Blancs" if board.turn == chess.WHITE else "Noirs"
    
    opening_info = identify_current_opening(board) # Doit renvoyer { "name": "...", "eco": "...", "status": "..." }
    
    analysis_data_dict = {
        "move_context": {
            "opening": opening_info,
            "played_move": data.get("played_move", "Inconnu"),
            "eval_before": data.get("eval_before", "N/A"),
            "eval_after": data.get("eval_after", "N/A"),
            "eval_delta": data.get("eval_delta", "N/A")
        },
        "engine_candidates": data.get("candidates_data", []),
        "tactical_and_piece_status": {
            "immediate_threat_if_ignored": "Aucune menace claire identifiée"
        }
    }

    
    # 2. Appel au service LLM isolé (Asynchrone)
    coach_response = await generate_coach_analysis(analysis_data_dict['move_context'], board.fen(), analysis_data_dict["tactical_and_piece_status"]['immediate_threat_if_ignored'], analysis_data_dict['engine_candidates'])

    return {
        "fen": board.fen(),
        "turn": turn,
        "opening": opening_info.get("name"),
        "eco": opening_info.get("eco"),
        "status": opening_info.get("status", "out_of_book"),
        "coach_message": coach_response
    }
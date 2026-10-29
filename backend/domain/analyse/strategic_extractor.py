import chess

from domain.analyse.analyse_move import analyze_engine_candidates
from domain.analyse.analyse_pieces import get_minor_pieces
from domain.analyse.analyse_structure import analyze_center, analyze_king_safety, analyze_pawn_structure, get_files_status, get_occupied_outposts, get_structural_holes


def build_strategic_json(
    fen: str, 
    move_context_data: dict, 
    immediate_threat: str = "Aucune menace claire identifiée",
    candidates_data: list[dict] = []
) -> dict:
    """
    Assemble le JSON final pour le prompt LLM.
    `move_context_data` provient de ton front-end (Stockfish Worker).
    """
    board = chess.Board(fen)
    
    return { 
        "move_context": move_context_data, # Fourni par ton analyse front (eval_before, eval_after, etc.)
        "engine_candidates": analyze_engine_candidates(board, candidates_data), 
        "strategic_landscape": {
            "pawn_structure": analyze_pawn_structure(board), #TODO
            "center_status": analyze_center(board),
            "files": get_files_status(board), 
            "structural_holes": get_structural_holes(board)
        },
        "tactical_and_piece_status": {
            "minor_pieces": get_minor_pieces(board),
            "outposts": get_occupied_outposts(board), 
            "king_safety": analyze_king_safety(board),
            "immediate_threat_if_ignored": immediate_threat
        }
    }


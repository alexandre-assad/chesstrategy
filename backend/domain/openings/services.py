import chess
from domain.openings.repository import OpeningRepository

def identify_current_opening(board: chess.Board) -> dict:
    """
    Identifie l'ouverture actuelle en se basant sur le FEN ou l'historique.
    """
    opening_repo = OpeningRepository()
    # 1. Test du FEN actuel
    result = opening_repo.find_by_fen(board.fen())
    if result:
        return {
            "name": result.get("name"),
            "eco": result.get("eco"),
            "moves": result.get("moves"),
            "status": "theory"
        }
    
    return {
        "name": "Hors-théorie / Milieu de jeu",
        "eco": "---",
        "status": "out_of_book"
    }
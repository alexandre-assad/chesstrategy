import chess

def replay_game(moves: list[str]) -> chess.Board | None:
    """Rejoue la liste des coups SAN et retourne l'objet Board, ou None si un coup est invalide."""
    board = chess.Board()
    for move in moves:
        try:
            board.push_san(move)
        except ValueError:
            return None
    return board
import chess

def get_bishop_pair(board: chess.Board) -> str:
    """Détecte qui possède la paire de fous."""
    w_bishops = len(board.pieces(chess.BISHOP, chess.WHITE))
    b_bishops = len(board.pieces(chess.BISHOP, chess.BLACK))
    
    if w_bishops >= 2 and b_bishops < 2: return "Blancs"
    if b_bishops >= 2 and w_bishops < 2: return "Noirs"
    if w_bishops >= 2 and b_bishops >= 2: return "Égalité (Les deux)"
    # TODO fou de couleur opposé ?
    return "Aucun"


def get_minor_pieces(board: chess.Board) -> dict:
    """Détaille les pièces mineures restantes et repère les déséquilibres."""
    white_bishops = list(board.pieces(chess.BISHOP, chess.WHITE))
    black_bishops = list(board.pieces(chess.BISHOP, chess.BLACK))
    white_knights = list(board.pieces(chess.KNIGHT, chess.WHITE))
    black_knights = list(board.pieces(chess.KNIGHT, chess.BLACK))

    # Détection paire de fous
    has_white_pair = len(white_bishops) >= 2
    has_black_pair = len(black_bishops) >= 2
    if has_white_pair and has_black_pair:
        bishop_pair = "Égalité (les deux)"
    elif has_white_pair:
        bishop_pair = "Blancs"
    elif has_black_pair:
        bishop_pair = "Noirs"
    else:
        bishop_pair = "Aucun"

    # Fous de couleurs opposées ?
    opposite_bishops = False
    if len(white_bishops) == 1 and len(black_bishops) == 1:
        # chess.square_color retourne True pour case claire, False pour case sombre
        white_color = bool(chess.BB_LIGHT_SQUARES & (1 << white_bishops[0]))
        black_color = bool(chess.BB_LIGHT_SQUARES & (1 << black_bishops[0]))
        opposite_bishops = (white_color != black_color)

    # Type de déséquilibre
    imbalance = "symétrique"
    if opposite_bishops:
        imbalance = "Fous de couleur opposée"
    elif len(white_bishops) != len(black_bishops) or len(white_knights) != len(black_knights):
        imbalance = "Asymétrique (Fou vs Cavalier / Matériel)"

    def format_piece_list(bishops, knights):
        items = []
        for sq in bishops:
            color_name = "claire" if bool(chess.BB_LIGHT_SQUARES & (1 << sq)) else "sombre"
            items.append(f"Fou case {color_name} ({chess.square_name(sq)})")
        for sq in knights:
            items.append(f"Cavalier ({chess.square_name(sq)})")
        return items

    return {
        "bishop_pair": bishop_pair,
        "imbalance_type": imbalance,
        "white_has": format_piece_list(white_bishops, white_knights),
        "black_has": format_piece_list(black_bishops, black_knights)
    }

import chess

def get_occupied_outposts(board: chess.Board) -> list[dict]:
    """
    Identifie les pièces mineures (cavaliers/fous) ancrées sur un avant-poste :
    - Situées sur les rangées 4, 5 ou 6
    - Protégées par au moins un pion ami
    - Inattaquables par un pion adverse (aucun pion ennemi sur colonnes adjacentes pouvant avancer)
    """
    outposts = []
    
    for sq in chess.SQUARES:
        piece = board.piece_at(sq)
        if not piece or piece.piece_type not in [chess.KNIGHT, chess.BISHOP]:
            continue

        color = piece.color
        opp_color = not color
        rank = chess.square_rank(sq)
        file_idx = chess.square_file(sq)

        # 1. Condition de profondeur : rangées 4, 5, 6 relatives au joueur
        is_advanced = (rank in [3, 4, 5]) if color == chess.WHITE else (rank in [2, 3, 4])
        if not is_advanced:
            continue

        # 2. Protégé par au moins un pion allié
        friendly_pawns = board.pieces(chess.PAWN, color)
        pawn_attacks = board.attacks(sq) & friendly_pawns
        # Vérification directionnelle du pion qui protège
        is_defended_by_pawn = False
        for p_sq in pawn_attacks:
            p_rank = chess.square_rank(p_sq)
            if (color == chess.WHITE and p_rank < rank) or (color == chess.BLACK and p_rank > rank):
                is_defended_by_pawn = True
                break

        if not is_defended_by_pawn:
            continue

        # 3. Inattaquable par les pions adverses
        opp_pawns = board.pieces(chess.PAWN, opp_color)
        can_be_attacked_by_pawn = False
        for opp_p_sq in opp_pawns:
            opp_file = chess.square_file(opp_p_sq)
            opp_rank = chess.square_rank(opp_p_sq)

            if abs(opp_file - file_idx) == 1:
                # Si le pion adverse est encore en arrière, il peut avancer et chasser la pièce
                if (color == chess.WHITE and opp_rank > rank) or (color == chess.BLACK and opp_rank < rank):
                    can_be_attacked_by_pawn = True
                    break

        if not can_be_attacked_by_pawn:
            piece_name = "Cavalier" if piece.piece_type == chess.KNIGHT else "Fou"
            camp = "blanc" if color == chess.WHITE else "noir"
            outposts.append({
                "piece": piece_name,
                "camp": camp,
                "square": chess.square_name(sq),
                "status": f"{piece_name} {camp} solidement ancré en {chess.square_name(sq)}"
            })

    return outposts

def get_structural_holes(board: chess.Board) -> list[str]:
    """
    Détecte les cases centrales/semi-centrales (c, d, e, f)
    qui ne peuvent plus JAMAIS être contrôlées par un pion adverse.
    """
    holes = []
    # Focus sur les cases centrales stratégiques (rangées 4, 5, 6 pour les Blancs par ex)
    tracked_squares = [
        chess.C4, chess.D4, chess.E4, chess.F4,
        chess.C5, chess.D5, chess.E5, chess.F5,
        chess.C6, chess.D6, chess.E6, chess.F6
    ]

    black_pawns = board.pieces(chess.PAWN, chess.BLACK)
    
    for sq in tracked_squares:
        # Une case est un trou contre les Noirs si aucun pion noir ne peut l'attaquer
        # Pour qu'un pion noir contrôle sq, il doit venir d'une rangée supérieure et d'une colonne adjacente
        sq_file = chess.square_file(sq)
        sq_rank = chess.square_rank(sq)

        can_be_defended = False
        for bp_sq in black_pawns:
            bp_file = chess.square_file(bp_sq)
            bp_rank = chess.square_rank(bp_sq)
            # Un pion noir est plus haut et sur une colonne voisine
            if abs(bp_file - sq_file) == 1 and bp_rank > sq_rank:
                can_be_defended = True
                break

        if not can_be_defended and not (board.piece_at(sq) and board.piece_at(sq) == chess.Piece(chess.PAWN, chess.BLACK)):
            holes.append(chess.square_name(sq))

    return holes


def analyze_center(board: chess.Board) -> str:
    """Évalue la tension sur les 4 cases centrales (d4, e4, d5, e5)."""
    center_squares = [chess.D4, chess.E4, chess.D5, chess.E5]
    center_pawns = sum(1 for sq in center_squares if board.piece_at(sq) and board.piece_at(sq).piece_type == chess.PAWN)
    
    if center_pawns == 0:
        return "Ouvert"
    elif center_pawns >= 3:
        return "Verrouillé / Fermé"
    else:
        return "Tension dynamique"
    


def analyze_king_safety(board: chess.Board) -> dict:
    """Heuristique basique de la position des Rois."""
    def evaluate_king(color: chess.Color) -> str:
        king_sq = board.king(color)
        if king_sq is None: return "Inconnu"
        
        file_idx = chess.square_file(king_sq)
        if file_idx in [3, 4]:  # Colonnes d ou e
            if board.has_castling_rights(color):
                return "Au centre, flexible (droits de roque intacts)"
            return "Au centre, exposé"
        elif file_idx <= 2:  # Colonnes a, b, c
            return "Aile dame (Grand roque)"
        else:  # Colonnes f, g, h
            return "Aile roi (Petit roque)"

    return {
        "white": evaluate_king(chess.WHITE),
        "black": evaluate_king(chess.BLACK)
    }

def get_files_status(board: chess.Board) -> dict[str, list[str]]:
    """Identifie les colonnes ouvertes et semi-ouvertes."""
    
    file_letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    open_files = []
    semi_white = []
    semi_black = []

    white_pawns = board.pieces(chess.PAWN, chess.WHITE)
    black_pawns = board.pieces(chess.PAWN, chess.BLACK)

    for file_idx, char in enumerate(file_letters):
        file_mask = chess.BB_FILES[file_idx]
        has_white = bool(white_pawns & file_mask)
        has_black = bool(black_pawns & file_mask)

        if not has_white and not has_black:
            open_files.append(char)
        elif not has_white and has_black:
            semi_white.append(char) 
        elif has_white and not has_black:
            semi_black.append(char)

    return {
        "open": open_files,
        "semi_open_white": semi_white,
        "semi_open_black": semi_black
    }


def _has_pawn(pawns_bb: int, file_idx: int, rank_idx: int) -> bool:
    sq = chess.square(file_idx, rank_idx)
    return bool(pawns_bb & (1 << sq))

def detect_typical_structure(w_pawns: int, b_pawns: int) -> str:
    """Identifie les archétypes majeurs par empreinte binaire."""
    
    if (_has_pawn(w_pawns, 3, 3) and _has_pawn(w_pawns, 4, 2) and not (w_pawns & chess.BB_FILES[2]) and
        _has_pawn(b_pawns, 3, 4) and _has_pawn(b_pawns, 2, 5) and not (b_pawns & chess.BB_FILES[4])):
        return "Carlsbad"

    # 2. Carlsbad Inversé (Échange Caro-Kann / Échange Slave)
    # Blancs: d4 (3,3), c3 (2,2) sans pion e. Noirs: d5 (3,4), e6 (4,5) sans pion c.
    if (_has_pawn(w_pawns, 3, 3) and _has_pawn(w_pawns, 2, 2) and not (w_pawns & chess.BB_FILES[4]) and
        _has_pawn(b_pawns, 3, 4) and _has_pawn(b_pawns, 4, 5) and not (b_pawns & chess.BB_FILES[2])):
        return "Carlsbad Inversé"

    # Étau de Maroczy (pions c4 et e4 blancs contre d6 noir)
    if (_has_pawn(w_pawns, 2, 3) and _has_pawn(w_pawns, 4, 3) and _has_pawn(b_pawns, 3, 5)):
        return "Étau de Maroczy"

    # Chaîne Française / Est-Indienne bloquée (e5 vs e6 ou d4-d5)
    if _has_pawn(w_pawns, 4, 4) and _has_pawn(b_pawns, 4, 5):
        return "Chaîne Française"
        
    # Structure d'Isolani (Pion d4 isolé)
    if _has_pawn(w_pawns, 3, 3) and not (w_pawns & (chess.BB_FILES[2] | chess.BB_FILES[4])):
        return "Isolani"

    return "Aucune structure particulière"

def get_pawn_tensions(board: chess.Board) -> list[dict]:
    """Détecte les tensions directes (attaques mutuelles diagonales et blocages frontaux)."""
    tensions = []
    w_pawns = board.pieces(chess.PAWN, chess.WHITE)
    b_pawns = board.pieces(chess.PAWN, chess.BLACK)

    # 1. Pression diagonale (attaques de pions)
    for w_sq in w_pawns:
        attacks = board.attacks(w_sq) & b_pawns
        for b_sq in attacks:
            tensions.append({
                "type": "pression_diagonale",
                "squares": [chess.square_name(w_sq), chess.square_name(b_sq)]
            })

    # 2. Contact frontal (face à face bloqué)
    for w_sq in w_pawns:
        front_sq = w_sq + 8
        if front_sq in b_pawns:
            tensions.append({
                "type": "contact_frontal",
                "squares": [chess.square_name(w_sq), chess.square_name(front_sq)]
            })

    return tensions

def analyze_pawn_structure(board: chess.Board) -> dict:
    w_pawns = board.pieces(chess.PAWN, chess.WHITE)
    b_pawns = board.pieces(chess.PAWN, chess.BLACK)

    # Décompte sectoriel
    queenside_files = chess.BB_FILES[0] | chess.BB_FILES[1] | chess.BB_FILES[2] # a, b, c
    center_files = chess.BB_FILES[3] | chess.BB_FILES[4]                         # d, e
    kingside_files = chess.BB_FILES[5] | chess.BB_FILES[6] | chess.BB_FILES[7]   # f, g, h

    sector_counts = {
        "queenside": {
            "white": bin(w_pawns & queenside_files).count("1"),
            "black": bin(b_pawns & queenside_files).count("1")
        },
        "center": {
            "white": bin(w_pawns & center_files).count("1"),
            "black": bin(b_pawns & center_files).count("1")
        },
        "kingside": {
            "white": bin(w_pawns & kingside_files).count("1"),
            "black": bin(b_pawns & kingside_files).count("1")
        }
    }

    # Faiblesses statiques (isolés, doublés, arriérés)
    isolated = []
    doubled = []
    for f in range(8):
        f_mask = chess.BB_FILES[f]
        adj_mask = (chess.BB_FILES[f - 1] if f > 0 else 0) | (chess.BB_FILES[f + 1] if f < 7 else 0)
        
        # Isolés
        if (w_pawns & f_mask) and not (w_pawns & adj_mask):
            isolated.append(f"Pion blanc isolé col {chess.FILE_NAMES[f]}")
        if (b_pawns & f_mask) and not (b_pawns & adj_mask):
            isolated.append(f"Pion noir isolé col {chess.FILE_NAMES[f]}")

        # Doublés
        if bin(w_pawns & f_mask).count("1") > 1:
            doubled.append(f"Blancs doublés col {chess.FILE_NAMES[f]}")
        if bin(b_pawns & f_mask).count("1") > 1:
            doubled.append(f"Noirs doublés col {chess.FILE_NAMES[f]}")

    return {
        "typical_structure": detect_typical_structure(w_pawns, b_pawns),
        "tension": get_pawn_tensions(board),
        "candidate_breaks": {
            "white": [], # Peut être enrichi en simulant les poussées de pions légales
            "black": []
        },
        "chain_direction": "Centre bloqué" if any(t["type"] == "contact_frontal" for t in get_pawn_tensions(board)) else "Centre fluide / non bloqué",      
        "sector_counts": sector_counts,
        "static_weaknesses": {
            "backward_pawns": [],
            "isolated_pawns": isolated,
            "doubled_files": doubled
        }
    }
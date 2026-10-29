import chess

def analyze_engine_candidates(board: chess.Board, candidates_data: list[dict]) -> list[dict]:
    """
    Simule chaque variante principale (PV) sur une copie du plateau
    et extrait le différentiel matériel et spatial.
    """
    enriched_candidates = []

    for item in candidates_data:
        pv_moves = item.get("pv", [])
        if not pv_moves:
            enriched_candidates.append(item)
            continue

        sim_board = board.copy()
        moves_played = 0

        for move_str in pv_moves:
            try:
                move = sim_board.parse_san(move_str)
            except ValueError:
                try:
                    move = chess.Move.from_uci(move_str)
                except ValueError:
                    break
                    
            sim_board.push(move)
            moves_played += 1

        # Analyse des deltas entre board (initial) et sim_board (futur)
        initial_queens = len(board.pieces(chess.QUEEN, chess.WHITE)) + len(board.pieces(chess.QUEEN, chess.BLACK))
        future_queens = len(sim_board.pieces(chess.QUEEN, chess.WHITE)) + len(sim_board.pieces(chess.QUEEN, chess.BLACK))
        queens_exchanged = (initial_queens > 0 and future_queens == 0)

        # Détection d'expansion de pions (mesure de la poussée moyenne)
        color = board.turn
        initial_pawns = list(board.pieces(chess.PAWN, color))
        future_pawns = list(sim_board.pieces(chess.PAWN, color))

        pawn_expansion = "stable"
        if initial_pawns and future_pawns:
            initial_avg_rank = sum(chess.square_rank(sq) for sq in initial_pawns) / len(initial_pawns)
            future_avg_rank = sum(chess.square_rank(sq) for sq in future_pawns) / len(future_pawns)
            rank_delta = (future_avg_rank - initial_avg_rank) if color == chess.WHITE else (initial_avg_rank - future_avg_rank)
            
            if rank_delta >= 0.25:
                pawn_expansion = "poussée_active"
            elif rank_delta <= -0.2:
                pawn_expansion = "recul_ou_perte"

        # Intention déduite
        if queens_exchanged:
            intent = "Liquidation vers une finale"
        elif pawn_expansion == "poussée_active":
            intent = "Gain d'espace et rupture de pions"
        elif moves_played > 0 and sim_board.is_checkmate():
            intent = "Attaque directe de mat"
        else:
            intent = "Manœuvre de consolidation et repositionnement"

        candidate_enriched = {
            **item,
            "future_board_delta": {
                "moves_simulated": moves_played,
                "queens_exchanged": queens_exchanged,
                "pawn_expansion": pawn_expansion,
                "strategic_intent": intent
            }
        }
        enriched_candidates.append(candidate_enriched)

    return enriched_candidates
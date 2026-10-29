import json
from pathlib import Path

DATA_PATH = Path(__file__).parent / "openings.json"

class OpeningRepository:
    def __init__(self):
        self.database = self._load_database()

    def _load_database(self) -> dict:
        if not DATA_PATH.exists():
            return {}
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            return json.load(f)

    def find_by_fen(self, fen: str) -> dict | None:
        """
        Recherche exacte par FEN. 
        Note : Les FEN standards incluent les compteurs de demi-coups/roques complets. 
        Si le dictionnaire utilise des FEN tronqués (position des pièces uniquement), 
        on peut adapter la clé. Ici on tente la correspondance directe.
        """
        # Nettoyage basique du FEN si nécessaire (on garde les 4 premiers champs : pièces, trait, roque, en passant)
        clean_fen = " ".join(fen.split(" ")[:4])
        
        # On cherche d'abord le FEN exact, sinon on cherche parmi les clés nettoyées
        if fen in self.database:
            return self.database[fen]
            
        for db_fen, data in self.database.items():
            if " ".join(db_fen.split(" ")[:4]) == clean_fen:
                return data
                
        return None

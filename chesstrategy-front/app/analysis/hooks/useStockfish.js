import { useState, useEffect, useRef, useCallback} from "react";

export function useStockfish() {
  const [evaluation, setEvaluation] = useState("Initialisation...");
  const stockfishRef = useRef(null);

  const isWhiteTurnRef = useRef(true);

  // État stable de la position actuelle
  const currentEngineStateRef = useRef({
    scoreCp: 0,
    bestMove: null, // format UCI (ex: "e2e4")
  });

  const onCompleteRef = useRef(null);

  useEffect(() => {
    const sf = new Worker("/stockfish.js");
    stockfishRef.current = sf;

    sf.onmessage = (event) => {
  const msg = event.data;
  if (typeof msg !== "string") return;

  // 1. Fin officielle du calcul par le moteur (ex: quand il atteint ton "go depth 20")
  if (msg.startsWith("bestmove")) {
    if (onCompleteRef.current && currentEngineStateRef.current) {
      onCompleteRef.current(currentEngineStateRef.current);
      onCompleteRef.current = null;
    }
    return;
  }

  // 2. Traitement continu des lignes d'évaluation (streaming)
  if (msg.includes("info") && msg.includes("score")) {
    // Extraction de la profondeur actuelle
    const depthMatch = msg.match(/depth (\d+)/);
    const depth = depthMatch ? parseInt(depthMatch[1], 10) : 0;

    // On ignore les calculs en dessous de la profondeur 8 : ils sont trop instables
    if (depth < 8) return;

    // Extraction du score CP ou Mate
    const cpMatch = msg.match(/score cp (-?\d+)/);
    const mateMatch = msg.match(/score mate (-?\d+)/);
    
    let cp = 0;
    let isMate = false;
    let mateIn = null;

    if (cpMatch) {
      cp = parseInt(cpMatch[1], 10);
    }
    
    if (mateMatch) {
      isMate = true;
      mateIn = parseInt(mateMatch[1], 10);
      cp = mateIn > 0 ? 10000 : -10000;
    }
    
    if (!isWhiteTurnRef.current) {
      cp = -cp;
    }

    // Extraction du meilleur coup
    const pvMatch = msg.match(/pv\s+([a-h][1-8][a-h][1-8][qrbn]?)/);
    const bestMove = pvMatch ? pvMatch[1] : null;

    // Mise à jour de la mémoire du composant
    currentEngineStateRef.current = { scoreCp: cp, isMate, mateIn, bestMove, depth };

    // NOUVEAU : On met à jour l'état React EN CONTINU avec un objet propre,
    // ce qui va permettre à la barre d'évaluation de bouger fluidement !
    setEvaluation(currentEngineStateRef.current);
    
    // (Optionnel) Fallback : Si pour une raison quelconque le "bestmove" n'est pas capté,
    // on coupe l'analyse quand on atteint une excellente profondeur de 20.
    if (depth >= 20 && onCompleteRef.current) {
      onCompleteRef.current(currentEngineStateRef.current);
      onCompleteRef.current = null;
    }
  }
};

    sf.postMessage("uci");
    sf.postMessage("isready");

    return () => sf.terminate();
  }, []);

 const evaluatePosition = useCallback((fen, onComplete = null) => {
    // Si Stockfish n'est pas encore initialisé, on annule
    if (!stockfishRef.current) return;

    // 1. On coupe l'écoute pour ignorer les vieux résultats du coup précédent
    onCompleteRef.current = null;
    
    // 2. On ordonne au moteur de s'arrêter immédiatement
    stockfishRef.current.postMessage("stop");

    // 3. On attend 50ms pour laisser le temps au Worker de cracher son dernier message
    setTimeout(() => {
      // Sécurité : au cas où le composant a été démonté pendant les 50ms
      if (!stockfishRef.current) return;

      // On mémorise à qui c'est le tour
      isWhiteTurnRef.current = fen.includes(" w ");
      
      // On vide l'évaluation pour que la barre reparte proprement
      setEvaluation(null);

      // On branche le nouveau callback de fin de calcul
      onCompleteRef.current = onComplete;

      // On lance enfin la nouvelle analyse
      stockfishRef.current.postMessage("position fen " + fen);
      stockfishRef.current.postMessage("go depth 20");
    }, 50);
  }, []); // [] garantit que la fonction n'est créée qu'une seule fois

  return { 
    evaluation, 
    evaluatePosition, 
    currentEngineState: currentEngineStateRef 
  };
} // Fin de ton hook useStockfish
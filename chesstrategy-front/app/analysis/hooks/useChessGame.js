import { useState, useRef, useCallback, useEffect } from "react";
import { Chess } from "chess.js";
import { useStockfish } from "./useStockfish";
import { analyzePosition } from "@/app/services/api";
import { classifyMove } from "@/app/analysis/utils/chessMoveAnalysis";

export function useChessGame() {
  const [game, setGame] = useState(() => new Chess());
  const [coachMessage, setCoachMessage] = useState("Bienvenue ! Joue ton premier coup.");
  const [moveHistory, setMoveHistory] = useState([]);
  
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [arrows, setArrows] = useState([]); 
  const [squareStyles, setSquareStyles] = useState({}); 
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const lastScoreWhiteViewRef = useRef(0);
  const { evaluation, evaluatePosition, currentEngineState } = useStockfish();

  useEffect(() => {
    const savedFen = sessionStorage.getItem("chesscoach_start_fen");
      
    if (savedFen) {
      const newGame = new Chess(savedFen);
      setGame(newGame);
      evaluatePosition(savedFen);
      sessionStorage.removeItem("chesscoach_start_fen");
    } else {
      evaluatePosition(game.fen());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
    
  const goToMove = useCallback((index) => {
    setCurrentMoveIndex(index);
    const fenToLoad = index === -1 ? "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" : moveHistory[index].fen;
    setGame(new Chess(fenToLoad));
    setArrows([]);
    setSquareStyles({});
  }, [moveHistory]);

  const makeMove = useCallback(async (moveInput) => {
    const isWhiteMove = game.turn() === "w";
    const scoreBeforeWhite = lastScoreWhiteViewRef.current;
    const engineBestMove = currentEngineState.current?.bestMove || null;

    const gameCopy = new Chess(game.fen());
    let result = null;

    try {
      result = gameCopy.move(moveInput);
    } catch {
      return null;
    }

    if (!result) return null;

    let activeHistory = moveHistory;
    if (currentMoveIndex < moveHistory.length - 1) {
      activeHistory = moveHistory.slice(0, currentMoveIndex + 1);
    }

    setGame(gameCopy);
    setIsAnalyzing(true);
    setArrows([]); 
    setSquareStyles({});
    setCoachMessage("Stockfish analyse la position..."); // Feedback UX optionnel
    
    const newFen = gameCopy.fen();
    const playedUci = `${result.from}${result.to}${result.promotion || ""}`;
    const playedSan = result.san;

    // 1. MISE À JOUR IMMÉDIATE DE L'INTERFACE
    const newHistoryItem = {
      san: playedSan,
      uci: playedUci,
      fen: newFen,
      evaluation: null, 
    };
    
    setMoveHistory([...activeHistory, newHistoryItem]);
    setCurrentMoveIndex(activeHistory.length);

    // 2. ÉVALUATION STOCKFISH (On le lance en premier pour avoir eval_after)
    evaluatePosition(newFen, async (engineResult) => {
      const rawScoreAfter = engineResult.scoreCp;
      
      const badge = classifyMove({
        playedUci,
        engineBestMove,
        scoreBeforeWhite,
        scoreAfterEngine: rawScoreAfter,
        isWhiteMove,
        isBookMove: false, // Sera mis à jour par l'API si besoin
      });

      lastScoreWhiteViewRef.current = rawScoreAfter;

      // On greffe immédiatement le badge calculé par Stockfish
      setMoveHistory((prev) => 
        prev.map(item => item.fen === newFen ? { ...item, evaluation: badge } : item)
      );
      
      setCoachMessage("Génération du conseil stratégique...");

      // 3. REQUÊTE BACKEND (Structure & LLM)
      try {
        // Formatage des centipions en valeur décimale (+0.29) pour le prompt
        const formatEval = (cp) => (cp > 0 ? `+${(cp / 100).toFixed(2)}` : (cp / 100).toFixed(2));
        
        const payload = {
          fen: newFen,
          played_move: playedSan,
          eval_before: formatEval(scoreBeforeWhite),
          eval_after: formatEval(rawScoreAfter),
          eval_delta: formatEval(rawScoreAfter - scoreBeforeWhite),
          // Si tu ajoutes MultiPV plus tard, tu passeras le tableau complet ici
          candidates_data: engineBestMove ? [{ rank: 1, move: engineBestMove, eval: formatEval(rawScoreAfter) }] : []
        };

        const backendData = await analyzePosition(payload);
        
        // Distribution des données JSON dans les états visuels de React
        if (backendData?.coach_message) setCoachMessage(backendData.coach_message);
        if (backendData?.visuals?.arrows) setArrows(backendData.visuals.arrows);
        if (backendData?.visuals?.squares) setSquareStyles(backendData.visuals.squares);
        
        // Optionnel : Mise à jour du badge si c'est un coup d'ouverture théorique
        if (backendData?.status === "theory") {
          setMoveHistory((prev) => 
            prev.map(item => item.fen === newFen ? { ...item, evaluation: "Théorie" } : item)
          );
        }

      } catch (err) {
        console.error("Erreur API ouverture / LLM :", err);
        setCoachMessage("Impossible de récupérer l'analyse du coach.");
      }

      setIsAnalyzing(false);
    });

    return result;
  }, [game, evaluatePosition, currentEngineState, currentMoveIndex, moveHistory]);

  const resetGame = useCallback(() => {
    const newGame = new Chess();
    setGame(newGame);
    setMoveHistory([]);
    setCurrentMoveIndex(-1);
    setArrows([]);
    setSquareStyles({});
    lastScoreWhiteViewRef.current = 0;
    setCoachMessage("Nouvelle partie. À toi de jouer !");
    evaluatePosition(newGame.fen());
  }, [evaluatePosition]);

  return {
    game,
    fen: game.fen(),
    moveHistory,
    currentMoveIndex,
    coachMessage,
    evaluation,     // On ne renvoie plus que l'état live
    isAnalyzing,
    arrows,
    setArrows,
    squareStyles,
    setSquareStyles,
    makeMove,
    resetGame,
    goToMove,
  };
}
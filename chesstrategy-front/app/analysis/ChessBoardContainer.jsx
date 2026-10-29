"use client";

import { Chessboard } from "react-chessboard";
import { useChessGame } from "./hooks/useChessGame";
import EvalBar from "./partials/EvalBar"
import SidebarTabs from "./partials/SidebarTabs";

export default function ChessBoardContainer() {
  const {
    fen,
    moveHistory,
    currentMoveIndex,
    coachMessage,
    evaluation,
    isAnalyzing,
    arrows,        
    squareStyles,  
    makeMove,
    resetGame,
    goToMove,      
    setSquareStyles,
    setArrows,
  } = useChessGame();
  const isWhiteTurn = fen.includes(" w ");
  const rawCp = evaluation?.scoreCp ?? 0;
  const isMate = evaluation?.isMate ?? false;
  const rawMateIn = evaluation?.mateIn ?? null;

  const liveWhiteCp = isWhiteTurn ? rawCp : -rawCp;
  const liveMateIn = isWhiteTurn ? rawMateIn : (rawMateIn ? -rawMateIn : null);

  function onDrop(sourceSquare, targetSquare) {
    const move = makeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });
    return move !== null;
  }

function onSquareRightClick(square) {
    setSquareStyles((prev) => {
      const newStyles = { ...prev };
      // Si la case est déjà coloriée, on l'efface (effet toggle)
      if (newStyles[square]) {
        delete newStyles[square];
      } else {
        // Sinon, on applique un rouge transparent (style classique)
        newStyles[square] = { backgroundColor: "rgba(235, 97, 80, 0.5)" };
      }
      return newStyles;
    });
  }

  // 2. Gère le clic gauche dans le vide (Nettoyage)
function onSquareClick() {
    // Comme sur chess.com, un clic gauche normal efface tes dessins
    setSquareStyles({});
    setArrows([]);
  }

  return (
  <div className="flex flex-col items-center gap-6 p-4">
    <div className="flex flex-col lg:flex-row gap-8 items-start justify-center w-full max-w-5xl">
      <div className="flex flex-col gap-3 items-center">
        <div className="flex items-center gap-3">
          <EvalBar
            rawCp={liveWhiteCp}
            isMate={isMate}
            mateIn={liveMateIn}
          />
          <div className="w-[420px] h-[420px] bg-slate-800 p-2 rounded-xl shadow-lg border border-slate-700">
            <Chessboard 
              position={fen} 
              onPieceDrop={onDrop} 
              customArrows={arrows}             
              customSquareStyles={squareStyles}  
              onSquareRightClick={onSquareRightClick}
              onSquareClick={onSquareClick}
            />
          </div>
        </div>

        <button
          onClick={resetGame}
          className="px-4 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-md transition-colors"
        >
          Réinitialiser la partie
        </button>
      </div>

      <div className="w-full max-w-md">
        <SidebarTabs
          coachMessage={coachMessage}
          history={moveHistory}
          evaluation={evaluation}
          isAnalyzing={isAnalyzing}
          currentMoveIndex={currentMoveIndex} 
          goToMove={goToMove}                 
        />
      </div>
    </div>
  </div>
);
}
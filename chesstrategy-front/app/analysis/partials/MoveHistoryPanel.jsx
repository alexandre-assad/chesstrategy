export default function MoveHistoryPanel({ history, currentMoveIndex, goToMove }) {
  const pairedMoves = [];
  for (let i = 0; i < history.length; i += 2) {
    pairedMoves.push({
      turnNumber: Math.floor(i / 2) + 1,
      white: { ...history[i], index: i },
      black: history[i + 1] ? { ...history[i + 1], index: i + 1 } : null,
    });
  }

  return (
    <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 flex flex-col h-56">
      <h2 className="text-sm font-semibold text-cyan-400 mb-2">📜 Historique & Évaluation</h2>
      <div className="overflow-y-auto flex-1 font-mono text-xs pr-2 space-y-1.5">
        {pairedMoves.length === 0 ? (
          <p className="text-slate-500 italic">Aucun coup joué pour l'instant.</p>
        ) : (
          pairedMoves.map((row) => (
            <div key={row.turnNumber} className="flex items-center justify-between border-b border-slate-700/50 py-1">
              <span className="text-slate-500 w-6">{row.turnNumber}.</span>
              
              {/* Coup des Blancs */}
              <div 
                className={`flex items-center gap-2 w-36 px-1 rounded cursor-pointer hover:bg-slate-700/50 transition-colors ${currentMoveIndex === row.white.index ? 'bg-slate-700' : ''}`}
                onClick={() => goToMove(row.white.index)}
              >
                <span className="text-slate-200 font-bold">{row.white.san}</span>
                {row.white.evaluation && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border inline-flex items-center gap-1 ${row.white.evaluation.color}`}>
                        <span>{row.white.evaluation.icon}</span>
                        <span>{row.white.evaluation.label}</span>
                    </span>
                )}
              </div>

              {/* Coup des Noirs */}
              <div className="flex items-center gap-2 w-36">
                {row.black ? (
                  <div 
                    className={`flex items-center gap-2 w-full px-1 rounded cursor-pointer hover:bg-slate-700/50 transition-colors ${currentMoveIndex === row.black.index ? 'bg-slate-700' : ''}`}
                    onClick={() => goToMove(row.black.index)}
                  >
                    <span className="text-slate-200 font-bold">{row.black.san}</span>
                    {row.black.evaluation && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${row.black.evaluation.color}`}>
                        <span>{row.black.evaluation.icon}</span>
                        <span>{row.black.evaluation.label}</span>
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-slate-600 px-1">-</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
export default function EnginePanel({ evaluation }) {
  if (!evaluation || typeof evaluation === 'string') {
    return (
      <div className="p-4 text-sm text-slate-500 italic">
        En attente du moteur...
      </div>
    );
  }

  const { scoreCp, isMate, mateIn, bestMove, depth } = evaluation;
  const displayScore = isMate ? `M${Math.abs(mateIn)}` : (scoreCp / 100).toFixed(2);
  const isWhiteAdvantage = scoreCp >= 0 || (isMate && mateIn > 0);

  return (
    <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-slate-400 text-xs uppercase tracking-wider">Évaluation</span>
        <span className={`font-bold text-lg ${isWhiteAdvantage ? "text-slate-200" : "text-slate-400"}`}>
          {scoreCp > 0 && !isMate ? "+" : ""}{displayScore}
        </span>
      </div>
      
      <div className="flex items-center justify-between border-t border-slate-700/50 pt-2">
        <span className="text-slate-400 text-xs uppercase tracking-wider">Meilleur coup</span>
        <span className="font-mono text-cyan-400 font-semibold">{bestMove || "-"}</span>
      </div>

      <div className="flex items-center justify-between border-t border-slate-700/50 pt-2">
        <span className="text-slate-400 text-xs uppercase tracking-wider">Profondeur</span>
        <span className="text-slate-300">{depth || 0}</span>
      </div>
    </div>
  );
}
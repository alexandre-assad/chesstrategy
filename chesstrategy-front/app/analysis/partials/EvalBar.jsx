export default function EvalBar({ rawCp, isMate, mateIn }) {
  // 1. Calcul du pourcentage de remplissage (Formule inspirée de Lichess)
  // Convertit l'avantage en centipions en probabilité de gain (de 0% à 100%)
  const calculateWinPercentage = (cp) => {
    // Si c'est un mat, la barre est à 100% ou 0%
    if (isMate) return mateIn > 0 ? 100 : 0;
    
    // Formule sigmoïde : adoucit les extrêmes et centre autour de l'égalité
    const winProb = 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cp)) - 1);
    return Math.max(0, Math.min(100, winProb));
  };

  const whitePercentage = calculateWinPercentage(rawCp);
  
  // 2. Formatage du texte affiché (+1.2 ou M3)
  const formatScore = () => {
    if (isMate) return `M${Math.abs(mateIn)}`;
    const score = (rawCp / 100).toFixed(1);
    return rawCp > 0 ? `+${score}` : score;
  };

  const isWhiteAdvantage = rawCp >= 0;

  return (
    <div className="relative w-8 h-[420px] bg-slate-900 rounded-md overflow-hidden border border-slate-700 flex flex-col justify-end">
      {/* La barre blanche dynamique */}
      <div 
        className="w-full bg-slate-200 transition-all duration-500 ease-out"
        style={{ height: `${whitePercentage}%` }}
      />
      
      {/* Le texte du score, positionné en haut ou en bas selon l'avantage */}
      <div 
        className={`absolute w-full text-center text-[11px] font-bold z-10 transition-all ${
          isWhiteAdvantage 
            ? "bottom-2 text-slate-800" // Écrit en noir sur la barre blanche
            : "top-2 text-slate-300"    // Écrit en blanc sur le fond noir
        }`}
      >
        {formatScore()}
      </div>
    </div>
  );
}

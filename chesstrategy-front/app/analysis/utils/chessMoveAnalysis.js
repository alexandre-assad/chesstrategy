
function cpToWinRate(cp) {
  if (cp > 9000) return 1.0;
  if (cp < -9000) return 0.0;
  return 1 / (1 + Math.pow(10, -cp / 400));
}

export function classifyMove({
  playedUci,
  engineBestMove,
  scoreBeforeWhite,
  scoreAfterEngine,
  isWhiteMove,
  isBookMove,
}) {
  // 1. Priorité absolue : Coup théorique
  if (isBookMove) {
    return {
      label: "Théorie",
      shortLabel: "Théorie",
      color: "text-amber-300 bg-amber-950/50 border-amber-700/60",
      icon: "📖",
    };
  }

  // 2. Meilleur coup
  if (engineBestMove && playedUci === engineBestMove) {
    return {
      label: "Meilleur coup",
      shortLabel: "Meilleur",
      color: "text-emerald-400 bg-emerald-950/40 border-emerald-800/50",
      icon: "★",
    };
  }

  // 3. Normalisation & Win Rate Drop
  const scoreAfterWhite = isWhiteMove ? -scoreAfterEngine : scoreAfterEngine;
  const wrBefore = cpToWinRate(scoreBeforeWhite);
  const wrAfter = cpToWinRate(scoreAfterWhite);
  const winRateDrop = isWhiteMove ? wrBefore - wrAfter : wrAfter - wrBefore;

  if (winRateDrop <= 0.02) {
    return { label: "Excellent", shortLabel: "Excellent", color: "text-green-400 bg-green-950/40 border-green-800/50", icon: "🖒" };
  }
  if (winRateDrop <= 0.06) {
    return { label: "Bon", shortLabel: "Bon", color: "text-blue-400 bg-blue-950/40 border-blue-800/50", icon: "✓" };
  }
  if (winRateDrop <= 0.12) {
    return { label: "Imprécision", shortLabel: "Imprécision", color: "text-yellow-400 bg-yellow-950/40 border-yellow-800/50", icon: "?!" };
  }
  if (winRateDrop <= 0.22) {
    return { label: "Erreur", shortLabel: "Erreur", color: "text-orange-400 bg-orange-950/40 border-orange-800/50", icon: "?" };
  }
  return { label: "Gaffe", shortLabel: "Gaffe", color: "text-red-400 bg-red-950/40 border-red-800/50", icon: "??" };
}
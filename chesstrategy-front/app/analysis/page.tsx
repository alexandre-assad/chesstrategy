import ChessBoardContainer from "./ChessBoardContainer";

export const metadata = {
  title: "Analyse - chesscoach",
  description: "Analyse stratégique de tes parties d'échecs avec l'IA.",
};

export default function AnalysisPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      {/* Header optionnel pour la page d'analyse */}
      <header className="w-full border-b border-slate-800 bg-slate-900/50 p-4 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <a href="/" className="text-xl font-bold text-cyan-400 hover:text-cyan-300 transition">
            chesscoach
          </a>
          <div className="text-sm text-slate-400">Mode Analyse</div>
        </div>
      </header>

      {/* Le conteneur principal de l'application qu'on a codé précédemment */}
      <main className="py-8">
        <ChessBoardContainer />
      </main>
    </div>
  );
}
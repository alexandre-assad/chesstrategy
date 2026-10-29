"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

export default function HomePage() {
  const router = useRouter();
  // On initialise une partie vierge (position de départ par défaut)
  const [game] = useState(new Chess());

function onDrop(sourceSquare: string, targetSquare: string) {
    const gameCopy = new Chess(game.fen());
    
    try {
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });

      if (move) {
        // Au lieu de polluer l'URL, on stocke le FEN en mémoire de session
        sessionStorage.setItem("chesscoach_start_fen", gameCopy.fen());
        
        // Redirection avec une URL parfaitement propre
        router.push(`/analysis`);
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center">
      {/* HEADER / NAV (Optionnel) */}
      <header className="w-full max-w-5xl p-6 flex justify-between items-center">
        <div className="text-2xl font-bold text-cyan-400 tracking-tight">chesscoach</div>
        <button 
          onClick={() => router.push('/analysis')}
          className="text-sm px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition"
        >
          Accéder à l'outil
        </button>
      </header>

      {/* HERO SECTION */}
      <main className="flex-1 flex flex-col items-center justify-center w-full px-4 mt-8 md:mt-16 gap-12 max-w-5xl">
        
        <div className="text-center space-y-4 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
            Joue un coup. <br />
            <span className="text-cyan-400">L'IA t'explique la stratégie.</span>
          </h1>
          <p className="text-lg text-slate-400">
            Fini les +0.45 incompréhensibles. chesscoach traduit l'évaluation de Stockfish 
            en véritables plans de jeu : structures de pions, cases faibles et intentions géométriques.
          </p>
        </div>

        {/* L'ÉCHIQUIER INTERACTIF (Le vrai Call-to-Action) */}
        <div className="w-[320px] md:w-[400px] bg-slate-800 p-3 rounded-2xl shadow-2xl border border-slate-700 relative group cursor-grab active:cursor-grabbing">
          {/* Petit overlay subtil pour inciter au clic */}
          <div className="absolute -top-4 -right-4 bg-cyan-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10 animate-bounce">
            À toi de jouer !
          </div>
          
          <Chessboard 
            position={game.fen()} 
            onPieceDrop={onDrop}
            customDarkSquareStyle={{ backgroundColor: "#475569" }}
            customLightSquareStyle={{ backgroundColor: "#cbd5e1" }}
          />
        </div>

        {/* FEATURES / SOCIAL PROOF */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full border-t border-slate-800 pt-12 pb-24">
          <div className="flex flex-col items-center text-center p-4">
            <div className="text-cyan-400 text-3xl mb-3">🧠</div>
            <h3 className="font-bold text-white mb-2">Compréhension Structurelle</h3>
            <p className="text-sm text-slate-400">Détection automatique des archétypes (Carlsbad, Maroczy...) et des trous structurels.</p>
          </div>
          <div className="flex flex-col items-center text-center p-4">
            <div className="text-cyan-400 text-3xl mb-3">🎯</div>
            <h3 className="font-bold text-white mb-2">Intentions du Moteur</h3>
            <p className="text-sm text-slate-400">L'IA t'explique le but derrière chaque suggestion : gain d'espace, liquidation, attaque de minorité.</p>
          </div>
          <div className="flex flex-col items-center text-center p-4">
            <div className="text-cyan-400 text-3xl mb-3">⏱️</div>
            <h3 className="font-bold text-white mb-2">Navigation Temporelle</h3>
            <p className="text-sm text-slate-400">Explore les variantes et navigue dans l'historique sans perdre le fil de ta pensée.</p>
          </div>
        </div>

      </main>
    </div>
  );
}
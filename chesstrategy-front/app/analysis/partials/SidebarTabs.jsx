import { useState } from "react";
import CoachPanel from "./CoachPanel";
import MoveHistoryPanel from "./MoveHistoryPanel";
import EnginePanel from "./EnginePanel";

export default function SidebarTabs({ coachMessage, history, evaluation, isAnalyzing, currentMoveIndex, goToMove }) {
  const [activeTab, setActiveTab] = useState("coach");

  const tabs = [
    { id: "coach", label: "Coach IA" },
    { id: "history", label: `Historique (${history.length})` },
    { id: "engine", label: "Moteur" },
  ];

  return (
    <div className="flex flex-col w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Barre d'onglets */}
      <div className="flex border-b border-slate-800 bg-slate-950/60">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-xs font-semibold tracking-wide transition-colors ${
              activeTab === tab.id
                ? "text-cyan-400 border-b-2 border-cyan-400 bg-slate-800/40"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/20"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu de l'onglet actif */}
      <div className="p-4 flex-1">
        {activeTab === "coach" && (
          <div className="space-y-3">
            <CoachPanel 
              message={typeof coachMessage === 'string' ? coachMessage : coachMessage?.coach_message} 
            />
            {isAnalyzing && (
              <span className="text-[11px] text-slate-500 italic animate-pulse">
                Calcul en cours...
              </span>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <MoveHistoryPanel 
            history={history} 
            currentMoveIndex={currentMoveIndex} // <-- RELAIS
            goToMove={goToMove}                 // <-- RELAIS
          />
        )}

        {activeTab === "engine" && (
          <EnginePanel evaluation={evaluation} />
        )}
      </div>
    </div>
  );
}
export default function CoachPanel({ message }) {
  return (
    <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
      <h2 className="text-sm font-semibold text-cyan-400 mb-2">💬 Analyse du Coach Python</h2>
      <p className="text-sm text-slate-200">{message}</p>
    </div>
  );
}
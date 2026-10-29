// Dans services/api.js
export async function analyzePosition(payload) {
  try {
    const response = await fetch("http://localhost:8000/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload), // On envoie tout l'objet d'un coup
    });

    if (!response.ok) throw new Error("Erreur réseau");
    return await response.json();
  } catch (error) {
    console.error("Erreur back-end Python :", error);
    return { coach_message: "Impossible de joindre le coach Python." };
  }
}
const { SYSTEM_PROMPT } = require("../config/persona");

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const MAX_HISTORY = parseInt(process.env.MAX_HISTORY || "12", 10);

if (!GROQ_API_KEY) {
  console.error(
    "[NOVɅ AI] ERREUR: GROQ_API_KEY est manquante. Ajoute-la dans tes variables d'environnement (.env en local, ou Variables sur Railway)."
  );
}

// Historique de conversation en mémoire, par salon Discord (channelId -> messages[])
const conversationHistory = new Map();

function getHistory(channelId) {
  if (!conversationHistory.has(channelId)) {
    conversationHistory.set(channelId, []);
  }
  return conversationHistory.get(channelId);
}

function pushToHistory(channelId, role, content) {
  const history = getHistory(channelId);
  history.push({ role, content });
  // On garde seulement les N derniers messages pour limiter le coût/contexte
  while (history.length > MAX_HISTORY) {
    history.shift();
  }
}

function clearHistory(channelId) {
  conversationHistory.set(channelId, []);
}

/**
 * Envoie un message à Groq (modèle Llama) en tenant compte de l'historique
 * du salon et du prompt système NOVɅ AI.
 */
async function askNova(channelId, userName, userMessage) {
  const history = getHistory(channelId);
  const userTurn = `${userName} dit : ${userMessage}`;

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history,
    { role: "user", content: userTurn },
  ];

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      max_tokens: 800,
      temperature: 0.9,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Groq API error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  const responseText = data.choices?.[0]?.message?.content?.trim();

  if (!responseText) {
    throw new Error("Réponse vide reçue de l'API Groq.");
  }

  pushToHistory(channelId, "user", userTurn);
  pushToHistory(channelId, "assistant", responseText);

  return responseText;
}

module.exports = { askNova, clearHistory };

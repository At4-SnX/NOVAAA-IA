# NOVɅ AI — Bot Discord pour Emergency Hamburg

Bot Discord propulsé par l'API **Groq** (gratuite, modèles Llama), créé pour le serveur RP
**Emergency Hamburg** (par SnX et Eliott).

## 🔑 Pourquoi Groq et pas Gemini ?

L'API Gemini a désactivé son tier gratuit pour l'UE/EEE/UK/CH, ce qui bloque
toute requête sans facturation activée. Groq propose un vrai tier gratuit
généreux, accessible sans carte bancaire, avec des modèles Llama 3.3 très
rapides — largement suffisant pour un bot Discord RP.

## ⚠️ Sécurité — à lire en premier

La clé API ne doit **jamais** être écrite en dur dans le code. Elle se
configure uniquement via une variable d'environnement (`.env` en local,
"Variables" sur Railway).

## 📁 Structure du projet

```
nova-ai-bot/
├── index.js                # Point d'entrée du bot
├── deploy-commands.js       # Script pour enregistrer les commandes slash
├── package.json
├── Procfile                 # Pour Railway
├── .env.example              # Modèle de variables d'environnement
├── config/
│   └── persona.js           # <-- LE PROMPT / PERSONNALITÉ DE NOVɅ AI (modifiable ici)
├── commands/
│   ├── demande.js           # /demande <message>
│   └── reset.js              # /reset
└── utils/
    └── llm.js                # Logique d'appel à l'API Groq + mémoire de conversation
```

## 🛠️ Étape 1 — Créer la clé API Groq

1. Va sur https://console.groq.com/keys (connexion gratuite, sans carte bancaire)
2. "Create API Key" → copie la clé (➡️ `GROQ_API_KEY`)

## 🛠️ Étape 2 — Créer l'application Discord

1. Va sur https://discord.com/developers/applications
2. "New Application" → nomme-la **NOVɅ AI**
3. Onglet **Bot** → "Reset Token" → copie le token (➡️ `DISCORD_TOKEN`)
4. Active dans "Privileged Gateway Intents" :
   - **Message Content Intent** (obligatoire pour que le bot lise les messages quand on le mentionne)
5. Onglet **OAuth2 > URL Generator** :
   - Scopes : `bot`, `applications.commands`
   - Permissions : `Send Messages`, `Read Message History`, `Use Slash Commands`
   - Copie l'URL générée et ouvre-la pour inviter le bot sur ton serveur Emergency Hamburg
6. Onglet **General Information** → copie l'**Application ID** (➡️ `CLIENT_ID`)

## 🛠️ Étape 3 — Configurer les variables d'environnement

Copie `.env.example` en `.env` (en local) et remplis :

```
DISCORD_TOKEN=...
GROQ_API_KEY=...
CLIENT_ID=...
GUILD_ID=...     (optionnel, pour tester sur un seul serveur)
```

## 🛠️ Étape 4 — Installer et lancer en local (optionnel, pour tester)

```bash
npm install
node deploy-commands.js   # enregistre les commandes /demande et /reset
node index.js              # démarre le bot
```

## 🚀 Étape 5 — Déployer sur Railway

1. Crée un repo GitHub avec ce projet (le `.gitignore` empêche d'y inclure `.env`)
2. Sur [Railway](https://railway.app) : "New Project" → "Deploy from GitHub repo"
3. Sélectionne le repo
4. Dans l'onglet **Variables** du service, ajoute :
   - `DISCORD_TOKEN`
   - `GROQ_API_KEY`
   - `CLIENT_ID`
   - `GUILD_ID` (optionnel)
   - `GROQ_MODEL` (optionnel, par défaut `llama-3.3-70b-versatile`)
   - `MAX_HISTORY` (optionnel, par défaut `12`)
5. Railway va automatiquement lancer `npm install` puis utiliser le `Procfile`
   pour exécuter `node index.js`
6. **Important** : la première fois, exécute aussi `node deploy-commands.js`
   une fois (en local avec les mêmes variables, ou via un "Run Command"
   ponctuel sur Railway) pour enregistrer les commandes slash sur Discord.

## ✏️ Modifier la personnalité de NOVɅ AI

Tout se passe dans `config/persona.js`, dans la constante `SYSTEM_PROMPT`.
Tu peux changer :
- le ton (plus sérieux, plus drôle, plus "robotique", etc.)
- les règles de comportement
- le contexte RP (ajouter des infos sur le serveur, les grades, etc.)
- la signature, les emojis utilisés, la langue par défaut

Aucune autre partie du code n'a besoin d'être modifiée pour ça.

## 💬 Utilisation

- `/demande message:<ta question>` → NOVɅ AI répond directement
- Mentionner le bot dans un message (`@NOVɅ AI fais ceci...`) → réponse automatique
- `/reset` → vide la mémoire de conversation du salon en cours

La mémoire de conversation est **par salon** et limitée aux derniers échanges
(`MAX_HISTORY`) pour garder des réponses cohérentes sans coût excessif.

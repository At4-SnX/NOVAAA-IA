require("dotenv").config();
const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");

const commands = [];
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`[NOVɅ AI] Enregistrement de ${commands.length} commande(s)...`);

    if (process.env.GUILD_ID) {
      // Déploiement instantané sur un seul serveur (pratique en dev)
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands }
      );
      console.log("[NOVɅ AI] Commandes enregistrées sur le serveur (GUILD_ID).");
    } else {
      // Déploiement global (peut prendre jusqu'à 1h pour se propager)
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
        body: commands,
      });
      console.log("[NOVɅ AI] Commandes enregistrées globalement.");
    }
  } catch (error) {
    console.error("[NOVɅ AI] Erreur lors du déploiement des commandes:", error);
  }
})();

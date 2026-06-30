require("dotenv").config();
const fs = require("fs");
const path = require("path");
const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
} = require("discord.js");
const { askNova } = require("./utils/llm");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

// Chargement dynamique des commandes slash
client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
}

client.once("clientReady", () => {
  console.log(`[NOVɅ AI] Connectée en tant que ${client.user.tag} ✅`);
  client.user.setActivity("🔗〃NOVɅ RP | EHRP", { type: 3 }); // 3 = Watching
});

// Gestion des commandes slash
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`[NOVɅ AI] Erreur sur la commande ${interaction.commandName}:`, error);
    const errorMessage = {
      content: "⚠️ Une erreur est survenue lors de l'exécution de cette commande.",
      ephemeral: true,
    };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMessage);
    } else {
      await interaction.reply(errorMessage);
    }
  }
});

// Réponse automatique quand on mentionne NOVɅ AI directement dans un message
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.mentions.has(client.user)) return;

  const cleanContent = message.content
    .replace(new RegExp(`<@!?${client.user.id}>`, "g"), "")
    .trim();

  if (!cleanContent) return;

  await message.channel.sendTyping();

  try {
    const reply = await askNova(
      message.channelId,
      message.member?.displayName || message.author.username,
      cleanContent
    );

    const chunks = reply.match(/[\s\S]{1,1900}/g) || ["(réponse vide)"];
    for (const chunk of chunks) {
      await message.reply(chunk);
    }
  } catch (error) {
    console.error("[NOVɅ AI] Erreur Groq (mention):", error);
    await message.reply(
      "⚠️ NOVɅ AI rencontre une difficulté technique pour répondre. Réessaie dans un instant."
    );
  }
});

client.login(process.env.DISCORD_TOKEN);

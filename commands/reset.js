const { SlashCommandBuilder } = require("discord.js");
const { clearHistory } = require("../utils/llm");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reset")
    .setDescription("Réinitialise la mémoire de conversation de NOVɅ AI dans ce salon"),

  async execute(interaction) {
    clearHistory(interaction.channelId);
    await interaction.reply({
      content: "🧭 Mémoire réinitialisée. NOVɅ AI repart sur une conversation neuve dans ce salon.",
      ephemeral: true,
    });
  },
};

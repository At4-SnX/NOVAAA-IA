const { SlashCommandBuilder } = require("discord.js");
const { askNova } = require("../utils/llm");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("demande")
    .setDescription("Pose une question à NOVɅ AI")
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("Ta question ou ton message pour NOVɅ AI")
        .setRequired(true)
    ),

  async execute(interaction) {
    const userMessage = interaction.options.getString("message");
    await interaction.deferReply();

    try {
      const reply = await askNova(
        interaction.channelId,
        interaction.user.displayName || interaction.user.username,
        userMessage
      );

      // Discord limite les messages à 2000 caractères : on découpe si besoin
      const chunks = reply.match(/[\s\S]{1,1900}/g) || ["(réponse vide)"];
      await interaction.editReply(chunks[0]);
      for (let i = 1; i < chunks.length; i++) {
        await interaction.followUp(chunks[i]);
      }
    } catch (error) {
      console.error("[NOVɅ AI] Erreur Groq:", error);
      await interaction.editReply(
        "⚠️ NOVɅ AI rencontre une difficulté technique pour répondre. Réessaie dans un instant."
      );
    }
  },
};

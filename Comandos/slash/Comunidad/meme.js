const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const hispamemes = require("hispamemes");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('meme')
        .setDMPermission(false)
        .setDescription('Genera un meme aleatorio'),
    async execute(interaction) {

      await interaction.deferReply();

        const meme = hispamemes.meme();

        if (!meme || meme.trim() === '') {
          throw new Error('URL de meme vacía');
      }
        const embed = new EmbedBuilder()
           .setTitle("🎭 ¡Meme del Día! 🎭")
           .setColor(0xCB1BFF)  // Color hexadecimal especificado
           .setImage(meme)
           .setFooter({ text: `Meme solicitado por ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
           .setTimestamp();

           await interaction.editReply({ embeds: [embed], ephemeral: true });
    },
};

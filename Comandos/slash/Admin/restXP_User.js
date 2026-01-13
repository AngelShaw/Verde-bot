const { SlashCommandBuilder } = require('@discordjs/builders');
const Level = require('../../../Extras/rank/Level');

module.exports = {
    devOnly: true,
  data: new SlashCommandBuilder()
    .setName('reset')
    .setDMPermission(false)
    .setDescription('Reinicia el nivel y la experiencia de un usuario.')
    .addUserOption(option => option
      .setName('usuario')
      .setDescription('Selecciona el usuario.')
      .setRequired(true)
    ),

  async execute(interaction) {
    const targetUserId = interaction.options.getUser('usuario').id;

    try {
      // Respond to the interaction immediately to prevent timeout
      await interaction.deferReply();

      await Level.findOneAndUpdate(
        { userId: targetUserId, guildId: interaction.guild.id },
        { $set: { level: 0, xp: 0 } }
      );

      await interaction.editReply(`Se ha reiniciado el nivel y la experiencia para <@${targetUserId}>.`);
    } catch (error) {
      console.error('Error al reiniciar nivel y experiencia:', error);

      // Check if the interaction is still valid before replying
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply('Ha ocurrido un error al intentar reiniciar el nivel y la experiencia.');
      } else {
        await interaction.reply('Ha ocurrido un error al intentar reiniciar el nivel y la experiencia.');
      }
    }
  },
};
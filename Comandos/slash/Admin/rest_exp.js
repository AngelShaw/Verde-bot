const { SlashCommandBuilder } = require('@discordjs/builders');
const Level = require('../../../Extras/rank/Level');

module.exports = {
    devOnly: true,
  data: new SlashCommandBuilder()
    .setName('resetallxp')
    .setDMPermission(false)
    .setDescription('Reinicia la experiencia de todos los usuarios y los establece en el nivel 0.'),

  async execute(interaction) {
    try {
      await Level.updateMany(
        { guildId: interaction.guild.id },
        { $set: { xp: 0, level: 0 } }
      );

      await interaction.reply('Se ha reiniciado la experiencia de todos los usuarios y se han establecido en el nivel 0.');
    } catch (error) {
      console.error('Error al reiniciar la experiencia y nivel de todos los usuarios:', error);
      await interaction.reply('Hubo un error al intentar reiniciar la experiencia y nivel de todos los usuarios.');
    }
  },
};

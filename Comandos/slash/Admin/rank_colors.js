const { SlashCommandBuilder } = require('discord.js');
const UserSettings = require('../../../Extras/rank/user'); // Asumimos que tienes un modelo para guardar configuraciones de usuario

module.exports = {
    devOnly: true,
  data: new SlashCommandBuilder()
    .setName('bar-color')
    .setDMPermission(false)
    .setDescription('Seleccionar la barra de color de progreso.')
    .addStringOption(option =>
      option
        .setName('color')
        .setDescription('El color HTML que se pondra (e.g., FF5733).')
        .setRequired(true)
    ),

  execute: async (interaction) => {
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;
    let color = interaction.options.getString('color');

    // Agregar "#" al principio del código de color si no está presente
    if (!color.startsWith('#')) {
      color = `#${color}`;
    }

    // Validar el color
    const isValidColor = /^#[0-9A-F]{6}$/i.test(color);
    if (!isValidColor) {
      interaction.reply('Proporciosne un código de color HTML válido (e.g., FF5733).');
      return;
    }

    // Guardar el color en la base de datos
    await UserSettings.findOneAndUpdate(
      { userId, guildId },
      { $set: { rankBarColor: color } },
      { upsert: true }
    );

    // Eliminar "#" del mensaje de confirmación
    interaction.reply(`El color de tu barra de clasificación se ha configurado en ${color.slice(1)}.`);
  },
};

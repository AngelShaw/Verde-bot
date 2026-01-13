const { SlashCommandBuilder } = require('discord.js');
const { Snake } = require('discord-gamecord');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('snake')
    .setDMPermission(false)
    .setDescription('Inicia el minijuego de Snake.'),
  async execute(interaction) {
    // Iniciar el juego de Snake
    new Snake({
      message: interaction,
      slash_command: true,
      embed: {
        title: 'Snake Minijuego',
        color: '#CB1BFF',
        overTitle: 'Fin del Juego',
      },
      snake: { head: '🟢', body: '🟩', tail: '🟢' },
      emojis: {
        board: '⬛',
        food: '🍎',
        up: '⬆️',
        right: '➡️',
        down: '⬇️',
        left: '⬅️',
      },
    }).startGame();
  },
};

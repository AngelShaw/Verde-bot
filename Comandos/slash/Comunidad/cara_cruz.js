const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('moneda')
    .setDMPermission(false)
    .setDescription('Realiza un lanzamiento de moneda (cara o cruz)'),
  async execute(interaction) {
    const result = Math.random() < 0.5 ? 'cara' : 'cruz';
    const imageUrl = result === 'cara' ? 'https://w7.pngwing.com/pngs/55/581/png-transparent-silver-coin-bullion-silver-coin-american-silver-eagle-coin-face-medal-bullion.png' : 'https://thumbs.dreamstime.com/b/moneda-de-bronce-con-la-cruz-50831675.jpg';

    const embed = {
      title: 'Lanzamiento de moneda',
      description: `Resultado: ${result}`,
      color: 0xCB1BFF,
      image: { url: imageUrl }
    };

    interaction.reply({ embeds: [embed] });
  },
};

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gay')
    .setDescription('Calcula el porcentaje de cuánto gay es un usuario.')
    .setDMPermission(false)
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('Elige un usuario para ver cuánto porcentaje tiene de gay')
        .setRequired(true)
    ),

  async execute(interaction) {
    const usuario = interaction.options.getUser('usuario') || interaction.user;

    const porcentajes = ['5%', '10%', '15%', '20%', '25%', '30%', '35%', '40%', '45%', '50%', '55%', '60%', '65%', '70%', '75%', '80%', '85%', '90%', '95%', '100%'];
    const porcentajeGey = porcentajes[Math.floor(Math.random() * porcentajes.length)];

    const embed = new EmbedBuilder()
      .setColor('#FF69B4') // Un color rosado que es alegre y llamativo
      .setTitle('🌈 ¿Qué tan gay eres? 🌈')
      .setThumbnail('https://i.imgur.com/8QIckgK.gif') // Un GIF o imagen relacionado
      .addFields(
        { name: 'Usuario:', value: `${usuario}`, inline: true },
        { name: 'Porcentaje de Gay:', value: `${porcentajeGey}`, inline: true }
      )
      .setFooter({ text: 'Recuerda que esto es una broma!' });

    await interaction.reply({
      content: `Hey ${usuario}, mira te etiquetaron en algo`,
      embeds: [embed],
      ephemeral: false
    });
  },
};

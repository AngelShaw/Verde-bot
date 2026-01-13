const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dados')
    .setDMPermission(false)
    .setDescription('🎲 Obtén un número aleatorio de los dados'),

  async execute(interaction) {
    const dado1 = (Math.floor(Math.random() * 6)) + 1;
    const dado2 = (Math.floor(Math.random() * 6)) + 1;

    const imagenesDados = {
      1: 'https://i.imgur.com/nU5Oe3a.png',
      2: 'https://i.imgur.com/fuC2NBO.png',
      3: 'https://i.imgur.com/t3lCfSy.png',
      4: 'https://i.imgur.com/r5PDgsz.png',
      5: 'https://i.imgur.com/0apHU8c.png',
      6: 'https://i.imgur.com/7u2mDIs.png',
    };

    const canvas = createCanvas(400, 200); // Ajusta el tamaño del canvas según necesites
    const ctx = canvas.getContext('2d');

    const image1 = await loadImage(imagenesDados[dado1]);
    const image2 = await loadImage(imagenesDados[dado2]);

    // Dibuja las imágenes de los dados en el canvas
    ctx.drawImage(image1, 0, 0, 200, 200); // Dibuja la primera imagen
    ctx.drawImage(image2, 200, 0, 200, 200); // Dibuja la segunda imagen

    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'dados.png' });

    const embed = new EmbedBuilder()
      .setTitle(`🎲 ${interaction.user.displayName} Los dados dicen...`)
      .setDescription(`**El número del primer dado es: ${dado1} 🎲\nEl número del segundo dado es: ${dado2} 🎲**`)
      .setColor(0xCB1BFF)
      .setImage('attachment://dados.png')
      .setFooter({ text: `Pedido por ${interaction.user.tag}` });

    await interaction.reply({ 
      embeds: [embed], 
      files: [attachment] 
    });
  },
};
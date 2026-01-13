const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pepesign')
    .setDescription('Crear cartel texto con pepe.')
    .setDMPermission(false)
    .addStringOption(option => option.setName('text').setDescription('The text for the sign').setRequired(true)),
  async execute(interaction, client) {
    await interaction.deferReply({});

    const canvas = createCanvas(200, 200);
    const ctx = canvas.getContext('2d');
    try {
      const blankSign = await loadImage('./extras/assets/images/frog.png');
      const signText = interaction.options.getString('text').trim();

      const maxLineWidth = 60;
      let lines = [];
      let currentLine = '';
      const words = signText.split(' ');
      for (const word of words) {
        const testLine = currentLine.length === 0 ? word : `${currentLine} ${word}`;
        const testWidth = ctx.measureText(testLine).width;
        if (testWidth > maxLineWidth) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine);

      const lineHeight = 30;
      const totalHeight = lines.length * lineHeight;
      const startY = (canvas.height - totalHeight) / 4;

      ctx.drawImage(blankSign, 0, 0, canvas.width, canvas.height);
      ctx.font = '30px Arial';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      lines.forEach((line, index) => {
        const y = startY + index * lineHeight;
        ctx.fillText(line, canvas.width / 2, y);
      });

      const attachment = new AttachmentBuilder(canvas.toBuffer("image/png"), { name: "pepesign.png" });

      const embed = new EmbedBuilder()
        .setColor('#CB1BFF')
        .setTitle('Pepe Sign')
        .setImage('attachment://pepesign.png') 
        .setTimestamp();

      await interaction.editReply({ embeds: [embed], files: [attachment]});
    } catch (error) {
      console.error('Failed to edit reply:', error);
      await interaction.followUp({ content: 'Failed to create pepe sign.'});
    }
  },
};
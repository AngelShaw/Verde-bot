const { SlashCommandBuilder } = require('discord.js');
const crypto = require('crypto');
const https = require('https');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('md5')
    .setDescription('Calcula el hash MD5 de un archivo subido.')
    .addAttachmentOption(option =>
      option.setName('archivo')
        .setDescription('Archivo del que deseas obtener el MD5.')
        .setRequired(true)
    ),

  async execute(interaction) {
    const archivo = interaction.options.getAttachment('archivo');

    // Verificamos que el archivo esté presente y tenga una URL válida
    if (!archivo || !archivo.url) {
      return await interaction.reply({
        content: '❌ No se recibió un archivo válido.',
        ephemeral: true
      });
    }

    await interaction.deferReply();

    // Descargar y calcular hash MD5
    https.get(archivo.url, res => {
      const hash = crypto.createHash('md5');
      res.on('data', chunk => hash.update(chunk));
      res.on('end', () => {
        const md5 = hash.digest('hex');
        interaction.editReply(`🔐 El hash MD5 del archivo **${archivo.name}** es:\n\`\`\`${md5}\`\`\``);
      });
    }).on('error', err => {
      console.error('❌ Error al descargar el archivo:', err);
      interaction.editReply('❌ Ocurrió un error al procesar el archivo.');
    });
  }
};

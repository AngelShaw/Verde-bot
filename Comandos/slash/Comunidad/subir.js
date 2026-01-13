const { SlashCommandBuilder } = require('discord.js');
const crypto = require('crypto');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('subir')
        .setDMPermission(false)
        .setDescription('Sube un archivo y te diré su peso en bytes y su hash MD5')
        .addAttachmentOption(option =>
            option.setName('archivo')
                .setDescription('El archivo que quieres subir')
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.reply({ content: 'Leyendo el peso y calculando MD5...', ephemeral: true });

        const archivo = interaction.options.getAttachment('archivo');
        const pesoEnBytes = archivo.size;

        try {
            const response = await axios.get(archivo.url, { responseType: 'arraybuffer' });
            const hash = crypto.createHash('md5').update(response.data).digest('hex');

            await interaction.followUp({ content: `El peso de tu archivo es de ${pesoEnBytes} bytes.\nMD5: ${hash}`, ephemeral: true });
        } catch (error) {
            await interaction.followUp({ content: 'Hubo un error al procesar el archivo.', ephemeral: true });
        }
    }
};
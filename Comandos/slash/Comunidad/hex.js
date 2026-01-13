const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hex')
        .setDescription('Convierte un archivo en código hexadecimal y lo proporciona en un archivo .txt.')
        .addAttachmentOption(option =>
            option.setName('archivo')
                .setDescription('Archivo a convertir a hexadecimal')
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false });

        const archivoAdjunto = interaction.options.getAttachment('archivo');

        // Verificar tamaño máximo permitido (25 MB)
        if (archivoAdjunto.size > 25 * 1024 * 1024) {
            return interaction.editReply('❌ El archivo es demasiado grande. El tamaño máximo permitido es 25MB.');
        }

        try {
            // Descargar el archivo
            const response = await fetch(archivoAdjunto.url);
            const buffer = await response.arrayBuffer();
            const hexData = Buffer.from(buffer).toString('hex').match(/.{1,2}/g).join(' '); // Formato hex legible

            // Obtener el nombre del archivo original sin extensión
            const nombreOriginal = path.parse(archivoAdjunto.name).name;
            const nombreArchivo = `${nombreOriginal}_hex.txt`;
            const rutaArchivo = path.join(__dirname, nombreArchivo);
            fs.writeFileSync(rutaArchivo, hexData, 'utf8');

            // Adjuntar el archivo para descarga
            const attachment = new AttachmentBuilder(rutaArchivo, { name: nombreArchivo });

            await interaction.editReply({ content: '✅ Archivo convertido a hexadecimal:', files: [attachment] });

            // Eliminar el archivo después de un tiempo
            setTimeout(() => fs.unlinkSync(rutaArchivo), 60000);
        } catch (error) {
            console.error('Error al procesar el archivo:', error);
            return interaction.editReply('❌ Ocurrió un error al procesar el archivo.');
        }
    }
};

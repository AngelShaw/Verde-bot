const { SlashCommandBuilder } = require('discord.js');
const https = require('https');

function extraerTextoLegible(buffer) {
    const texto = buffer.toString('latin1'); // latin1 preserva bytes 0x00–0xFF
    const matches = texto.match(/[\x20-\x7E]{4,}/g); // secuencias imprimibles de 4+ caracteres
    return matches ? matches.join(' ') : '';
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('decrypt')
        .setDescription('Analiza un archivo .lua o .luac en busca de virus conocidos')
        .addAttachmentOption(option =>
            option.setName('archivo')
                .setDescription('Archivo .lua o .luac para analizar')
                .setRequired(true)),

    async execute(interaction) {
        const archivo = interaction.options.getAttachment('archivo');

        if (!archivo.name.endsWith('.lua') && !archivo.name.endsWith('.luac')) {
            return interaction.reply({
                content: '❌ Solo se aceptan archivos `.lua` o `.luac`.',
                ephemeral: true
            });
        }

        await interaction.deferReply();

        try {
            https.get(archivo.url, res => {
                const data = [];

                res.on('data', chunk => data.push(chunk));

                res.on('end', () => {
                    const buffer = Buffer.concat(data);

                    // Extraer cadenas visibles del binario
                    const textoLegible = extraerTextoLegible(buffer);

                    if (textoLegible.includes('gtaweap4.saa')) {
                        interaction.editReply('🚨 **Archivo infectado**: Se detectó `gtaweap4.saa` dentro del archivo.');
                    } else {
                        interaction.editReply('✅ El archivo no contiene indicios del virus `gtaweap4.saa`.');
                    }
                });

            }).on('error', err => {
                console.error('❌ Error al descargar archivo:', err);
                interaction.editReply('❌ No se pudo descargar o analizar el archivo.');
            });

        } catch (err) {
            console.error('❌ Error general:', err);
            interaction.editReply('❌ Ocurrió un error al analizar el archivo.');
        }
    }
};


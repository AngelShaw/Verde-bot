const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const Canvas = require('@napi-rs/canvas');
const { GlobalFonts , registerFont } = require('@napi-rs/canvas');
const path = require('path');

// Ruta de la fuente y la imagen de fondo
const fontPath = path.resolve(__dirname, '../../../Extras/assets/fonts/Brianne.otf');
GlobalFonts.registerFromPath(fontPath, 'Brianne');
const backgroundPath = path.resolve(__dirname, '../../../Extras/pvz/pvz.jpg');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pvz')
        .setDMPermission(false)
        .setDescription('Escribe un texto en la imagen de PVZ')
        .addStringOption(option =>
            option.setName('texto')
                .setDescription('Texto a escribir en la imagen')
                .setRequired(true)),

    async execute(interaction) {
        const texto = interaction.options.getString('texto');
        
        // Configurar el tamaño de la fuente
        const fontSize = 35;

        // Configurar Canvas
        const canvas = Canvas.createCanvas(500, 300); // Ajusta el tamaño si es necesario
        const ctx = canvas.getContext('2d');
        const background = await Canvas.loadImage(backgroundPath);

        // Dibujar el fondo
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // Configurar el texto
        ctx.font = `${fontSize}px "Brianne"`;
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'left'; // Alineación izquierda

        // Posición inicial para el texto
        const startX = 65;
        const startY = 80;
        const lineHeight = fontSize + 10;

        // Dividir el texto en líneas según el número de caracteres
        const lines = [];
        for (let i = 0; i < texto.length; i += 23) {
            lines.push(texto.slice(i, i + 23));
        }

        // Verificar si el texto es demasiado largo para la imagen
        const textHeight = lines.length * lineHeight;
        if (textHeight > canvas.height - 100) { // Ajusta el margen inferior según sea necesario
            return interaction.reply({ content: 'Lo siento, tu texto es demasiado largo. Por favor, hazlo más corto.', ephemeral: true });
        }

        // Dibujar el texto línea por línea
        let y = startY;
        lines.forEach(line => {
            ctx.fillText(line, startX, y);
            y += lineHeight;
        });

        // Crear el archivo adjunto de la imagen
        const attachment = new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'pvz-texto.png' });

        // Enviar la imagen generada
        await interaction.reply({ files: [attachment] });
    }
};

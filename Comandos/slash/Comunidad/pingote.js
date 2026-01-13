const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const Canvas = require('@napi-rs/canvas');
const { GlobalFonts } = require('@napi-rs/canvas');
const path = require('path');
const fs = require('fs');

const fontPathMeiryo = path.join(__dirname, '../../../Extras/assets/fonts/Meiryo.otf');
const fontPath = path.resolve(__dirname, '../../../Extras/assets/fonts/Tahoma.otf');
GlobalFonts.registerFromPath(fontPath, 'Tahoma');

if (fs.existsSync(fontPathMeiryo)) {
    Canvas.GlobalFonts.registerFromPath(fontPathMeiryo, 'Meiryo');
} else {
    console.error('❌ No se encontró la fuente Meiryo.otf.');
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pingote')
        .setDMPermission(false)
        .setDescription('Pingote dice.')
        .addStringOption(option =>
            option.setName('texto')
                .setDescription('El texto que quieres que diga el pingote.')
                .setRequired(true)
        ),

    async execute(interaction, client) {
        const texto = interaction.options.getString('texto');
        const imagePath = path.join(__dirname, '../../../Extras/assets/images/pingote.png');

        if (!fs.existsSync(imagePath)) {
            return interaction.reply({
                content: '❌ No se encontró la imagen `pingote.png`.',
                ephemeral: true
            });
        }

        try {
            const background = await Canvas.loadImage(imagePath);
            const canvas = Canvas.createCanvas(background.width, background.height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(background, 0, 0);

            ctx.font = '22px Meiryo';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'left';

            const maxWidth = background.width - 49; // Ancho máximo de la línea
            const lineHeight = 35; 
            const maxLines = 12; ///// lineas maximas
            const maxCharsPerLine = 90; ///caracteres maximos

            const lines = getLines(ctx, texto, maxWidth, maxCharsPerLine);
            if (lines.length > maxLines) {
                return interaction.reply({
                    content: '❌ Has excedido el máximo de líneas. Haz más pequeño tu texto para usar el comando.',
                    ephemeral: true
                });
            }

            let y = 115;
            lines.forEach(line => {
                ctx.fillText(line, 325, y);  
                y += lineHeight; 
            });

            const ipList = [
                '131.108.143.255', '131.108.43.255', '131.108.71.255', '131.108.83.255', '131.161.155.255',
                '131.161.187.255', '131.161.239.255', '131.161.91.255', '131.196.3.255', '131.196.183.255',
                '131.196.191.255', '131.196.39.255', '131.196.75.255', '131.196.83.255', '131.221.3.255', '131.221.19.255'
            ];
            const randomIp = ipList[Math.floor(Math.random() * ipList.length)];

            const ipPosX = 1280;
            const ipPosY = 630;
            const ipFontSize = 18;

            ctx.font = `${ipFontSize}px Meiryo`;
            ctx.fillText(randomIp, ipPosX, ipPosY);

            const randomHour = Math.floor(Math.random() * 12) + 1;
            const randomMinute = Math.floor(Math.random() * 60);
            const randomSecond = Math.floor(Math.random() * 60);
            const amPm = Math.random() > 0.5 ? 'am' : 'pm';
            const randomTime = `${randomHour.toString().padStart(2, '0')}:${randomMinute.toString().padStart(2, '0')}:${randomSecond.toString().padStart(2, '0')} ${amPm}`;

            const timeText = `a las ${randomTime}`;
            const onText = `« on: Hoy`;

            const timePosX = 348;
            const timePosY = 28;
            const timeFontSize = 17;

            ctx.font = `bold ${timeFontSize}px Tahoma`;
            ctx.fillStyle = '#ffffff';
            ctx.fillText(onText, timePosX, timePosY);

            const textWidth = ctx.measureText(onText).width;
            ctx.font = `${timeFontSize}px Tahoma`;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fillText(` ${timeText} »`, timePosX + textWidth, timePosY);

            const attachment = new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'pingote.png' });
            await interaction.reply({ files: [attachment] });
        } catch (error) {
            client.log.error(`Error al ejecutar /pingote: ${error}`);
            await interaction.reply({
                content: '❌ Ocurrió un error al generar el pingote.',
                ephemeral: true
            });
        }
    }
};

function getLines(ctx, text, maxWidth, maxCharsPerLine) {
    const lines = [];
    let currentLine = '';
    const words = text.split(' ');

    words.forEach(word => {
        if (currentLine.length + word.length > maxCharsPerLine || ctx.measureText(currentLine + ' ' + word).width > maxWidth) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine += (currentLine ? ' ' : '') + word;
        }
    });
    if (currentLine) {
        lines.push(currentLine);
    }

    return lines;
}
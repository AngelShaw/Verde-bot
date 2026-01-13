const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const Canvas = require('canvas');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('crearfist')
        .setDescription('Genera una imagen con un marco')
        .setDMPermission(false)
        .addAttachmentOption(option => 
            option.setName('imagen')
                .setDescription('La imagen que quieres usar')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('marco')
                .setDescription('El tipo de marco que quieres')
                .addChoices(
                    { name: 'Cuadrado', value: 'cuadrado' },
                    { name: 'Redondo', value: 'redondo' },
                    { name: 'Triangular', value: 'triangular' },
                    { name: 'Rectangular', value: 'rectangular' }
                )
                .setRequired(true))
        .addBooleanOption(option => 
            option.setName('privado')
                .setDescription('Envía la imagen por mensaje privado si es true')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('desenfoque')
                .setDescription('Nivel de desenfoque (1-100)')
                .setMinValue(1)
                .setMaxValue(100)
                .setRequired(false))
        .addAttachmentOption(option =>
            option.setName('marco_personalizado')
                .setDescription('Sube un marco personalizado en formato PNG o JPG')
                .setRequired(false)),

    async execute(interaction) {
        const image = interaction.options.getAttachment('imagen');
        const marco = interaction.options.getString('marco');
        const privado = interaction.options.getBoolean('privado');
        const desenfoque = interaction.options.getInteger('desenfoque') || 0;
        const marcoPersonalizado = interaction.options.getAttachment('marco_personalizado');
        const serverIcon = interaction.guild.iconURL();

        if (!['image/png', 'image/jpeg'].includes(image.contentType)) {
            return interaction.reply(`Lo siento, deberás subir la imagen en PNG o JPG. No se puede crear tu forma con el formato ${image.contentType}.`);
        }

        let marcoPath;
        const basePath = path.resolve(__dirname, '..', '..', '..', 'Extras', 'fist');

        // Si se selecciona un marco personalizado, se reemplaza el marco predeterminado
        if (marcoPersonalizado) {
            marcoPath = marcoPersonalizado.url;
        } else {
            switch (marco) {
                case 'cuadrado': marcoPath = path.join(basePath, 'cuadrado.png'); break;
                case 'redondo': marcoPath = path.join(basePath, 'redondo.png'); break;
                case 'triangular': marcoPath = path.join(basePath, 'triangular.png'); break;
                case 'rectangular': marcoPath = path.join(basePath, 'rectangular.png'); break;
                default: return interaction.reply('Por favor selecciona un marco válido.');
            }
        }

        try {
            const canvas = Canvas.createCanvas(500, 500);
            const ctx = canvas.getContext('2d');

            const userImage = await Canvas.loadImage(image.url);

            ctx.save();
            // Aplicar recorte de imagen según el marco seleccionado (cuadrado, redondo, etc.)
            if (marco === 'cuadrado') {
                const padding = 60;
                ctx.beginPath();
                ctx.moveTo(padding, 0);
                ctx.lineTo(500 - padding, 0);
                ctx.quadraticCurveTo(500, 0, 500, padding);
                ctx.lineTo(500, 500 - padding);
                ctx.quadraticCurveTo(500, 500, 500 - padding, 500);
                ctx.lineTo(padding, 500);
                ctx.quadraticCurveTo(0, 500, 0, 500 - padding);
                ctx.lineTo(0, padding);
                ctx.quadraticCurveTo(0, 0, padding, 0);
                ctx.closePath();
                ctx.clip();
                const imageSize = 495 - (padding * 2);
                ctx.drawImage(userImage, padding, padding, imageSize, imageSize);
            } else if (marco === 'redondo') {
                const radius = 225;
                ctx.beginPath();
                ctx.arc(250, 250, radius, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(userImage, -25, -25, 550, 550);
            } else if (marco === 'triangular') {
                ctx.beginPath();
                ctx.moveTo(250, 85);
                ctx.lineTo(50, 455);
                ctx.lineTo(445, 475);
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(userImage, 40, 75, 420, 350);
            } else if (marco === 'rectangular') {
                const frameWidth = 502;
                const frameHeight = 300;
                const yOffset = 112;
                const padding = 25.5; 
                const innerFrameWidth = frameWidth - 2 * padding;
                const innerFrameHeight = frameHeight - 2 * padding;
                const scale = Math.max(innerFrameWidth / userImage.width, innerFrameHeight / userImage.height);
                const scaledWidth = userImage.width * scale;
                const scaledHeight = userImage.height * scale;
                const x = padding + (innerFrameWidth - scaledWidth) / 2;
                const y = yOffset + padding + (innerFrameHeight - scaledHeight) / 2;

                ctx.save();
                ctx.beginPath();
                ctx.rect(padding, yOffset, frameWidth - 2 * padding, frameHeight - 2 * padding);
                ctx.clip();
                ctx.drawImage(userImage, x, yOffset + padding, scaledWidth, scaledHeight);
                ctx.restore();
            }
            ctx.restore();

            // Aplicar desenfoque si es necesario
            if (desenfoque > 0) {
                ctx.globalAlpha = 0.1;
                for (let i = 0; i < desenfoque; i++) {
                    ctx.drawImage(canvas, -1, -1, 502, 502);
                    ctx.drawImage(canvas, 1, -1, 502, 502);
                    ctx.drawImage(canvas, -1, 1, 502, 502);
                    ctx.drawImage(canvas, 1, 1, 502, 502);
                }
                ctx.globalAlpha = 1;
            }

            // Cargar el marco (puede ser el personalizado o el seleccionado)
            const frame = await Canvas.loadImage(marcoPath);
            ctx.drawImage(frame, 0, 0, 500, 500);

            const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'fist-image.png' });

            const embed = new EmbedBuilder()
                .setColor('#CB1BFF')
                .setTimestamp()
                .setFooter({ text: 'Pedido exitoso!' })
                .setThumbnail(serverIcon);

            embed
                .setTitle(privado ? '⛔Aquí tienes tu fist personalizado⛔' : '✨Aquí tienes tu fist personalizado✨')
                .setDescription(privado 
                    ? 'Espero sea de tu agrado y si necesitas más puedes hacer otro pedido en el servidor 💥'
                    : `Pedido por: <@${interaction.user.id}>`)
                .setImage(`attachment://fist-image.png`);

            if (privado) {
                try {
                    await interaction.user.send({ embeds: [embed], files: [attachment] });
                    await interaction.reply({ content: 'La imagen ha sido enviada a tus mensajes privados.', ephemeral: false });
                } catch (error) {
                    if (error.code === 50007) {
                        await interaction.reply({ 
                            content: 'No puedo enviarte la imagen por mensaje directo. Activa los mensajes directos en configuración y reintenta.', 
                            ephemeral: true 
                        });
                    } else {
                        console.error('Error al enviar la imagen en privado:', error);
                        await interaction.reply('Hubo un error al procesar la imagen. Inténtalo de nuevo.');
                    }
                }
            } else {
                await interaction.reply({ embeds: [embed], files: [attachment] });
            }
        } catch (error) {
            console.error('Error al crear la imagen:', error);
            await interaction.reply('Hubo un error al procesar la imagen. Inténtalo de nuevo.');
        }
    }
};

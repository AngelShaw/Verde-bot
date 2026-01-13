const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, AttachmentBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tiktok-multi')
        .setDMPermission(false)
        .setDescription('Descarga un video de TikTok sin marca de agua')
        .addStringOption(option => 
            option.setName('link')
                .setDescription('Enlace del video de TikTok')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('privado')
                .setDescription('¿Quieres recibir el video por mensaje privado?')
                .setRequired(true)
                .addChoices(
                    { name: 'Sí', value: 'si' },
                    { name: 'No', value: 'no' }
                )),
    async execute(interaction) {
        const link = interaction.options.getString('link');
        const privado = interaction.options.getString('privado');
        await interaction.deferReply();

        try {
            const response = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(link)}&hd=1`);
            
            if (!response.data || !response.data.data || !response.data.data.play) {
                return interaction.editReply('No se pudo obtener el video. Asegúrate de que el enlace es válido y que la API está funcionando.');
            }
            
            const videoUrl = response.data.data.play;
            const videoBuffer = await axios.get(videoUrl, { responseType: 'arraybuffer' });
            const attachment = new AttachmentBuilder(Buffer.from(videoBuffer.data), { name: 'video.mp4' });

            const downloadButton = new ButtonBuilder()
                .setLabel('Descargar')
                .setStyle(ButtonStyle.Link)
                .setURL(videoUrl);

            const row = new ActionRowBuilder().addComponents(downloadButton);

            if (privado === 'si') {
                try {
                    const dmMessage = await interaction.user.send({ 
                        content: '***✨ Aquí está tu video de TikTok ✨:***', 
                        files: [attachment]
                    });

                    const attachmentUrl = dmMessage.attachments.first()?.url;
                    if (!attachmentUrl) return;

                    downloadButton.setURL(attachmentUrl);
                    await dmMessage.edit({ components: [row] });
                    await interaction.editReply('***✅ El video fue enviado a tus mensajes directos 💢***');
                } catch (error) {
                    if (error.code === 50013 || error.code === 50007) {
                        await interaction.editReply('***⚠️ No pude enviarte un mensaje privado. Asegúrate de tener los mensajes directos activados.***');
                    } else if (error.code === 40005) { // Excede el tamaño
                        await interaction.user.send({
                            content: '***⚠️ El tamaño del video excede el peso permitido por el servidor de Discord. Puedes descargarlo directamente desde el siguiente enlace:***',
                            components: [row]
                        }).then(() => {
                            interaction.editReply('***✅ Te mande el video por tus mensajes directos ✅***');
                        }).catch(() => {
                            interaction.editReply('***⚠️ No pude enviarte un mensaje privado y el video excede el peso permitido. Intenta cambiar la configuración de tus mensajes directos.***');
                        });
                    } else {
                        console.error('Error al enviar el video por mensaje privado:***', error);
                        interaction.editReply('***❌ Ocurrió un error inesperado al procesar el video.***');
                    }
                }
            } else {
                try {
                    const message = await interaction.editReply({ 
                        content: '***✨ Aquí está tu video de TikTok ✨:***', 
                        files: [attachment]
                    });
                    const attachmentUrl = message.attachments.first()?.url;
                    if (!attachmentUrl) return;

                    downloadButton.setURL(attachmentUrl);
                    await interaction.editReply({ components: [row] });
                } catch (error) {
                    if (error.code === 40005) { // Excede el tamaño
                        const yesButton = new ButtonBuilder()
                            .setCustomId('download_yes')
                            .setLabel('Sí')
                            .setStyle(ButtonStyle.Success);

                        const noButton = new ButtonBuilder()
                            .setCustomId('download_no')
                            .setLabel('No')
                            .setStyle(ButtonStyle.Danger);

                        const buttonRow = new ActionRowBuilder().addComponents(yesButton, noButton);

                        await interaction.editReply({
                            content: '***⚠️ El tamaño del video excede el peso permitido por el servidor de Discord, ¿quieres solo descargar el video sin previsualización del video?***',
                            components: [buttonRow]
                        });

                        const filter = i => i.user.id === interaction.user.id;
                        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 30000 });

                        collector.on('collect', async i => {
                            if (i.customId === 'download_yes') {
                                await i.deferUpdate();
                                await interaction.editReply({
                                    content: '***✅ Aquí tienes el enlace para descargar el video:***',
                                    components: [row]
                                });
                                collector.stop();
                            } else if (i.customId === 'download_no') {
                                await i.deferUpdate();
                                await interaction.editReply({ content: '***❌ Cancelaste la descarga del video.***', components: [] });
                                collector.stop();
                            }
                        });

                        return;
                    }
                    console.error('Error al enviar el video:', error);
                    interaction.editReply('***❌ Ocurrió un error inesperado al procesar el video.***');
                }
            }
        } catch (error) {
            console.error('Error al descargar el video:', error);
            interaction.editReply('Ocurrió un error al intentar descargar el video. Verifica que el enlace sea correcto y vuelve a intentarlo.');
        }
    }
};
const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    devOnly: true,
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDMPermission(false)
        .setDescription('Generador de Mensajes Embeds'),
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('embedModal')
            .setTitle('Crear un Embed');

        const titleInput = new TextInputBuilder()
            .setCustomId('embedTitle')
            .setLabel('Título del Embed')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const descriptionInput = new TextInputBuilder()
            .setCustomId('embedDescription')
            .setLabel('Descripción del Embed')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const imageInput = new TextInputBuilder()
            .setCustomId('embedImage')
            .setLabel('URL de la imagen o GIF')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        modal.addComponents(
            new ActionRowBuilder().addComponents(titleInput),
            new ActionRowBuilder().addComponents(descriptionInput),
            new ActionRowBuilder().addComponents(imageInput)
        );

        await interaction.showModal(modal);
        await interaction.reply({ content: 'Esperando respuesta del modal...', ephemeral: true });

        try {
            const modalInteraction = await interaction.awaitModalSubmit({
                filter: (i) => i.customId === 'embedModal' && i.user.id === interaction.user.id,
                time: 600000 // 10 minutos
            });

            await modalInteraction.deferReply(); // Evita la expiración de la interacción

            const title = modalInteraction.fields.getTextInputValue('embedTitle');
            const description = modalInteraction.fields.getTextInputValue('embedDescription');
            const imageUrl = modalInteraction.fields.getTextInputValue('embedImage');

            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(description)
                .setColor('#CB1BFF')
                .setFooter({
                    text: `By: Shaw • ${new Date().toLocaleString('es-ES', { hour12: true })}`,
                    iconURL: 'https://i.imgur.com/YghXCmq.gif'
                });

            if (imageUrl) {
                try {
                    embed.setImage(imageUrl);
                } catch (error) {
                    console.error('URL de imagen inválida:', error);
                }
            }

            await modalInteraction.followUp({ embeds: [embed] });

        } catch (error) {
            if (error.code === 'InteractionCollectorError') {
                console.error('El usuario no completó el modal a tiempo.');
                await interaction.followUp({
                    content: 'No completaste el modal a tiempo. Intenta de nuevo.',
                    ephemeral: true
                });
            } else {
                console.error('Ocurrió un error inesperado:', error);
            }
        }
    },
};
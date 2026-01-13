const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const gifs = [
    "https://i.imgur.com/99EUSWM.gif",
    "https://i.imgur.com/QDepFJf.gif",
    "https://i.imgur.com/RsBOWhz.gif",
    "https://i.imgur.com/LtiWYwm.gif",
    "https://i.imgur.com/N1GNBqK.gif",
    "https://i.imgur.com/b8gTnov.gif",
    "https://i.imgur.com/UuP4Vgi.gif",
    "https://i.imgur.com/JwwoIQB.gif",
    "https://i.imgur.com/QO52TeL.gif",
    "https://i.imgur.com/fx5lcWT.gif",
    "https://i.imgur.com/8qqUbz1.gif",
    "https://i.imgur.com/gVFR3EJ.gif",
    "https://i.imgur.com/k6Mg5Di.gif",
    "https://i.imgur.com/FNo8Img.gif",
    "https://i.imgur.com/VVMPKqh.gif",
    "https://i.imgur.com/CtvdFAT.gif",
    "https://i.imgur.com/vSlKMhY.gif",
    "https://i.imgur.com/ITWaUGI.gif",
    "https://i.imgur.com/EQdldVP.gif",
    "https://i.imgur.com/IUkUbKj.gif"
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cafe')
        .setDescription('Invita a alguien a tomar un exquisito café ☕️☕️.')
        .setDMPermission(false)
        .addUserOption(option => option
            .setName('usuario')
            .setDescription('Elige al usuario que desees invitar a un café.')
            .setRequired(true)
        ),
    async execute(interaction) {
        const invitedUser = interaction.options.getUser('usuario');
        const user = interaction.user;

        // Selecciona un GIF aleatorio
        const randomGif = gifs[Math.floor(Math.random() * gifs.length)];

        const embed = new EmbedBuilder()
            .setTitle('☕️ Invitación a tomar café ☕️')
            .setDescription(`¡<@${invitedUser.id}>! <@${user.id}> te ha invitado a tomar un café.`)
            .setColor(0xCB1BFF)
            .setImage(randomGif); // Añade el GIF aleatorio al embed

        const acceptButton = new ButtonBuilder()
            .setCustomId('accept')
            .setLabel('Aceptar')
            .setStyle(ButtonStyle.Success);

        const rejectButton = new ButtonBuilder()
            .setCustomId('reject')
            .setLabel('Rechazar')
            .setStyle(ButtonStyle.Danger);

        const actionRow = new ActionRowBuilder()
            .addComponents(acceptButton, rejectButton);

        await interaction.reply({ content: `¡<@${invitedUser.id}>! Tienes una invitación para tomar café💨.`, embeds: [embed], components: [actionRow] });

        if (user.id !== invitedUser.id) {
            const filter = (buttonInteraction) => buttonInteraction.user.id === invitedUser.id;
            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 300000 }); // 5 minutos

            collector.on('collect', async buttonInteraction => {
                if (buttonInteraction.customId === 'accept') {
                    await buttonInteraction.reply({ content: `¡Invitación aceptada! ☕️` });
                    collector.stop();
                } else if (buttonInteraction.customId === 'reject') {
                    await buttonInteraction.reply('💔Invitación rechazada.💔 😔');
                    collector.stop();
                }
            });

            collector.on('end', async () => {
                const disabledActionRow = new ActionRowBuilder()
                    .addComponents(
                        acceptButton.setDisabled(true),
                        rejectButton.setDisabled(true)
                    );
                await interaction.editReply({ components: [disabledActionRow] });
            });
        }
    },
};

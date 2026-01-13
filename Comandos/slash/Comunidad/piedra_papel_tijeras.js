const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

// Lista de URLs de GIFs
const gifUrls = [
    'https://i.imgur.com/fTgEgkz.gif',
    'https://i.imgur.com/odeEvIc.gif',
    'https://i.imgur.com/DqQRU2R.gif',
    'https://i.imgur.com/RttoQkf.gif',
    'https://i.imgur.com/qPf161x.gif',
    'https://i.imgur.com/ut92xcb.gif',
    'https://i.imgur.com/RmXDTqb.gif',
    'https://i.imgur.com/ytCkhs2.gif',
    'https://i.imgur.com/sw1o8hm.gif',
    'https://i.imgur.com/g9WMLtS.gif',
    'https://i.imgur.com/JMzd8BT.gif',
    'https://i.imgur.com/pJVTuKo.gif',
    'https://i.imgur.com/bDQOD9U.gif',
    'https://i.imgur.com/2aQgmWC.gif'
];

const data = new SlashCommandBuilder()
    .setName('ppt')
    .setDMPermission(false)
    .setDescription('Reta a un usuario a jugar Piedra, Papel, Tijeras')
    .addUserOption(option => option
        .setName('usuario')
        .setDescription('Elige al usuario que deseas retar')
        .setRequired(true)
    );

const Users = new Map();

async function execute(interaction) {
    const invitedUser = interaction.options.getUser('usuario');
    const user = interaction.user;

    if (invitedUser.id === user.id) {
        return interaction.reply({ content: "¡No puedes retarte a ti mismo a jugar Piedra, Papel, Tijeras!", ephemeral: true });
    }

    if (invitedUser.bot) {
        return interaction.reply({ content: "¡No puedes retar a un bot a jugar Piedra, Papel, Tijeras!", ephemeral: true });
    }

    if (Users.has(user.id)) {
        return interaction.reply("¡Ya has jugado un juego!");
    } else if (Users.has(invitedUser.id)) {
        return interaction.reply("¡El usuario ya está en un juego!");
    } else {
        Users.set(user.id, { opponent: invitedUser.id, choice: null });
        Users.set(invitedUser.id, { opponent: user.id, choice: null });
    }

    const embed = new EmbedBuilder()
        .setTitle('Piedra, Papel, Tijeras')
        .setDescription(`¡<@${invitedUser.id}>! <@${user.id}> te ha retado a un juego de Piedra, Papel, Tijeras.`)
        .setColor(0xCB1BFF);

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

    await interaction.reply({ content: `¡<@${invitedUser.id}>! Tienes un reto pendiente.`, embeds: [embed], components: [actionRow] });

    const filter = (buttonInteraction) => buttonInteraction.user.id === invitedUser.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 300000 }); // 5 minutos

    collector.on('collect', async buttonInteraction => {
        if (buttonInteraction.customId === 'accept') {
            await buttonInteraction.reply({ content: `¡Desafío aceptado!`, ephemeral: true });
            await sendWeaponOptions(interaction, user, invitedUser);
            collector.stop();
        } else if (buttonInteraction.customId === 'reject') {
            await buttonInteraction.reply('💔 Desafío rechazado. 💔', { ephemeral: true });
            Users.delete(user.id);
            Users.delete(invitedUser.id);
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

async function sendWeaponOptions(interaction, user, invitedUser) {
    const embed = new EmbedBuilder()
        .setColor(0xCB1BFF)
        .setTitle("Piedra, Papel, Tijeras")
        .setDescription("¡Elijan su arma!")
        .setFooter({ text: "Escoge Piedra, Papel o Tijeras | Tiempo: 20 segundos" });

    const actionRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setLabel("Piedra 🧱")
            .setCustomId(`rps-${user.id}-Piedra 🧱`)
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setLabel("Papel 📄")
            .setCustomId(`rps-${user.id}-Papel 📄`)
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setLabel("Tijeras ✂️")
            .setCustomId(`rps-${user.id}-Tijeras ✂️`)
            .setStyle(ButtonStyle.Secondary)
    );

    await interaction.followUp({
        content: `¡<@${user.id}> y <@${invitedUser.id}>! Ambos elijan su arma.`,
        embeds: [embed],
        components: [actionRow]
    });

    const filter = (buttonInteraction) => buttonInteraction.customId.startsWith('rps-') && (buttonInteraction.user.id === user.id || buttonInteraction.user.id === invitedUser.id);
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 20000 });

    let userChoice = null;
    let invitedUserChoice = null;

    collector.on('collect', async (buttonInteraction) => {
        const choice = buttonInteraction.customId.split('-').pop();
        if (buttonInteraction.user.id === user.id) {
            userChoice = choice;
        } else if (buttonInteraction.user.id === invitedUser.id) {
            invitedUserChoice = choice;
        }

        await buttonInteraction.reply({ content: `Has elegido ${choice}`, ephemeral: true });

        if (userChoice && invitedUserChoice) {
            collector.stop();
            determineWinner(interaction, user, invitedUser, userChoice, invitedUserChoice);
        }
    });

    collector.on('end', async () => {
        if (!userChoice || !invitedUserChoice) {
            Users.delete(user.id);
            Users.delete(invitedUser.id);
            await interaction.followUp({
                components: [],
                embeds: [
                    {
                        color: 0x5865f2,
                        description: "El tiempo ha terminado."
                    }
                ]
            });
        }
    });
}

function determineWinner(interaction, user, invitedUser, userChoice, invitedUserChoice) {
    const result = determineResult(userChoice, invitedUserChoice, user, invitedUser);
    const description = `— <@${user.id}> eligió: ${userChoice}!\n— <@${invitedUser.id}> eligió: ${invitedUserChoice}!\n\n${result}`;
    const randomGif = gifUrls[Math.floor(Math.random() * gifUrls.length)];

    const embed = new EmbedBuilder()
        .setColor(0xCB1BFF)
        .setTitle("Ganador del juego")
        .setDescription(description)
        .setImage(randomGif)
        .setFooter({
            text: `${new Date().toLocaleString('es-ES', { hour12: true })}`
        });

    interaction.followUp({
        embeds: [embed],
        components: []
    });

    Users.delete(user.id);
    Users.delete(invitedUser.id);
}

function determineResult(userChoice, invitedUserChoice, user, invitedUser) {
    if (userChoice === invitedUserChoice) {
        return "¡Es un empate!";
    } else if (
        (userChoice === "Piedra 🧱" && invitedUserChoice === "Tijeras ✂️") ||
        (userChoice === "Papel 📄" && invitedUserChoice === "Piedra 🧱") ||
        (userChoice === "Tijeras ✂️" && invitedUserChoice === "Papel 📄")
    ) {
        return `¡El gran ganador se trata de <@${user.id}>! Felicidades 👻`;
    } else {
        return `¡El gran ganador se trata de <@${invitedUser.id}> ! Felicidades 👻`;
    }
}

module.exports = { data, execute };
const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription(`Obtener el avatar de un usuario del servidor`)
        .setDMPermission(false)
        .addUserOption(option => option
            .setName('user')
            .setDescription(`El avatar de los usuarios a buscar.`)
            .setRequired(true)
        ),
    async execute(interaction) {
        const { member } = interaction;
        const userOption = interaction.options.getUser('user');

        // Usa el usuario seleccionado o el miembro que ejecutó el comando
        const user = userOption || member.user;

        const userAvatar = user.displayAvatarURL({ size: 2048, dynamic: true });

        const embed = new EmbedBuilder()
            .setColor('#CB1BFF')
            .setAuthor({ name: `${user.username}'s Avatar`, iconURL: `${user.displayAvatarURL({ size: 64, dynamic: true })}` })
            .setImage(userAvatar)
            .setTimestamp()
            .setFooter({ text: `User ID: ${user.id}` });

        const png = new ButtonBuilder()
            .setLabel('PNG')
            .setStyle(ButtonStyle.Link)
            .setURL(user.displayAvatarURL({ size: 2048, format: 'png' }));

        const jpg = new ButtonBuilder()
            .setLabel('JPG')
            .setStyle(ButtonStyle.Link)
            .setURL(user.displayAvatarURL({ size: 2048, format: 'jpg' }));

        const jpeg = new ButtonBuilder()
            .setLabel('JPEG')
            .setStyle(ButtonStyle.Link)
            .setURL(user.displayAvatarURL({ size: 2048, format: 'jpeg' }));

        const gif = new ButtonBuilder()
            .setLabel('GIF')
            .setStyle(ButtonStyle.Link)
            .setURL(user.displayAvatarURL({ size: 2048, format: 'gif' }));

        const row = new ActionRowBuilder().addComponents(png, jpg, jpeg, gif);

        await interaction.reply({
            embeds: [embed],
            components: [row],
        });
    },
};
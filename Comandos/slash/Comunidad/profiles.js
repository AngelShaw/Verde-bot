const { CommandInteraction, Client, AttachmentBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { profileImage } = require('discord-arts');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('perfil-info')
        .setDMPermission(false)
        .setDescription('Este comando permite ver el perfil de un usuario mediante una imagen.')
        .addUserOption(option => option
            .setName('usuario')
            .setDescription('Elige al usuario que quieras ver el perfil.')
            .setRequired(false)
        ),

    /**
     * 
     * @param { CommandInteraction } interaction
     * @param { Client } client
     */

    async execute(interaction, client) {
        await interaction.deferReply();

        const user = interaction.options.getUser('usuario') || interaction.user;
        const member = interaction.guild.members.cache.get(user.id);

        const currentDate = new Date();
        const formattedDate = `${currentDate.toLocaleDateString()} a las ${currentDate.toLocaleTimeString()}`;

        // Fetch profile image
        const buffer = await profileImage(user.id, {
            squareAvatar: false,
            removeAvatarFrame: false,
            overwriteBadges: true,
            badgesFrame: true,
            disableProfileTheme: false,
            moreBackgroundBlur: true,
            presenceStatus: 'idle'
        });

        const attachment = new AttachmentBuilder(buffer, { name: 'profile-image.png' });
        const imageUrl = `attachment://profile-image.png`;

        const embed = new EmbedBuilder()
            .setColor('#CB1BFF')
            .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
            .setTitle(`Informacion de ${user.tag}`)
            .addFields(
                { name: '🆔 Discord Id:', value: `${user.id}` },
                { name: '🏷️ Apodo:', value: `${member.nickname || 'No tiene'}` },
                { name: '🗒️ Mencion:', value: `<@${user.id}>` },
                { name: '📅 Fecha de creación:', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>` },
                { name: '➡️ Fecha de ingreso:', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` },
                { name: '📃 Roles:', value: `${member.roles.cache.map(role => `<@&${role.id}>`).join(' ')}` }
            )
            .setThumbnail(user.displayAvatarURL())
            .setImage(imageUrl)
            .setFooter({ text: `Solicitado/a por: ${interaction.user.tag} • ${formattedDate}` });

        const avatarButton = new ButtonBuilder()
            .setLabel('🖼 Avatar')
            .setStyle('Link')
            .setURL(user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }));

        const bannerButton = new ButtonBuilder()
            .setLabel('🖼 Banner')
            .setStyle('Link');

        // Check if user has a banner
        if (user.banner) {
            bannerButton.setURL(user.bannerURL({ format: 'png', dynamic: true, size: 1024 }));
        } else {
            bannerButton.setURL(user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 })); // Fallback to avatar if no banner
        }

        const row1 = new ActionRowBuilder().addComponents(avatarButton);
        const row2 = new ActionRowBuilder().addComponents(bannerButton);

        await interaction.editReply({ 
            embeds: [embed], 
            components: [row1, row2], 
            files: [attachment] 
        });
    },
};

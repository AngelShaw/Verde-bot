const { EmbedBuilder, CommandInteraction, ButtonStyle, Client, ButtonBuilder, ActionRowBuilder, SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { profileImage } = require('discord-arts');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('redes')
        .setDMPermission(false)
        .setDescription('Redes sociales personales y del servidor.'),
    
    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    async execute(interaction, client) {
        if (!interaction.isCommand()) return;

        await interaction.deferReply({
            ephemeral: false
        });

        // Generar la imagen de perfil del bot con texto personalizado
        const buffer = await profileImage(client.user.id, {
            squareAvatar: false,
            removeAvatarFrame: false,
            overwriteBadges: true,
            badgesFrame: true,  // Ocultar el marco de badges
            disableProfileTheme: false,
            moreBackgroundBlur: true,
            presenceStatus: 'idle',
            showUsername: false, // Ocultar el nombre de usuario del bot en la imagen
            showBadge: false,   // Ocultar el apartado "bot"
            customTag: "Link de redes"  // Customizar el tag para que muestre "Redes"
        });

        const attachment = new AttachmentBuilder(buffer, { name: 'bot-profile-image.png' });
        const imageUrl = `attachment://bot-profile-image.png`;

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Servidor discord")
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://discord.com/invite/dQGGQx3cy7'),
                new ButtonBuilder()
                    .setLabel("Steam")
                    .setStyle(ButtonStyle.Link)
                    .setURL("https://steamcommunity.com/id/AngelShaw/"),
                new ButtonBuilder()
                    .setLabel("Instagram")
                    .setStyle(ButtonStyle.Link)
                    .setURL("https://www.instagram.com/angel__shaw_/"),
                new ButtonBuilder()
                    .setLabel("Facebook")
                    .setStyle(ButtonStyle.Link)
                    .setURL("https://www.facebook.com/AngelShawFZ/")
            );

        const mainPage = new EmbedBuilder()
            .setAuthor({ name: 'Redes sociales del servidor', iconURL: client.user.displayAvatarURL() })
            .setThumbnail(client.user.displayAvatarURL())
            .setColor(0xCB1BFF)
            .addFields([{ name: 'Link invitacion del servidor', value: `[Link de invitacion a la comunidad](https://discord.com/invite/dQGGQx3cy7)` }])
            .setImage(imageUrl);

        await interaction.followUp({ embeds: [mainPage], components: [row], files: [attachment] });
    }
};

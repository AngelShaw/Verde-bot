const { SlashCommandBuilder } = require("discord.js");
const { profileImage } = require('discord-arts');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('perfil')
    .setDMPermission(false)
    .setDescription('Mira tu perfil o el de otro usuario')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('El usuario que quieres ver el perfil')
        .setRequired(true)),
  
  async execute(interaction, client) {
    const user = interaction.options.getUser('usuario') || interaction.user; 

    const buffer = await profileImage(user.id, {
      squareAvatar: true,
      removeAvatarFrame: false,
      overwriteBadges: true,
      badgesFrame: true,
    });

    interaction.reply({ files: [{ attachment: buffer, name: 'profile.png' }] }); 
  },
};
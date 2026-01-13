const canvafy = require("canvafy");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ship")
    .setDMPermission(false)
    .setDescription("💋Ships 2 usuarios💋")
    .setNSFW(false)
    .addUserOption((option) =>
      option
        .setName("primer_usuario")
        .setDescription("El primer usuario que quieres enviar.!")
        .setRequired(true)
    )
    .addUserOption((option) =>
      option
        .setName("segundo_usuario")
        .setDescription("El segundo usuario que quieres enviar.!")
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const user = interaction.options.getUser("primer_usuario");
    const member = interaction.options.getUser("segundo_usuario");
    const userAvatar = user.displayAvatarURL({
      forceStatic: true,
      size: 1024,
      extension: "png",
    });
    const memberAvatar = member.displayAvatarURL({
      forceStatic: true,
      size: 1024,
      extension: "png",
    });

    const ship = await new canvafy.Ship()
      .setAvatars(userAvatar, memberAvatar)
      .setBorder("#f0f0f0")
      .setBackground(
        "image",
        "https://i.imgur.com/jUbysXw.jpeg"
      )
      .setOverlayOpacity(0.5)
      .build();

    await interaction.reply({
      content: `**Probabilidad de ship ${user.toString()} & ${member.toString()}!**`,
      files: [
        {
          attachment: ship,
          name: `ship.png`,
        },
      ],
    });
  },
};
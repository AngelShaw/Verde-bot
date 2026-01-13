const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("waifu")
    .setDescription("Tener una waifu de forma random.!")
    .setNSFW(false)
    .setDMPermission(false),
  async execute(interaction) {
    const waifuFetch = await fetch("https://api.waifu.pics/sfw/waifu", {
      headers: {
        Accept: "application/json",
      },
    });

    if (!waifuFetch.ok) {
      interaction.followUp(
        `API request failed with status **${waifuFetch.status}**.`
      );
      return;
    }

    const waifuData = await waifuFetch.json();
    const waifuImage = waifuData.url;

    const waifuEmbed = new EmbedBuilder()
      .setImage(waifuImage)
      .setColor("#CB1BFF")
      .setFooter({ text: `Pedido por ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.reply({
      content: "**Tu Waifu ❤️:**",
      embeds: [waifuEmbed],
    });
  },
};

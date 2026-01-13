const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDMPermission(false)
    .setDescription("Menu con los comandos."),
  async execute(interaction) {
    const commandsPerPage = 20;
    const commandsPath = path.resolve(__dirname, "../Comunidad");


    ///////////////////////// Leer los archivos de comandos en la ruta especificada
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    const allCommands = commandFiles.map(file => {
      const command = require(path.join(commandsPath, file));
      return `/${command.data.name} - ${command.data.description}`;
    });

    const totalPages = Math.ceil(allCommands.length / commandsPerPage);
    let currentPage = 0;

    const generateEmbed = (page) => {
      const embed = new EmbedBuilder()
        .setTitle("Comandos del servidor")
        .setDescription("🔥Comandos para todos🔥.")
        .setColor("#CB1BFF")
        .setFooter({ text: `Página ${page + 1} de ${totalPages}` })
        .setTimestamp();

      const start = page * commandsPerPage;
      const end = start + commandsPerPage;
      const commandList = allCommands.slice(start, end);

      // Dividir commandList en trozos para ajustarlo en los campos del embed
      const fieldChunks = [];
      let currentChunk = [];

      for (const command of commandList) {
        if (currentChunk.join("\n").length + command.length > 1024) {
          fieldChunks.push(currentChunk.join("\n"));
          currentChunk = [command];
        } else {
          currentChunk.push(command);
        }
      }

      if (currentChunk.length > 0) {
        fieldChunks.push(currentChunk.join("\n"));
      }

      fieldChunks.forEach((chunk, index) => {
        embed.addFields({ name: index === 0 ? "Lista" : "\u200B", value: chunk });
      });

      return embed;
    };

    const generateButtons = (page) => {
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId("previous")
            .setLabel("Atrás")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === 0),
          new ButtonBuilder()
            .setCustomId("next")
            .setLabel("Siguiente")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === totalPages - 1)
        );

      return row;
    };

    const initialEmbed = generateEmbed(currentPage);
    const initialButtons = generateButtons(currentPage);

    const message = await interaction.reply({
      embeds: [initialEmbed],
      components: [initialButtons],
      fetchReply: true
    });

    const filter = (i) => i.customId === 'previous' || i.customId === 'next';
    const collector = message.createMessageComponentCollector({ filter, time: 60000 }); // 1 minute collector

    collector.on('collect', async (i) => {
      if (i.customId === 'previous') {
        currentPage--;
      } else if (i.customId === 'next') {
        currentPage++;
      }

      const updatedEmbed = generateEmbed(currentPage);
      const updatedButtons = generateButtons(currentPage);

      await i.update({ embeds: [updatedEmbed], components: [updatedButtons] });
    });

    collector.on('end', async () => {
      const disabledButtons = generateButtons(currentPage);
      disabledButtons.components.forEach(button => button.setDisabled(true));
      await message.edit({ components: [disabledButtons] });
    });
  },
};
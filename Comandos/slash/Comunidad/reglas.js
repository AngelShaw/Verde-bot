const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  developer: true,
  data: new SlashCommandBuilder()
    .setName("reglas")
    .setDMPermission(false)
    .setDescription("Te mostraré todas las reglas del servidor.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    // Obtiene el ícono del servidor (si existe)
    const serverIcon = interaction.guild.iconURL({ dynamic: true, size: 512 });

    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle(`> 🔥Reglas del Servidor🔥`)
      .setThumbnail(serverIcon) // Usa el ícono del servidor
      .setDescription(
        `> **Aquí tienes el listado de reglas del servidor**\n\n> **:white_flower: Es muy importante que tengas conocimiento de estas para tener una buena estadía y convivencia en el servidor.:white_flower: **`
      )
      .addFields(
        {
          name: `:white_check_mark: 1.- Respeta a todo usuario.`,
          value:
            "`Independientemente de nacionalidad, lenguaje o raza. Estamos aquí para pasarla bien y entretenernos.`",
        },
        {
          name: `:no_entry_sign: 2.- No temas o imágenes NSFW.`,
          value:
            "`Prohibido distribuir NSFW para mantener un ambiente apropiado para todos los miembros.`",
        },
        {
          name: `:no_entry_sign: 3.- No se permiten links.`,
          value:
            "`Solo los administradores pueden compartir enlaces para evitar riesgos.`",
        },
        {
          name: `:no_entry_sign: 4.- No hagas flood.`,
          value: "`Evita molestar a los demás miembros con spam.`",
        },
        {
          name: `:white_check_mark: 5.- Mantén una convivencia sana.`,
          value:
            "`Reporta a usuarios molestos para tomar las medidas necesarias.`",
        },
        {
          name: `:no_entry_sign: 6.- No envíes links o promociones de otros servidores.`,
          value: "`Estas acciones serán sancionadas.`",
        },
        {
          name: `:no_entry_sign: 7.- No se tolera acoso, racismo o discursos de odio.`,
          value: "`Sanciones serán aplicadas ante estas conductas.`",
        },
        {
          name: `:white_check_mark: 8.- Respeta la normativa de Discord.`,
          value:
            "`Cumple con la [Normativa de Discord](https://discord.com/guidelines).`",
        }
      )
      .setFooter({ text: `¡Gracias por seguir nuestras reglas!` });

    await interaction.channel.send({ embeds: [embed] });
    await interaction.reply({ content: `Mensaje enviado correctamente.`, ephemeral: true });
  },
};

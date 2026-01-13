const { SlashCommandBuilder, EmbedBuilder, ChannelType, GuildExplicitContentFilter } = require('discord.js');
 
module.exports = {
  data: new SlashCommandBuilder()
    .setName('server')
    .setDMPermission(false)
    .setDescription('Usa este comando para ver la informacion del servidor.'),
  async execute(interaction) {
    const serwer = interaction.guild;
    const owner = await serwer.fetchOwner().catch(() => null);
    const onlineMembers = serwer.members.cache.filter((member) => member.presence?.status === 'online');
    const { channels, roles } = serwer;
    const sortowaneRole = roles.cache.map(role => role).slice(1, roles.cache.size).sort((a, b) => b.position - a.position);
    const roleUserów = sortowaneRole.filter(role => !role.managed);
    const roleManaged = sortowaneRole.filter(role => role.managed);
    const BoosterCount = serwer.members.cache.filter(member => member.roles.cache.has('993233074143903906')).size; // Set booster ID role
 
    const maxDisplayRoles = (roles, maxFieldLength = 1024) => {
      let totalLength = 0;
      const result = [];
 
      for (const role of roles) {
        const roleString = `<@&${role.id}>`;
 
        if (roleString.length + totalLength > maxFieldLength) break;
 
        totalLength += roleString.length + 1;
        result.push(roleString);
      }
 
      return result.length;
    };
 
    const allRolesCount = roles.cache.size - 1;
    const getChannelTypeSize = type => channels.cache.filter(channel => type.includes(channel.type)).size;
    const totalChannels = getChannelTypeSize([ChannelType.GuildText, ChannelType.GuildNews, ChannelType.GuildVoice, ChannelType.GuildStageVoice, ChannelType.GuildForum]);
    const verificationLevelMap = {
      [GuildExplicitContentFilter.Disabled]: 'Low',
      [GuildExplicitContentFilter.MembersWithoutRoles]: 'Medium',
      [GuildExplicitContentFilter.AllMembers]: 'Hard',
    };
    const verificationLevel = verificationLevelMap[serwer.explicitContentFilter] || 'Unknown';
 
    const embed = new EmbedBuilder()
      .setColor('#CB1BFF')
      .setAuthor({ name: serwer.name, iconURL: serwer.iconURL({ dynamic: true }) })
      .addFields(
        { name: `💥 Server ID:`, value: `└ ${serwer.id}`, inline: true },
        { name: `👻 Fecha de creacion:`, value: `└ <t:${Math.floor(serwer.createdTimestamp / 1000)}:R>`, inline: true },
        { name: `⚜️ Creador:`, value: `└ ${owner?.user?.toString() || 'Propietario no encontrado'}`, inline: true },
        { name: `👺 Miembros: (${serwer.memberCount})`, value: `└ **${onlineMembers.size}** Online ✅\n└ **${BoosterCount}** Boosters 💜`, inline: true },
        { name: `🤖 Canales: (${totalChannels})`, value: `└ **${getChannelTypeSize([ChannelType.GuildText, ChannelType.GuildForum, ChannelType.GuildNews])}** Texto\n└ **${getChannelTypeSize([ChannelType.GuildVoice, ChannelType.GuildStageVoice])}** Voz`, inline: true },
        { name: `💥 Otros:`, value: `└ Nivel de verificacion: **${verificationLevel}**`, inline: true },
        { name: `\`🔐\` Roles (${allRolesCount})`, value: `└ **${maxDisplayRoles(roleUserów)}** Roles normales\n└  **${maxDisplayRoles(roleManaged)}** Admin roles` }
      )
      .setThumbnail(serwer.iconURL({ dynamic: true }))
      .setFooter({ text: `Pedido por: ${interaction.user.tag}`, iconURL: interaction.user.avatarURL({ dynamic: true }) })
      .setTimestamp();
 
    await interaction.reply({ embeds: [embed] });
  },
};
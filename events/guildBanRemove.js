///Esto es para el evento de desbaneos

const { EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = {
    name: 'guildBanRemove',
    async execute(client, ban) {
        const logChannel = ban.guild.channels.cache.find(channel => channel.name === 'audit-log');
        if (!logChannel) {
            console.error('Audit-log channel not found');
            return;
        }

        let executor = 'Desconocido';
        try {
            const fetchedLogs = await ban.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.BanRemove
            });

            const unbanLog = fetchedLogs?.entries.first();
            if (unbanLog) {
                executor = unbanLog.executor.tag;
            }
        } catch (error) {
            console.error('Error fetching audit logs:', error);
        }

        const embed = new EmbedBuilder()
            .setColor('#32a852')
            .setTitle('Usuario desbaneado')
            .setDescription(`**${ban.user.tag}** ha sido desbaneado de **${ban.guild.name}**.`)
            .setThumbnail(ban.user.displayAvatarURL())
            .addFields(
                { name: 'Usuario desbaneado', value: `${ban.user.tag}`, inline: true },
                { name: 'ID del usuario', value: `${ban.user.id}`, inline: true },
                { name: 'Desbaneado por', value: executor, inline: true }
            )
            .setFooter({
                text: `By: Shaw • ${new Date().toLocaleString('es-ES', { hour12: true })}`,
                iconURL: 'https://i.imgur.com/8QIckgK.gif'
            })
            .setTimestamp();

        try {
            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error al enviar el log de desbaneo:', error);
        }
    },
};


const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const config = require('../config.json'); // Asegúrate de que la ruta sea correcta

module.exports = {
    name: 'guildMemberRemove',
    execute: async (client, member) => {
        const logChannel = member.guild.channels.cache.get(config.salidas_log);
        if (!logChannel) {
            console.error('El canal especificado en salidas_log no se encontró');
            return;
        }

        /////////////////////////////////////////////// Esto es cuando salen del servidor
        const embedLeave = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('Miembro salió del servidor')
            .setDescription(`**${member.user.tag}** ha salido de **${member.guild.name}**.`)
            .setThumbnail(member.user.displayAvatarURL())
            .addFields(
                { name: 'Nombre de usuario', value: `${member.user.tag} - <@${member.user.id}>`, inline: true },
                { name: 'ID de miembro', value: `${member.id}`, inline: true },
                { name: 'Total de miembros ahora', value: `${member.guild.memberCount}`, inline: true }
            )
            .setFooter({
                text: `By: Shaw • ${new Date().toLocaleString('es-ES', { hour12: true })}`,
                iconURL: 'https://i.imgur.com/8QIckgK.gif'
            })
            .setTimestamp();

        try {
            await logChannel.send({ embeds: [embedLeave] });
        } catch (error) {
            console.error('Error al enviar el log de salida de miembro:', error);
        }

        // Checa que el miembro fue expulsado
        try {
            const fetchedLogs = await member.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.MemberKick,
            });

            const kickLog = fetchedLogs.entries.first();
            
            if (!kickLog || kickLog.target.id !== member.id || (Date.now() - kickLog.createdTimestamp) > 5000) {
                return;
            }

            ////////////////////////////////////////////////// El miembro fue expulsado manualmente
            const executor = kickLog.executor.tag;
            const reason = kickLog.reason || 'Sin razón proporcionada';

            const embedKick = new EmbedBuilder()
                .setColor('#FF4500')
                .setTitle('Usuario expulsado')
                .setDescription(`**${member.user.tag}** ha sido expulsado del servidor.`)
                .setThumbnail(member.user.displayAvatarURL())
                .addFields(
                    { name: 'Nombre de usuario', value: `${member.user.tag} - <@${member.user.id}>`, inline: true },
                    { name: 'ID de usuario', value: `${member.user.id}`, inline: true },
                    { name: 'Expulsado por', value: executor, inline: true },
                    { name: 'Razón de la expulsión', value: reason, inline: false },
                    { name: 'Hora de la expulsión', value: `<t:${Math.floor(kickLog.createdTimestamp / 1000)}:F>`, inline: false }
                )
                .setFooter({
                    text: `By: Shaw • ${new Date().toLocaleString('es-ES', { hour12: true })}`,
                    iconURL: 'https://i.imgur.com/8QIckgK.gif'
                });

            await logChannel.send({ embeds: [embedKick] });
        } catch (error) {
            console.error('Error fetching logs:', error);
        }
    }
};

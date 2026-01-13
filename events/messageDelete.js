const { EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = {
    name: 'messageDelete',
    execute: async (client, message) => {
        if (!message.guild) return;

        // Verificar si el mensaje tiene un autor
        if (!message.author || message.author.bot) return;

        // Canal donde se enviarán los registros de eliminación de mensajes
        const logChannel = message.guild.channels.cache.find(channel => channel.name === 'audit-log');
        if (!logChannel) {
            console.error('Audit-log channel not found');
            return;
        }

        // Crear un embed para el registro de eliminación de mensajes
        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('Mensaje Eliminado')
            .addFields(
                { name: 'Autor', value: `@${message.author.tag} - ${message.author}`, inline: true },
                { name: 'Fecha', value: message.createdAt.toLocaleString('es-ES', { hour12: true }), inline: true },
                { name: 'Canal', value: `${message.channel}`, inline: true },
                { name: 'Mensaje Eliminado', value: message.content ? message.content : 'No text content', inline: false }
            )
            .setThumbnail('https://i.imgur.com/gb2TwkW.png')
            .setFooter({ 
                text: `By: Shaw • ${new Date().toLocaleString('es-ES', { hour12: true })}`, 
            })
            .setTimestamp();

        if (message.attachments.size > 0) {
            embed.addFields({ name: 'Attachment URL(s)', value: message.attachments.map(a => a.url).join('\n') });
        }

        try {
            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error al enviar el log de eliminación de mensaje:', error);
        }

        // Aquí es para falso ping
        if (message.mentions.users.size > 0 && Date.now() - message.createdTimestamp < 5000) {
            let executor = 'Desconocido';
            try {
                const fetchedLogs = await message.guild.fetchAuditLogs({
                    limit: 1,
                    type: AuditLogEvent.MessageDelete
                });

                const deletionLog = fetchedLogs.entries.first();
                if (deletionLog 
                    && deletionLog.extra.channel.id === message.channel.id
                    && deletionLog.target.id === message.author.id
                    && deletionLog.createdTimestamp > message.createdTimestamp) {
                    executor = deletionLog.executor.tag;
                } else {
                    executor = message.author.tag + ' (Autoeliminación)';
                }
            } catch (error) {
                console.error('Error fetching audit logs:', error);
            }

            const embedGhostPing = new EmbedBuilder()
                .setColor('#FF4500')
                .setTitle('Ghost Ping Detectado 🚫')
                .setDescription(`Un mensaje mencionando a un usuario fue eliminado rápidamente.`)
                .addFields(
                    { name: 'Autor', value: message.author.tag, inline: true },
                    { name: 'Contenido', value: message.content || 'Sin contenido', inline: true },
                    { name: 'Eliminado por', value: executor, inline: true }
                )
                .setFooter({
                    text: `By: Shaw • ${new Date().toLocaleString('es-ES', { hour12: true })}`,
                    iconURL: 'https://i.imgur.com/1vDzaom.gif'
                })
                .setTimestamp();

            try {
                await logChannel.send({ embeds: [embedGhostPing] });
            } catch (error) {
                console.error('Error al enviar el log de ghost ping:', error);
            }
        }
    }
};
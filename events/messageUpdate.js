const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'messageUpdate',
    event: 'messageUpdate',
    execute: async (client, oldMessage, newMessage) => {
        // Verificar si oldMessage o newMessage no están definidos
        if (!oldMessage || !newMessage) return;
        if (!oldMessage.author || oldMessage.author.bot) return; // Si el autor no existe o es un bot, no continuar

        // Canal donde se enviarán los registros de edición de mensajes
        const logChannel = oldMessage.guild.channels.cache.find(channel => channel.name === 'audit-log');
        if (!logChannel) {
            console.error('Audit-log channel not found');
            return;
        }

        // Crear un embed para el registro de la edición del mensaje
        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('Mensaje Editado')
            .addFields(
                { name: 'Autor', value: `@${oldMessage.author.tag} - ${oldMessage.author}`, inline: true },
                { name: 'Fecha', value: oldMessage.createdAt.toLocaleString('es-ES', { hour12: true }), inline: true },
                { name: 'Canal', value: `${oldMessage.channel}`, inline: true },
                { name: 'Mensaje Anterior', value: oldMessage.content ? oldMessage.content : 'No text content', inline: false },
                { name: 'Mensaje Nuevo', value: newMessage.content ? newMessage.content : 'No text content', inline: false }
            )
            .setThumbnail('https://i.imgur.com/gb2TwkW.png')
            .setFooter({ 
                text: `By: Shaw • ${new Date().toLocaleString('es-ES', { hour12: true })}`, 
            })
            .setTimestamp();

        // Enviar el embed al canal de logs
        try {
            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error al enviar el log de edición de mensaje:', error);
        }
    }
};

const { EmbedBuilder } = require('discord.js');
const config = require('../config.json'); // Asegúrate de que la ruta sea correcta

////////////////////////////// Esto es para autoban

module.exports = {
    name: 'guildMemberRemove',
    execute: async (client, member) => {
        const logChannel = member.guild.channels.cache.get(config.salidas_log);
        if (!logChannel) {
            console.error('El canal especificado en salidas_log no se encontró');
            return;
        }

        try {
            // Banear al usuario
            await member.guild.members.ban(member, { reason: 'Salió del servidor' });
            
            const embed = new EmbedBuilder()
                .setColor('#FF4500')
                .setTitle('Usuario baneado automáticamente')
                .setDescription(`**${member.user.tag}** ha sido baneado por salir del servidor.`)
                .setThumbnail(member.user.displayAvatarURL())
                .addFields(
                    { name: 'Nombre de usuario', value: `${member.user.tag}`, inline: true },
                    { name: 'ID de usuario', value: `${member.user.id}`, inline: true },
                    { name: 'Razón del baneo', value: 'Salió del servidor', inline: false }
                )
                .setFooter({
                    text: `By: Shaw • ${new Date().toLocaleString('es-ES', { hour12: true })}`,
                    iconURL: 'https://i.imgur.com/8QIckgK.gif'
                })
                .setTimestamp();

            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error al banear al usuario o enviar el log:', error);
        }
    }
};

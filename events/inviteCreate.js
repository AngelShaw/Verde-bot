const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'inviteCreate',
    event: 'inviteCreate',
    async execute(client, invite) {
        // Asegúrate de que invite y su propiedad guild sean válidas
        if (!invite || !invite.guild) return;

        // Actualiza la caché de invitaciones
        await invite.guild.invites.fetch();

        // Aquí es log para cuando crean alguna invitación nueva al servidor
        const logChannel = invite.guild.channels.cache.find(channel => channel.name === 'audit-log');

        if (!logChannel) {
            console.log('Audit-log channel not found');
            return;
        }

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('Nueva invitación creada')
            .setThumbnail('https://i.imgur.com/1vDzaom.gif')
            .addFields(
                { name: 'Código invitación', value: invite.code, inline: true },
                { name: 'Invitador', value: invite.inviter ? `<@${invite.inviter.id}>` : 'Desconocido', inline: true },
                { name: 'Canal', value: `<#${invite.channel.id}>`, inline: true },
                { name: 'Expira', value: invite.expiresTimestamp ? new Date(invite.expiresTimestamp).toLocaleString('es-ES') : 'Nunca', inline: true },
                { name: 'Usos máximos', value: invite.maxUses.toString(), inline: true }
            )
            .setTimestamp()
            .setFooter({
                text: `By: Shaw • ${new Date().toLocaleString('es-ES', { hour12: true })}`
            });

        try {
            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error al enviar el registro de invitación:', error);
        }
    },
};

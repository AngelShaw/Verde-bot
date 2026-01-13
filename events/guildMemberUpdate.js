const { EmbedBuilder } = require('discord.js');
const GuildConfig = require('../schemas/guildConfig');
const config = require('../config.json');

module.exports = {
    name: 'guildMemberUpdate',
    async execute(oldMember, newMember) {
        try {
            const guild = newMember.guild;

            // Si el usuario nunca ha boosteado antes, salimos
            if (!newMember.premiumSinceTimestamp) return;

            // Verificar si el usuario ha dado un nuevo boost (la fecha de boost cambia)
            if (oldMember.premiumSinceTimestamp !== newMember.premiumSinceTimestamp) {
                console.log(`[Boost] ${newMember.user.tag} ha dado un nuevo boost al servidor.`);

                // Buscar la configuración del canal de boost en la base de datos
                const guildConfig = await GuildConfig.findOne({ guildId: guild.id });

                if (!guildConfig || !guildConfig.boostChannelId) {
                    console.log(`[Boost] No se encontró un canal de boost configurado para ${guild.name}`);
                    return;
                }

                const boostChannel = guild.channels.cache.get(guildConfig.boostChannelId);
                if (!boostChannel) {
                    console.log(`[Boost] El canal configurado (${guildConfig.boostChannelId}) no existe.`);
                    return;
                }

                // Datos del boost
                const boostLevel = guild.premiumTier;
                const totalBoosts = guild.premiumSubscriptionCount;

                // Crear el embed de agradecimiento por el boost
                const boostEmbed = new EmbedBuilder()
                    .setColor('Purple')
                    .setTitle('💜 ¡Muchas gracias por el Boost! 💜')
                    .setDescription(`> Gracias a **${newMember.user.tag}** por dar un boost al servidor! 🎉\n\n> **¡Gracias por apoyar a nuestra comunidad y que te siga gustando!**`)
                    .addFields(
                        { name: '> **Nivel de Boost Actual:**', value: `**${boostLevel}**`, inline: true },
                        { name: '> **Boosts Totales:**', value: `**${totalBoosts}**`, inline: true }
                    )
                    .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
                    .setImage(config.banner)
                    .setFooter({ text: '¡Gracias por tu apoyo!', iconURL: newMember.user.displayAvatarURL({ dynamic: true }) })
                    .setTimestamp();

                // Enviar el mensaje de boost en el canal configurado
                await boostChannel.send({ embeds: [boostEmbed] });
                console.log(`[Boost] Mensaje enviado en ${boostChannel.name}`);
            }
        } catch (error) {
            console.error('Error en el evento guildMemberUpdate:', error);
        }
    }
};

const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const GuildConfig = require('../../../schemas/guildConfig'); // Asegúrate de ajustar la ruta según tu estructura de archivos
const config = require("../../../config.json")

module.exports = {
    devOnly: true,
    data: new SlashCommandBuilder()
        .setName('eliminarboost')
        .setDMPermission(false)
        .setDescription('Elimina la configuración del canal donde se enviaban los mensajes de boost.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
        
        const guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });

        if (!guildConfig || !guildConfig.boostChannelId) {
            return interaction.reply({
                content: '> **No hay ningún canal de boost configurado para este servidor.**\n> **Usa:** /configurarboost **para configurarlo!**',
                ephemeral: true
            });
        }

        
        await GuildConfig.findOneAndDelete({ guildId: interaction.guild.id });

        
        const embed = new EmbedBuilder()
            .setColor('Purple')
            .setTitle('Canal de Boost Eliminado')
            .setImage(config.banner)
            .setDescription(`**La configuración del canal de boost ha sido eliminada exitosamente.**`)
            .addFields(
                { name: '> **Canal Seleccionado:**', value: `<#${guildConfig.boostChannelId}>`, inline: true },
                { name: '> **Canal ID:**', value: `\`${guildConfig.boostChannelId}\``, inline: true }
            )
            .setThumbnail(client.user.displayAvatarURL())
            .setTimestamp();

        return interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
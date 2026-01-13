const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const GuildConfig = require('../../../schemas/guildConfig'); // Ajusta la ruta según tu estructura de archivos
const config = require('../../../config.json');

module.exports = {
    devOnly: true,
    data: new SlashCommandBuilder()
        .setName('configurarboost')
        .setDMPermission(false)
        .setDescription('Configura el canal donde se enviarán los mensajes de boost.')
        .addChannelOption(option =>
            option.setName('canal')
                .setDescription('Elige el canal de texto para los mensajes de boost')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
        const channel = interaction.options.getChannel('canal');

        let guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });

        if (guildConfig && guildConfig.boostChannelId) {
            const existingChannel = interaction.guild.channels.cache.get(guildConfig.boostChannelId);

            const warningEmbed = new EmbedBuilder()
                .setColor('Purple')
                .setImage(config.banner)
                .setThumbnail(client.user.displayAvatarURL())
                .setTitle('> Canal de Boost Ya Configurado')
                .setDescription(`> **Ya existe un canal configurado para los mensajes de boost:** ${existingChannel}.\n> **¿Deseas eliminarlo y configurar uno nuevo?**`)
                .setFooter({ text: `Solicitado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setTimestamp();

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('confirmar')
                        .setLabel('Eliminar y Configurar Nuevo')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('cancelar')
                        .setLabel('Cancelar')
                        .setStyle(ButtonStyle.Secondary)
                );

            await interaction.reply({ embeds: [warningEmbed], components: [row], ephemeral: true });

            const filter = i => i.user.id === interaction.user.id;
            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async i => {
                if (i.customId === 'confirmar') {
                    guildConfig.boostChannelId = channel.id;
                    await guildConfig.save();

                    const confirmEmbed = new EmbedBuilder()
                        .setColor('Purple')
                        .setTitle('> Nuevo Canal de Boost Configurado')
                        .setThumbnail(client.user.displayAvatarURL())
                        .setDescription(`> **El nuevo canal para los mensajes de boost es** ${channel}.`)
                        .setFooter({ text: `Configurado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                        .setTimestamp();

                    await i.update({ embeds: [confirmEmbed], components: [], ephemeral: true });
                    collector.stop();
                } else if (i.customId === 'cancelar') {
                    await i.update({ content: '> **La configuración no ha sido modificada.**', components: [], ephemeral: true });
                    collector.stop();
                }
            });

            collector.on('end', () => {
                interaction.editReply({ components: [] }).catch(() => {});
            });

            return;
        }

        if (!guildConfig) {
            guildConfig = new GuildConfig({
                guildId: interaction.guild.id,
                boostChannelId: channel.id,
            });
        } else {
            guildConfig.boostChannelId = channel.id;
        }
        await guildConfig.save();

        const embed = new EmbedBuilder()
            .setColor('Purple')
            .setTitle('Canal de Boost Configurado')
            .setImage(config.banner)
            .setDescription(`> El canal para los mensajes de boost ha sido configurado exitosamente.`)
            .addFields(
                { name: '> **Canal Seleccionado:**', value: `${channel}`, inline: true },
                { name: '> **Canal ID:**', value: `\`${channel.id}\``, inline: true }
            )
            .setThumbnail(client.user.displayAvatarURL())
            .setFooter({ text: `Configurado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('previa')
                    .setLabel('Vista Previa')
                    .setStyle(ButtonStyle.Secondary)
            );

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

        const filter = i => i.customId === 'previa' && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async i => {
            if (i.customId === 'previa') {
                const boostLevel = interaction.guild.premiumTier;
                const totalBoosts = interaction.guild.premiumSubscriptionCount;

                const previo = new EmbedBuilder()
                    .setColor('Purple')
                    .setTitle('> 💜Muchas gracias por el Boost!💜')
                    .setDescription(`> Gracias a **${interaction.user.tag}** le dio un boost a nuestro servidor!\n\n> **¡Gracias por apoyar a nuestra comunidad y que te siga gustando!**`)
                    .addFields(
                        { name: '> **Nivel de Boost Actual:**', value: `**${boostLevel}**`, inline: true },
                        { name: '> **Boosts Totales:**', value: `**${totalBoosts}**`, inline: true }
                    )
                    .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                    .setImage(config.banner)
                    .setFooter({ text: '¡Gracias por tu apoyo!', iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                    .setTimestamp();

                await i.update({ embeds: [previo], components: [], ephemeral: true });
                collector.stop();
            }
        });

        collector.on('end', () => {
            interaction.editReply({ components: [] }).catch(() => {});
        });
    },
};
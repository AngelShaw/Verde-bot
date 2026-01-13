const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const schema = require("../../../schemas/antilinks-enabled");

module.exports = {
    devOnly: true,
    data: new SlashCommandBuilder()
        .setName("automod")
        .setDescription("Sistema Automod del bot")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false)
        .addSubcommand(sub =>
            sub.setName("antilinks")
                .setDescription("Activa o desactiva el sistema AntiLinks en el servidor"))
        .addSubcommand(sub =>
            sub.setName("anti-invi")
                .setDescription("Activa o desactiva el sistema Anti-Invites en el servidor"))
        .addSubcommand(sub =>
            sub.setName("lista-blanca")
                .setDescription("Agrega un dominio permitido")
                .addStringOption(opt =>
                    opt.setName("dominio")
                        .setDescription("Dominio permitido, ejemplo: youtube.com")
                        .setRequired(true)))
        .addSubcommand(sub =>
            sub.setName("no-audit")
                .setDescription("Selecciona los canales que no serán auditados"))
        .addSubcommand(sub =>
            sub.setName("bloquear-palabras")
                .setDescription("Bloquea una palabra en el servidor usando AutoMod")
                .addStringOption(opt =>
                    opt.setName("palabra")
                        .setDescription("La palabra que deseas bloquear")
                        .setRequired(true))),
                        
    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const db = await schema.findOne({ guildId: interaction.guild.id }) || await schema.create({
            guildId: interaction.guild.id,
            enabled: false,
            whitelist: [],
            ignoredChannels: [],
            antiInviteEnabled: false,
        });

        if (sub === "antilinks") {
            db.enabled = !db.enabled;
            await db.save();

            const embed = new EmbedBuilder()
                .setColor(db.enabled ? "Green" : "Red")
                .setTitle("Sistema AntiLinks")
                .setDescription(`El sistema ha sido **${db.enabled ? "activado" : "desactivado"}**.`);

            return interaction.reply({
                embeds: [embed],
                flags: 64
            });
        }

        if (sub === "anti-invi") {
            db.antiInviteEnabled = !db.antiInviteEnabled;
            await db.save();

            const embed = new EmbedBuilder()
                .setColor(db.antiInviteEnabled ? "Green" : "Red")
                .setTitle("Sistema Anti-Invites")
                .setDescription(`El sistema Anti-Invites ha sido **${db.antiInviteEnabled ? "activado" : "desactivado"}**.`);

            return interaction.reply({
                embeds: [embed],
                flags: 64
            });
        }

        if (sub === "lista-blanca") {
            const dominio = interaction.options.getString("dominio").toLowerCase();
            const cleanDomain = dominio.replace(/^https?:\/\//, '').replace(/^www\./, '').toLowerCase();

            if (!db.whitelist) db.whitelist = [];

            if (db.whitelist.includes(cleanDomain)) {
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setColor("Red")
                        .setTitle("Dominio ya existente")
                        .setDescription(`⚠️ El dominio \`${dominio}\` ya se encuentra en la lista blanca.`)],
                    flags: 64
                });
            }

            db.whitelist.push(cleanDomain);
            await db.save();

            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor("Blue")
                    .setTitle("Dominio agregado")
                    .setDescription(`✅ Se ha agregado \`${dominio}\` a la lista blanca.`)],
                flags: 64
            });
        }

        if (sub === "no-audit") {
            const textChannels = interaction.guild.channels.cache.filter(c => c.type === 0);
            const options = textChannels.map(c => ({
                label: c.name,
                value: c.id,
                default: db.ignoredChannels.includes(c.id)
            })).slice(0, 25);

            const row = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`IgnoreAudit_${interaction.user.id}`)
                    .setMinValues(0)
                    .setMaxValues(options.length)
                    .addOptions(options)
            );

            await interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor("Yellow")
                    .setTitle("Canales ignorados")
                    .setDescription("Selecciona los canales que **no** serán auditados.")],
                components: [row],
                flags: 64
            });

            const filter = i => i.customId === `IgnoreAudit_${interaction.user.id}` && i.user.id === interaction.user.id;
            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

            collector.on('collect', async i => {
                db.ignoredChannels = i.values;
                await db.save();

                await i.update({
                    embeds: [new EmbedBuilder()
                        .setColor("Green")
                        .setTitle("Canales Ignorados Actualizados")
                        .setDescription(`✅ Se han actualizado los canales que no serán auditados.`)],
                    components: [],
                });
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    interaction.followUp({
                        content: "⏳ No se seleccionaron canales a tiempo. La selección ha sido cancelada.",
                        flags: 64
                    });
                }
            });
        }

        if (sub === "bloquear-palabras") {
            const palabra = interaction.options.getString("palabra").toLowerCase();
        
            try {
                const reglas = await interaction.guild.autoModerationRules.fetch();
                let regla = reglas.find(r =>
                    r.name === "Bloqueo de palabras" &&
                    r.creatorId === interaction.client.user.id &&
                    r.triggerType === 1
                );
        
                if (regla) {
                    const palabrasActuales = regla.triggerMetadata.keywordFilter || [];
        
                    if (palabrasActuales.includes(palabra)) {
                        return interaction.reply({
                            content: `⚠️ La palabra \`${palabra}\` ya está bloqueada.`,
                            flags: 64
                        });
                    }
        
                    palabrasActuales.push(palabra);
        
                    await regla.edit({
                        triggerMetadata: { keywordFilter: palabrasActuales }
                    });
        
                    return interaction.reply({
                        embeds: [new EmbedBuilder()
                            .setColor("Red")
                            .setTitle("Palabra Bloqueada")
                            .setDescription(`✅ Se ha agregado \`${palabra}\` a la regla de bloqueo existente.`)],
                        flags: 64
                    });
        
                } else {
                    await interaction.guild.autoModerationRules.create({
                        name: "Bloqueo de palabras",
                        creatorId: interaction.client.user.id,
                        eventType: 1,
                        triggerType: 1,
                        triggerMetadata: {
                            keywordFilter: [palabra]
                        },
                        actions: [
                            {
                                type: 1,
                                metadata: {
                                    customMessage: "⚠️ Esa palabra está prohibida en este servidor."
                                }
                            }
                        ],
                        enabled: true,
                        exemptRoles: [],
                        exemptChannels: []
                    });
        
                    return interaction.reply({
                        embeds: [new EmbedBuilder()
                            .setColor("Red")
                            .setTitle("Palabra Bloqueada")
                            .setDescription(`✅ Se ha creado una nueva regla de AutoMod con la palabra: \`${palabra}\`.`)],
                        flags: 64
                    });
                }
            } catch (error) {
                console.error("Error gestionando la regla AutoMod:", error);
                return interaction.reply({
                    content: "❌ Ocurrió un error al crear o actualizar la regla de AutoMod.",
                    flags: 64
                });
            }
        }        
    }
};

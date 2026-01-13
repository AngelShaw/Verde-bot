const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    devOnly: true,
    data: new SlashCommandBuilder()
        .setName('solo-yt')
        .setDMPermission(false)
        .setDescription('solo-yt')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction, client) {
        const schema = require(`${process.cwd()}/schemas/solo-yt.js`);
        let db = await schema.findOne({ guildId: interaction.guild.id });
        let textChannels = [];
        
        if (!db) {
            await new schema({ guildId: interaction.guild.id, channels: [] }).save();
            db = await schema.findOne({ guildId: interaction.guild.id });
        };
        
        (await interaction.guild.channels.fetch())
            .filter((channel) => channel.type === 0)
            .reduce((acc, channel) => {
                const isInDb = db.channels.includes(channel.id);

                const obj = {
                    label: `${channel.name}`,
                    emoji: "#️⃣",
                    default: isInDb,
                    value: channel.id
                };

                if (channel.id === interaction.channel.id) return acc;

                if (isInDb) {
                    textChannels.unshift(obj);
                } else {
                    textChannels.push(obj);
                }

                return acc;
            }, textChannels);

        textChannels.unshift({
            label: `${interaction.channel.name} (Aquí)`,
            emoji: "#️⃣",
            default: db.channels.includes(interaction.channel.id),
            value: interaction.channel.id
        });

        if (textChannels.length > 25) textChannels = textChannels.slice(0, 25);

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("#CB1BFF")
                    .setTitle("Selecciona un canal para auditar")
                    .setDescription('El canal seleccionado eliminará lo que no sean links de YouTube. El bot solo permitirá enlaces válidos de YouTube en ese canal.')
            ],
            components: [
                new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId(`OnlyYT_${interaction.user.id}`)
                        .addOptions(textChannels)
                        .setMaxValues(textChannels.length)
                )
            ],
            flags: 64
        });
    }
}
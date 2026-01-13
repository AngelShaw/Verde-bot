module.exports = {
    name: "interactionCreate",
    async execute(client, interaction) {
        if (!interaction.isStringSelectMenu() || !interaction.customId.startsWith("OnlyYT")) return;

        const { EmbedBuilder } = require("discord.js");

        const schema = require(`${process.cwd()}/schemas/solo-yt.js`);
        let db = await schema.findOne({ guildId: interaction.guild.id });
        const userId = interaction.customId.split("_")[1];

        if (!db) {
            await new schema({ guildId: interaction.guild.id, channels: [] }).save();
            db = await schema.findOne({ guildId: interaction.guild.id });
        }

        if (userId !== interaction.user.id) return interaction.deferUpdate();

        await schema.findOneAndUpdate({ guildId: interaction.guild.id }, { channels: interaction.values })

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("#CB1BFF")
                    .setTitle(`Los canales han sido guardados correctamente!`)
                    .setDescription('Ahora el canal seleccionado será auditado por el bot. Solo se auditará este canal.')
            ],
            flags: 64
        });
    }
};

const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const translate = require('@iamtraction/google-translate');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("traducir")
        .setDMPermission(false)
        .setDescription("Traduce textos a algún otro idioma.")
        .addStringOption(option =>
            option.setName("texto")
                .setDescription("Escribe la palabra a traducir")
                .setRequired(true)
                .setMinLength(2)
                .setMaxLength(4000))
        .addStringOption(option =>
            option.setName("idioma")
                .setDescription("Selecciona el idioma a traducir.")
                .setRequired(true)
                .addChoices(
                    { name: "Inglés", value: "en" },
                    { name: "Español", value: "es" },
                    { name: "Francés", value: "fr" },
                    { name: "Alemán", value: "de" },
                    { name: "Italiano", value: "it" },
                    { name: "Japonés", value: "ja" },
                    { name: "Chino", value: "zh-CN" },
                    { name: "Coreano", value: "ko" },
                    { name: "Húngaro", value: "hu" },
                    { name: "Ruso", value: "ru" },
                    { name: "Hindi", value: "hi" },
                    { name: "Holandés", value: "nl" },
                    { name: "Sueco", value: "sv" },
                    { name: "Turco", value: "tr" },
                    { name: "Polaco", value: "pl" },
                    { name: "Griego", value: "el" },
                    { name: "Checo", value: "cs" },
                    { name: "Finlandés", value: "fi" },
                    { name: "Rumano", value: "ro" },
                    { name: "Eslovaco", value: "sk" },
                    { name: "Ucraniano", value: "uk" },
                    { name: "Croata", value: "hr" },
                    { name: "Árabe", value: "ar" },
                    { name: "Hebreo", value: "iw" },
                    { name: "Esloveno", value: "sl" }
                )),

    async execute(interaction) {
        const texto = interaction.options.getString("texto");
        const lenguaje = interaction.options.getString("idioma");

        await interaction.reply({ content: "🎮 Traduciendo tu texto..." });
        try {
            const applied = await translate(texto, { to: lenguaje });
            const embed = new EmbedBuilder()
                .setColor("#CB1BFF")
                .setDescription(`🎮 | **Mensaje traducido**\n\n**Tu texto:**\n\`\`\`${texto}\`\`\`\n**Texto traducido:**\n\`\`\`${applied.text}\`\`\``);
            await interaction.editReply({ content: "", embeds: [embed] });
        } catch (error) {
            await interaction.editReply({ content: "Hubo un error al traducir el texto.", embeds: [] });
        }
    }
};

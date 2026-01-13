const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('random')
        .setDMPermission(false)
        .setDescription("El bot te dará un número al azar del 1 al 100"),

    async execute(interaction) {
        const randomNum = Math.floor((Math.random() * 100));
        const embed = new EmbedBuilder()
            .setTitle(`Numero Aleatorio`)
            .setDescription(`Tu numero aleatorio es: ${randomNum}`)
            .setFooter({ text: '💢Gracias por usar el comando!💢' })
            .setColor("#CB1BFF")
        interaction.reply({ embeds: [embed] });
    }
}

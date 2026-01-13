const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName("cumpleaños")
    .setDMPermission(false)
    .setDescription("Celebra tu cumpleaños"),


async execute(interaction, client) {
        
        // Construir la tarjeta de cumpleaños
        const tarjeta = new EmbedBuilder()
            .setColor('#CB1BFF') // Color dorado
            .setTitle(`¡Feliz Cumpleaños, ${interaction.user.username}! 🎉🎂`)
            .setDescription(`Que tengas un día lleno de alegría y celebración.`)
            .setImage('https://i.imgur.com/iiHvEDJ.gif') // URL de una imagen divertida de cumpleaños
            .setFooter({ text:'¡Disfruta tu día especial!' }); // URL de un logo divertido

        // Enviar la tarjeta como un mensaje
        interaction.reply({ embeds: [tarjeta] });
    },
};

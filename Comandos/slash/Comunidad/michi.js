const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const axios = require("axios");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("michi")
        .setDMPermission(false)
        .setDescription("Genera fotos de Michis."),
    async execute(interaction) {
        try {
            const respuesta = await axios.get('https://api.thecatapi.com/v1/images/search');
            const url = respuesta.data[0].url;
            const mensajeEmbed = new EmbedBuilder()
                .setTitle('Aquí está tu michi 🐈')
                .setImage(url)
                .setColor("#CB1BFF")
                .setFooter({ text: `Pedido por ${interaction.user.tag}` })
                .setTimestamp();
            
            await interaction.reply({ embeds: [mensajeEmbed] });
        } catch (error) {
            console.error('Error al obtener la imagen del gato:', error);
            await interaction.reply({ content: 'Lo siento, no pude obtener una imagen del gato en este momento.', ephemeral: true });
        }
    }
}

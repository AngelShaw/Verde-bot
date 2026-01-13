const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('banana')
        .setDescription('🍌 Mide tu banana')
        .setDMPermission(false), // 🚫 Evita que el comando aparezca en mensajes directos

    async execute(interaction) {
        try {
            const randomSize = Math.floor(Math.random() * 30) + 1; // Genera un número aleatorio entre 1 y 30

            const embed = new EmbedBuilder()
                .setTitle(`La banana de ${interaction.user.username} mide ${randomSize} cm`)
                .setDescription('🍌 Mide tu banana')
                .setImage('https://i.imgur.com/yAdRUYr.png')
                .setColor(0xCB1BFF) // Color fijo CB1BFF
                .setFooter({ text: `Pedido por ${interaction.user.tag}` });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error al ejecutar el comando "banana":', error);
            await interaction.reply({ content: 'Hubo un error al ejecutar este comando!', ephemeral: true });
        }
    }
};

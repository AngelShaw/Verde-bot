const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDMPermission(false)
        .setDescription('Mostrar ping del servidor.'),
    async execute(interaction) {
        let circles = {
            good: '🟢',
            okay: '🟡',
            bad: '🔴',
        };

        await interaction.deferReply(); // Defer the reply before editing

        const pinging = await interaction.editReply({ content: 'Obteniendo ping...' });

        const ws = interaction.client.ws.ping; // websocket ping
        const msgEdit = Date.now() - pinging.createdTimestamp; // api latency

        // uptime
        let days = Math.floor(interaction.client.uptime / 86400000);
        let hours = Math.floor(interaction.client.uptime / 3600000) % 24;
        let minutes = Math.floor(interaction.client.uptime / 60000) % 60;
        let seconds = Math.floor(interaction.client.uptime / 1000) % 60;

        const wsEmoji = ws <= 100 ? circles.good : ws <= 200 ? circles.okay : circles.bad;
        const msgEmoji = msgEdit <= 200 ? circles.good : circles.bad;

        const server = interaction.guild; // Obtén la información del servidor
        const serverIcon = server.iconURL({ size: 64 }); // Obtén la URL de la imagen del servidor

        const pingEmbed = new EmbedBuilder()
            .setTitle(`${server.name}`) // Establece el título con el nombre del servidor
            .setThumbnail(serverIcon) // Establece la imagen del servidor como miniatura
            .setColor('#CB1BFF')
            .setTimestamp()
            .setFooter({ text: `Pedido por ${interaction.user.tag}` })
            .addFields(
                {
                    name: 'Websocket Latencia',
                    value: `${wsEmoji} \`${ws}ms\``,
                },
                {
                    name: 'API Latencia',
                    value: `${msgEmoji} \`${msgEdit}ms\``,
                },
                {
                    name: `Tiempo Online`,
                    value: `🕛 \`${days} dias, ${hours} horas, ${minutes} minutos, ${seconds} segundos\``,
                }
            );

        await pinging.edit({ embeds: [pingEmbed], content: '\u200b' });
    },
};

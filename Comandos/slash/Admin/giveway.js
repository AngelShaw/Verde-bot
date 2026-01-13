const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const Giveaway = require('../../../schemas/New/giveaway');
const { generateRandomCode } = require('../../../Extras/giveaway/giveawayfuntion');
const { scheduleGiveaway } = require('../../../Extras/giveaway/scheduleGiveaway');

module.exports = {
    devOnly: true,
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setDMPermission(false)
        .setDescription('Crear un sorteo')
        .addStringOption(option =>
            option.setName('duracion')
                .setDescription('Duración del sorteo')
                .setRequired(true)
                .addChoices(
                    { name: "2 minutos", value: "120000" },
                    { name: "15 minutos", value: "900000" },
                    { name: "30 minutos", value: "1800000" },
                    { name: "45 minutos", value: "2700000" },
                    { name: "6 horas", value: "21600000" },
                    { name: "12 horas", value: "43200000" },
                    { name: "1 día", value: "86400000" },
                    { name: "2 días", value: "172800000" },
                    { name: "3 días", value: "259200000" },
                    { name: "4 días", value: "345600000" },
                    { name: "5 días", value: "432000000" },
                    { name: "6 días", value: "518400000" },
                    { name: "7 días", value: "604800000" }
                ))
        .addStringOption(option =>
            option.setName('premio')
                .setDescription('El premio del sorteo')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('cantidad_ganadores')
                .setDescription('Número de ganadores')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('canal')
                .setDescription('El canal donde se publicará el sorteo')
                .setRequired(true))
        .addStringOption(option => // Nueva opción para el título del sorteo
            option.setName('titulo')
                .setDescription('Título del sorteo')
                .setRequired(false)),  
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: 'No tienes permisos para usar este comando.', ephemeral: true });
        }

        const duracion = interaction.options.getString('duracion');
        const premio = interaction.options.getString('premio');
        const cantidad_ganadores = interaction.options.getInteger('cantidad_ganadores');
        const canal = interaction.options.getChannel('canal');
        const titulo = interaction.options.getString('titulo'); // Obtener el título opcional
        const host = interaction.user; 

        const endTime = new Date(Date.now() + parseInt(duracion));
        const giveawayID = generateRandomCode(10);

        const embed = new EmbedBuilder()
            .setColor('#CB1BFF')
            .setTitle(titulo || '🎉 **SORTEO** 🎉') // Usar el título personalizado si se proporciona, de lo contrario, usar el predeterminado
            .setDescription(`**Premio:** ${premio}\n\n**Host:** <@${host.id}>\n\n**Finaliza:** <t:${Math.floor(endTime.getTime() / 1000)}:F>\n\n**Cantidad de ganadores:** ${cantidad_ganadores}\n\n**ID del sorteo:** ${giveawayID}\n\n¡Reacciona con 🎉 para participar!`)
            .setFooter({ text: 'Buena suerte a todos!' });

        const message = await canal.send({ embeds: [embed] });

        const giveaway = new Giveaway({
            guildId: interaction.guild.id,
            channelId: canal.id,
            messageId: message.id,
            endTime: endTime,
            prize: premio,
            winnersCount: cantidad_ganadores,
            participants: [],
            id: giveawayID,
            ended: false,
        });

        await giveaway.save();

        interaction.reply({ content: `El sorteo ha sido creado en ${canal}`, ephemeral: true });

        await message.react('🎉');

        scheduleGiveaway(client, giveaway);

        // Enviar la mención @everyone después de enviar el embed
        canal.send('@everyone');
    },
};

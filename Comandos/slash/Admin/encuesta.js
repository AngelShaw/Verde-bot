const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionsBitField } = require('discord.js');
const Poll = require('../../../schemas/PollSchema'); // Importar el esquema de Mongoose
const { v4: uuidv4 } = require('uuid');

module.exports = {
    devOnly: true,
    data: new SlashCommandBuilder()
        .setName('encuesta')
        .setDMPermission(false)
        .setDescription('Para crear una encuesta')
        .addStringOption(option => option.setName('title').setDescription('Titulo de encuesta').setRequired(true))
        .addStringOption(option => option.setName('option1').setDescription('Opcion 1').setRequired(true))
        .addStringOption(option => option.setName('option2').setDescription('Opcion 2').setRequired(true))
        .addStringOption(option => option.setName('option3').setDescription('Opcion 3').setRequired(false))
        .addStringOption(option => option.setName('option4').setDescription('Opcion 4').setRequired(false))
        .addStringOption(option => option.setName('option5').setDescription('Opcion 5').setRequired(false))
        .addStringOption(option => option.setName('image_url').setDescription('URL para imagen').setRequired(false)),

    async execute(interaction) {
        const pollTitle = interaction.options.getString('title');
        const options = [
            interaction.options.getString('option1'),
            interaction.options.getString('option2'),
            interaction.options.getString('option3'),
            interaction.options.getString('option4'),
            interaction.options.getString('option5')
        ].filter(opt => opt);

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return await interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
        }

        const imageUrl = interaction.options.getString('image_url');
        const pollId = uuidv4(); // Generar un ID único para la encuesta
        const guildId = interaction.guild.id; // Obtener el ID del servidor

        const emojis = ['🇦', '🇧', '🇨', '🇩', '🇪'];
        
        // Crear un nuevo embed para mostrar la encuesta
        const embed = new EmbedBuilder()
            .setTitle(pollTitle)
            .setColor('#CB1BFF')
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .setFooter({ text: 'Gracias por votar 👻' })
            .addFields(
                options.map((option, index) => ({
                    name: `${emojis[index]}: ${option} - 0 votos`, // Mostrar 0 votos inicialmente
                    value: '▒▒▒▒▒▒▒▒▒▒ 0.0%', // Mostrar barra de progreso inicial
                    inline: false
                }))
            );

        if (imageUrl) {
            embed.setImage(imageUrl);
        }

        embed.addFields({ name: 'Autor:', value: `> ${interaction.user}`, inline: false });

        const pollRow = new ActionRowBuilder();
        options.forEach((_, index) => {
            pollRow.addComponents(
                new ButtonBuilder()
                    .setCustomId(`${pollId}_option${index + 1}`)
                    .setLabel(emojis[index])
                    .setStyle(ButtonStyle.Secondary)
            );
        });

        const pollMsg = await interaction.reply({ embeds: [embed], components: [pollRow], fetchReply: true });
        await interaction.channel.send('@everyone');

        // Guardar la encuesta en la base de datos con el guildId
        const newPoll = new Poll({
            pollId,
            title: pollTitle,
            options: options.map(option => ({ text: option, votes: 0, voters: [] })),
            authorId: interaction.user.id,
            messageId: pollMsg.id,
            channelId: interaction.channel.id,
            guildId: interaction.guild.id, // Guardar la guildId
            imageUrl
        });
        
        await newPoll.save();
        

        // Colector para manejar las interacciones
        const collector = pollMsg.createMessageComponentCollector();

        collector.on('collect', async (i) => {
            if (!i.isButton()) return;
            const optionIndex = parseInt(i.customId.split('_option')[1]) - 1;

            const pollData = await Poll.findOne({ pollId });

            if (!pollData || optionIndex < 0 || optionIndex >= pollData.options.length) {
                return await i.reply({ content: 'Opción no válida.', ephemeral: true });
            }

            const previousVoteIndex = pollData.options.findIndex(opt => opt.voters.includes(i.user.id));
            // Si el usuario ya votó por otra opción, quitar el voto anterior
            if (previousVoteIndex !== -1) {
                pollData.options[previousVoteIndex].votes--;
                pollData.options[previousVoteIndex].voters = pollData.options[previousVoteIndex].voters.filter(voter => voter !== i.user.id);
            }

            // Agregar el nuevo voto
            pollData.options[optionIndex].votes++;
            pollData.options[optionIndex].voters.push(i.user.id);
            await pollData.save();

            const totalVotes = pollData.options.reduce((sum, opt) => sum + opt.votes, 0);
            const updatedFields = pollData.options.map((opt, index) => {
                const percentage = totalVotes > 0 ? ((opt.votes / totalVotes) * 100).toFixed(1) : 0.0;
                const progressBar = '█'.repeat(percentage / 10) + '▒'.repeat(10 - percentage / 10);
                return {
                    name: `${emojis[index]}: ${opt.text} - ${opt.votes} votos`, // Mostrar votos actuales
                    value: `${progressBar} ${percentage}%`, // Mostrar barra de progreso actualizada
                    inline: false
                };
            });

            updatedFields.push({ name: 'Autor:', value: `> ${interaction.user}`, inline: false });
            embed.setFields(updatedFields);

            await pollMsg.edit({ embeds: [embed] });
            await i.deferUpdate();
        });

        collector.on('end', async () => {
            // Deshabilitar botones cuando termine el tiempo del colector
            const disabledRow = new ActionRowBuilder();
            pollRow.components.forEach(component => {
                disabledRow.addComponents(
                    ButtonBuilder.from(component).setDisabled(true)
                );
            });
            await pollMsg.edit({ components: [disabledRow] });
        });
    }
};
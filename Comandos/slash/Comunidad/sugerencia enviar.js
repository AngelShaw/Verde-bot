const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const suggestion = require('../../../schemas/suggestionSchema');
const formatResults = require('../../../Extras/sugerencias/formatResults');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sugerencia')
        .setDMPermission(false)
        .setDescription('Envía una sugerencia para administradores y usuarios.')
        .addStringOption(option => 
            option.setName('sugerencia')
                .setDescription('Ingresa una sugerencia.')
                .setRequired(true)),
    async execute(interaction) {
        const { options } = interaction;
        const suggestmsg = options.getString('sugerencia');
        const Data = await suggestion.findOne({ GuildID: interaction.guild.id });

        if (!Data) {
            return await interaction.reply({ content: `¡No tienes un canal de sugerencias **configurado**!`, ephemeral: true });
        } else {
            const channelID = Data.ChannelID; // Obtener el ID del canal desde la base de datos
            const channel = interaction.guild.channels.cache.get(channelID);

            if (!channel) {
                return await interaction.reply({ content: `¡No se pudo encontrar el canal de sugerencias configurado!`, ephemeral: true });
            }

            await interaction.reply({ content: `¡Tu sugerencia ha sido enviada!`, ephemeral: true });

            const num1 = Math.floor(Math.random() * 256);
            const num2 = Math.floor(Math.random() * 256);
            const num3 = Math.floor(Math.random() * 256);
            const num4 = Math.floor(Math.random() * 256);
            const num5 = Math.floor(Math.random() * 256);
            const num6 = Math.floor(Math.random() * 256);
            const SuggestionID = `${num1}${num2}${num3}${num4}${num5}${num6}`;

            const suggestionembed = new EmbedBuilder()
                .setAuthor({ name: `💥Nueva sugerencia enviada💥`, iconURL: interaction.guild.iconURL({ size: 256 })})
                .setColor('#CB1BFF')
                .setThumbnail(interaction.user.displayAvatarURL({ size: 512 }))
                .setTitle(`Sugerencia por **${interaction.user.username}**`)
                .setDescription(`> ${suggestmsg}`)
                .setTimestamp()
                .setFooter({ text: `ID de Sugerencia: ${SuggestionID}`})
                .addFields({ name: 'Votos a favor', value: '**Sin votos**', inline: true})
                .addFields({ name: 'Votos en contra', value: '**Sin votos**', inline: true})
                .addFields({ name: `Votos`, value: formatResults() })
                .addFields({ name: 'Autor', value: `> ${interaction.user}`, inline: false})

            const button = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('upv')
                        .setEmoji('<a:up:1285398274198732881>')
                        .setLabel('Voto a favor')
                        .setStyle(ButtonStyle.Secondary),

                    new ButtonBuilder()
                        .setCustomId('downv')
                        .setEmoji('<a:down:1285398314946400350>')
                        .setLabel('Voto en contra')
                        .setStyle(ButtonStyle.Secondary),

                    new ButtonBuilder()
                        .setCustomId('totalvotes')
                        .setEmoji('💭')
                        .setLabel('Votos')
                        .setStyle(ButtonStyle.Secondary)
                )

            const msg = await channel.send({ 
                content: `Sugerencia de ${interaction.user}`, 
                embeds: [suggestionembed], 
                components: [button] 
            });
            msg.createMessageComponentCollector();

            await suggestion.create({
                Msg: msg.id,
                GuildID: interaction.guild.id,
                AuthorID: interaction.user.id,
                ChannelID: channel.id,
                upvotes: 0,
                downvotes: 0,
                Upmembers: [],
                Downmembers: []
            });
        }
    }
};

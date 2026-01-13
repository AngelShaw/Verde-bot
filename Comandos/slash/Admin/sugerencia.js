const { SlashCommandBuilder, EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const suggestion = require('../../../schemas/suggestionSchema');

module.exports = {
    devOnly: true,
    data: new SlashCommandBuilder()
        .setName('suge')
        .setDMPermission(false)
        .setDescription('Configura o deshabilita el sistema de sugerencias.')
        .addSubcommand(command => 
            command.setName('setup')
                .setDescription('Configura un canal de sugerencias.')
                .addChannelOption(option => 
                    option.setName('canal')
                        .setDescription('Ingresa un canal.')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)))
        .addSubcommand(command => 
            command.setName('disable')
                .setDescription('Deshabilita un canal de sugerencias que ya existe.')),
    async execute(interaction) {
        const { options } = interaction;
        const sub = options.getSubcommand();
        const Data = await suggestion.findOne({ GuildID: interaction.guild.id });
        const member = interaction.member;

        switch (sub) {
            case 'setup':
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
                    const embed = new EmbedBuilder()
                        .setColor("Red")
                        .setTitle("Error")
                        .setDescription("❌ No tienes permiso para usar este comando.")
                        .setFooter({ text: `${interaction.client.user.tag} || ${interaction.client.ws.ping}Ms`, iconURL: interaction.client.user.displayAvatarURL() });
                    return await interaction.reply({ embeds: [embed], ephemeral: true });
                }

                if (Data) {
                    return await interaction.reply({ content: `¡Ya tienes un canal de sugerencias **configurado**!`, ephemeral: true });
                } else {
                    const channel = options.getChannel('canal');
                    await suggestion.create({
                        GuildID: interaction.guild.id,
                        ChannelID: channel.id
                    });

                    const embed = new EmbedBuilder()
                        .setColor('Green')
                        .setAuthor({ name: `💥Nueva sugerencia enviada💥`})
                        .setTitle('¡Éxito!')
                        .setDescription(`:white_check_mark:・El sistema de sugerencias se ha **configurado** correctamente en ${channel}!`);

                    await interaction.reply({ embeds: [embed], ephemeral: true });
                }
                break;

            case 'disable':
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
                    const embed = new EmbedBuilder()
                        .setColor("Red")
                        .setTitle("Error")
                        .setDescription("❌ No tienes permiso para Ocupar este comando")
                        .setFooter({ text: `${interaction.client.user.tag} || ${interaction.client.ws.ping}Ms`, iconURL: interaction.client.user.displayAvatarURL() });
                    return await interaction.reply({ embeds: [embed], ephemeral: true });
                }

                const channel = options.getChannel('canal') || interaction.channel;

                if (!Data) {
                    return await interaction.reply({ content: `¡No tienes un canal de sugerencias **configurado**!`, ephemeral: true });
                } else {
                    await suggestion.deleteMany({
                        GuildID: interaction.guild.id,
                        ChannelID: channel.id
                    });

                    const embed = new EmbedBuilder()
                        .setColor('Green')
                        .setAuthor({ name: `💥Nueva sugerencia enviada💥`})
                        .setTitle('¡Éxito!')
                        .setDescription(`:white_check_mark:・El sistema de sugerencias se ha **deshabilitado** correctamente!`);

                    await interaction.reply({ embeds: [embed], ephemeral: true });
                }
                break;
        }
    }
};
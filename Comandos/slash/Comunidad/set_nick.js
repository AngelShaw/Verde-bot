const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setnick')
        .setDMPermission(false)
        .setDescription('Establece el apodo de un miembro del servidor')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Miembro al que se le cambiará el apodo')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('nickname')
                .setDescription('Nuevo apodo')
                .setRequired(true)),

    async execute(interaction) {
        const { member, guild } = interaction;
        const usuario = interaction.options.getUser('usuario');
        const pancho = interaction.options.getString('nickname');
        const juan = interaction.user;

        try {
            const pepe = await guild.members.fetch(usuario.id);

            if (!pepe) {
                const errorEmbed = new EmbedBuilder()
                    .setColor("#CB1BFF")
                    .setTitle('Error')
                    .setDescription('El usuario no es un miembro del servidor.');

                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                return;
            }

            const adminRole = guild.roles.cache.find(role => role.name === 'Administrador'); // Ajusta esto al nombre de tu rol
            const modRole = guild.roles.cache.find(role => role.name === 'Moderador'); // Ajusta esto al nombre de tu rol

            const isAdminOrMod = member.roles.cache.has(adminRole?.id) || member.roles.cache.has(modRole?.id);
            const targetIsAdminOrMod = pepe.roles.cache.has(adminRole?.id) || pepe.roles.cache.has(modRole?.id);

            if (!isAdminOrMod && targetIsAdminOrMod) {
                const errorEmbed = new EmbedBuilder()
                    .setColor("#CB1BFF")
                    .setTitle('Error')
                    .setDescription('No puedes cambiar el apodo de un administrador o moderador.');

                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                return;
            }

            await pepe.setNickname(pancho);

            const successEmbed = new EmbedBuilder()
                .setColor("#CB1BFF")
                .setTitle('Apodo cambiado :white_check_mark:')
                .setDescription(`El apodo de **${pepe.user.username}** ha sido cambiado a **"${pancho}"** en el servidor.`)
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setTimestamp()
                .setFooter({ text: `User ID: ${juan.id}`, iconURL: 'https://i.imgur.com/1vDzaom.gif' });

            await interaction.reply({ content: `<@${usuario.id}>`, embeds: [successEmbed] });
        } catch (error) {
            if (error.code === 50013) {
                // Manejar error de permisos sin imprimir en la consola
                const errorEmbed = new EmbedBuilder()
                    .setColor("#CB1BFF")
                    .setTitle('Error')
                    .setDescription('No tienes permiso para cambiar el apodo de este usuario.');

                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            } else {
                console.error('Error al cambiar el apodo:', error);
                
                const errorEmbed = new EmbedBuilder()
                    .setColor("#CB1BFF")
                    .setTitle('Error')
                    .setDescription('Hubo un error al cambiar el apodo en el servidor.');

                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },
};

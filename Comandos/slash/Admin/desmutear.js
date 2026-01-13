const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField } = require('discord.js');

module.exports = {
    devOnly: true,
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDMPermission(false)
        .setDescription('Desilencia a un usuario.')
        .addUserOption(option => option.setName('user').setDescription('El usuario a desilenciar').setRequired(true)),
    async execute(interaction) {
        const user = interaction.options.getUser('user');

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
            return interaction.reply({ content: 'No tienes permiso para utilizar este comando.', ephemeral: true });
        }

        if (!user) {
            return interaction.reply({ content: 'Por favor especifique un usuario para desilenciar.', ephemeral: true });
        }

        const member = await interaction.guild.members.fetch(user.id);
        const mutedRole = interaction.guild.roles.cache.find(role => role.name === 'Muted');

        if (!mutedRole) {
            return interaction.reply({ content: 'No hay ningún rol silenciado en este servidor.', ephemeral: true });
        }

        await member.roles.remove(mutedRole).catch(err => {
            console.error('No se pudo eliminar el rol:', err);
            return interaction.reply({ content: 'No se pudo desilenciar al usuario. Por favor, inténtelo de nuevo.', ephemeral: true });
        });

        await interaction.reply(`El usuario ${user.toString()} ha sido desilenciado.`);
    },
};

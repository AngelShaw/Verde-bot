const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField } = require('discord.js');
const ms = require('ms');

module.exports = {
    devOnly: true,
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDMPermission(false)
        .setDescription('Mute a user')
        .addUserOption(option => option.setName('user').setDescription('El usuario a silenciar').setRequired(true))
        .addStringOption(option => option.setName('time').setDescription('La duración del silencio en segundos.').setRequired(true)),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const timeInSeconds = interaction.options.getString('time');

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
            return interaction.reply({ content: 'No tienes permiso para utilizar este comando.', ephemeral: true });
        }

        if (!user) {
            return interaction.reply({ content: 'Por favor especifique un usuario para silenciar.', ephemeral: true });
        }

        if (!timeInSeconds) {
            return interaction.reply({ content: 'Por favor, especifique una duración para el silencio.', ephemeral: true });
        }

        const timeInMs = parseInt(timeInSeconds) * 1000; // Convertir segundos a milisegundos

        if (isNaN(timeInMs) || timeInMs <= 0) {
            return interaction.reply({ content: 'Por favor especifique una duración válida en segundos.', ephemeral: true });
        }

        const member = await interaction.guild.members.fetch(user.id);
        const mutedRole = interaction.guild.roles.cache.find(role => role.name === 'Muted');

        if (!mutedRole) {
            return interaction.reply({ content: 'No hay ningún rol silenciado en este servidor.', ephemeral: true });
        }

        await member.roles.add(mutedRole);
        await interaction.reply(`El usuario ${user.toString()} fue muteado por ${timeInSeconds} segundos.`);

        // Esperar a que el tiempo de muteo termine
        setTimeout(async () => {
            await member.roles.remove(mutedRole).catch(err => {
                console.error('No se pudo eliminar el rol:', err);
            });
            await interaction.followUp(`Usuario ${user.toString()} ha sido desmuteado.`).catch(err => {
                console.error('No se pudo enviar el mensaje de seguimiento:', err);
            });
        }, timeInMs);
    },
};

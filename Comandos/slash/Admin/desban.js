const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    devOnly: true,
    data: new SlashCommandBuilder()
        .setName('desban')
        .setDMPermission(false)
        .setDescription('Desbanea a un usuario del servidor.')
        .addStringOption(option => 
            option.setName('usuario')
                .setDescription('El ID del usuario a desbanear.')
                .setRequired(true)),
    async execute(interaction) {
        const userId = interaction.options.getString('usuario');
        const guild = interaction.guild;

        try {
            // Verificar si el usuario está baneado
            const ban = await guild.bans.fetch(userId).catch(() => null);
            if (!ban) {
                await interaction.reply(`El usuario con ID ${userId} no está baneado.`);
                return;
            }

            // Desbanear al usuario
            await guild.bans.remove(userId);
            await interaction.reply(`El usuario con ID ${userId} ha sido desbaneado.`);
        } catch (error) {
            console.error('Error al desbanear:', error);
            await interaction.reply('Hubo un error al intentar desbanear al usuario.');
        }
    },
};

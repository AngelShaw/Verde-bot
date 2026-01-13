module.exports = {
    name: 'interactionCreate',
    async execute(client, interaction) {
        try {
            if (
                interaction.isCommand() ||
                interaction.isChatInputCommand() ||
                interaction.isButton() ||
                interaction.isChannelSelectMenu() ||
                interaction.isStringSelectMenu() ||
                interaction.isModalSubmit()
            ) {
                // Lógica de comandos
            } else {
                console.warn(`Tipo de interacción no soportada: ${interaction.type}`);
            }
        } catch (error) {
            console.error(`Error manejando la interacción: ${error.message}`);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'Hubo un error al ejecutar esa interacción.', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Hubo un error al ejecutar esa interacción.', ephemeral: true });
            }
        }
    },
};
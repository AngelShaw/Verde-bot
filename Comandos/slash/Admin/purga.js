const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    devOnly: true,
    data: new SlashCommandBuilder()
        .setName('purga')
        .setDMPermission(false)
        .setDescription("Elimina cantidad de mensajes")
        .addNumberOption(option => option.setName('cantidad').setDescription(`La cantidad de mensajes que se eliminarán.`).setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute (interaction) {
        const GivenAmount = interaction.options.getNumber('cantidad');
        const AmountToDelete = Math.max(Math.min(GivenAmount, 100), 1); // Asegurarse de qel valor esté entre 1 y 100

        try {
            const FetchedMessages = await interaction.channel.messages.fetch({ limit: AmountToDelete });
            const DeletedMessages = await interaction.channel.bulkDelete(FetchedMessages, true);
        
            const DeletedResults = DeletedMessages.reduce((a, b) => {
                const SelectedUser = b.author.discriminator === '0' ? b.author.username : `${b.author.username}#${b.author.discriminator}`;
                a[SelectedUser] = (a[SelectedUser] || 0) + 1;
                return a;
            }, {});
        
            await interaction.reply({ content: `${DeletedMessages.size} mensajes${DeletedMessages.size > 1 ? 's' : ''} fueron eliminados.\n\n${Object.entries(DeletedResults).map(([User, Messages]) => `__**${User}**__・${Messages}`).join('\n')}`, ephemeral: true });
        } catch (err) {
            console.log(err);
        }
    }
};
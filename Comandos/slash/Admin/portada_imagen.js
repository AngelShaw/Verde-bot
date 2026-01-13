const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    devOnly: true,
    data: new SlashCommandBuilder()
        .setName('setbot')
        .setDMPermission(false)
        .setDescription('Cambia el banner o la imagen de perfil del bot')
        .addStringOption(option =>
            option.setName('tipo')
                .setDescription('Selecciona qué quieres cambiar: banner o perfil')
                .setRequired(true)
                .addChoices(
                    { name: 'Banner', value: 'banner' },
                    { name: 'Perfil', value: 'perfil' },
                ))
        .addAttachmentOption(option =>
            option.setName('imagen')
                .setDescription('Selecciona la imagen o GIF para aplicar (opcional)')
                .setRequired(false)),
    async execute(interaction) {
        const tipo = interaction.options.getString('tipo');
        const imagen = interaction.options.getAttachment('imagen');

        // Validar que se haya subido una imagen si es necesario
        if (!imagen || !imagen.contentType.startsWith('image/')) {
            return interaction.reply({
                content: 'Por favor, adjunta una imagen válida para cambiar el banner o el perfil.',
                ephemeral: true,
            });
        }

        const response = await fetch(imagen.url);
        const buffer = await response.buffer();
        const base64 = buffer.toString('base64');
        const imageData = `data:${imagen.contentType};base64,${base64}`;

        const payload = tipo === 'banner' ? { banner: imageData } : { avatar: imageData };
        const objeto = tipo === 'banner' ? 'banner' : 'imagen de perfil';

        try {
            await fetch('https://discord.com/api/v10/users/@me', {
                method: 'PATCH',
                headers: {
                    Authorization: `Bot ${interaction.client.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            await interaction.reply({ 
                content: `El ${objeto} del bot se cambió con éxito.`,
                ephemeral: true, // Mensaje de estilo ephemeral
            });
        } catch (error) {
            console.error(`Error al cambiar el ${objeto}:`, error);
            await interaction.reply({
                content: `Ha ocurrido un error al cambiar el ${objeto}.`,
                ephemeral: true, // También se marca como ephemeral
            });
        }
    },
};
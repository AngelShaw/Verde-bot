const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const config = require('../config.json');
const generateImage = require("../Extras/bienvenidas/welcomeImage");

module.exports = {
    name: 'guildMemberAdd',
    async execute(client, member) {
        try {
            // Obtener ID del canal de bienvenida desde config.json
            const channelId = config.welcomeChannel;
            const channel = member.guild.channels.cache.get(channelId);

            if (!channel) {
                console.error('Canal de bienvenida no encontrado');
                return;
            }

            // Generar la imagen de bienvenida
            const imageBuffer = await generateImage(member);
            const attachment = new AttachmentBuilder(imageBuffer, { name: 'generated-image.png' });

            // Crear el embed de bienvenida
            const welcomeEmbed = new EmbedBuilder()
                .setColor('#CB1BFF')
                .setTitle(`${member.user.displayName} Bienvenido a la comunidad de verdes!`)
                .setDescription(`Hola y bienvenido a esta pequeña comunidad 👻, por favor lee la sección https://discord.com/channels/679114672439296010/968711596048269362 , si quieres ayuda usa la sección https://discord.com/channels/679114672439296010/969021376163893299. Espero tu estancia sea de tu agrado ❤️.\n\n`)
                .setImage('attachment://generated-image.png') // Inserta la imagen generada en el embed
                .setFooter({ text: `Gracias wap@ ❤️`, iconURL: member.user.displayAvatarURL({ size: 1024 }) })
                .setTimestamp();

            // Enviar mensaje de bienvenida con la imagen y el embed
            await channel.send({
                content: `**Se acaba de unir el wapo 👽 <@${member.user.id}>**`,
                embeds: [welcomeEmbed],
                files: [attachment]
            });
        } catch (error) {
            console.error('Error al enviar la bienvenida:', error);
        }

        ////////////////////////////////////////////

        // Intentar enviar mensaje directo al nuevo miembro
        try {
            if (member.user.dmChannel || (await member.user.createDM())) {
                await member.send(`Hola y bienvenido ${member} a ${member.guild.name}. Disfruta de poder hablar/escribir con más usuarios y tener mods de forma segura. También puedes dar sub a mi canal, me ayudarías mucho con ello.\n\nhttps://www.youtube.com/@AngelShaw_/`);
            }
        } catch (error) {
            if (error.code !== 50007) { // Ignorar el error "Cannot send messages to this user"
                console.error('Error al enviar mensaje directo:', error);
            }
        }
    },
};
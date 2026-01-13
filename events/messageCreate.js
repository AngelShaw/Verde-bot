const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const config = require('../config.json');

const client = new Client({
    intents: 3276799,
});

client.on('messageCreate', (message) => {
    // Ignorar mensajes de bots
    if (message.author.bot) return;

    // Respuesta cuando mencionan al bot
    const mentions = message.mentions;
    if (mentions.has(client.user) && !mentions.everyone && !mentions.here && !message.reference) {
        const serverIcon = message.guild.iconURL(); // Obtiene la URL del icono del servidor

        const embed = new EmbedBuilder()
            .setTitle(`¡Hola ${message.author.username}!`)
            .setDescription(`Solo soy un BOT que automatiza y modera este pequeño servidor. Si deseas contactar con alguien puedes hacerlo mencionando a <@678516350427070485> o pedir ayuda en el canal de soporte -> https://discord.com/channels/679114672439296010/969021376163893299.`)
            .addFields(
                { name: 'Invitación al soporte del bot', value: '[Únete al canal de YouTube](https://www.youtube.com/@AngelShaw_)' },
                { name: 'Comandos', value: 'Usa `/help` para ver los comandos disponibles!.' }
            )
            .setThumbnail(serverIcon)
            .setColor(0xCB1BFF);

        message.reply({ embeds: [embed] });
        return; // Salir después de procesar esta lógica
    }

    // Respuesta automática para "como instalar" o "como puedo instalar"
    const adminRoleId = '964202562783948830';

    // Verificar si el usuario tiene el rol de administrador
    if (message.member && message.member.roles.cache.has(adminRoleId)) return;

    const triggers = ["como instalar", "como puedo instalar"];
    const content = message.content.toLowerCase();

    if (triggers.some(trigger => content.includes(trigger))) {
        const embed = new EmbedBuilder()
            .setColor(0x48FC08) // Usar un número entero en lugar de una cadena hexadecimal con #
            .setAuthor({ name: 'Angel Shaw' })
            .setTitle('**Archivos:**')
            .setDescription(`
# Guía de instalación de mods

• **.asi:** 
> Carpeta raíz y algunos pueden ir en la carpeta modloader 

• **.sf:** 
> Carpeta sampfuncs

• **.cs:** 
> Carpeta cleo y algunos pueden ir en la carpeta modloader 

• **.lua - .luac:** 
> Moonloader  

• **.txd - .dff - mods texturas:** 
> Dentro de modloader  

• **Huds:** 
> Descomprimiendo en la raíz del GTA  

• **Iconos armas:** 
> Modificando el .txd de cada arma  

• **Iconos mapa:** 
> Modificando el hud.txd  

• **ENB - Colormod:** 
> Archivos en la raíz del GTA  

• **Sonidos armas:** 
> En modloader respetando carpetas y nombres
            `)
            .setFooter({
                text: `By: Shaw • ${new Date().toLocaleString('es-ES', { hour12: true })}`,
                iconURL: 'https://i.imgur.com/1vDzaom.gif'
            });

        message.channel.send({ embeds: [embed] });
    }
});

// Inicia sesión en Discord con el token de tu bot
client.login(config.token);
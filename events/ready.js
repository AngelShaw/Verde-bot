const fs = require('fs');
const axios = require('axios');
const config = require('../config.json');
const Discord = require("discord.js")
require('dotenv').config();
const { Client, GatewayIntentBits, Partials, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, Events } = require('discord.js');
const ytch = require('yt-channel-info'); ///////////////Para yt
const path = require('path'); //////////// para yt
const client = new  Client({
    intents: 3276799,
});

///////////////////////////////////Esto es para status rotativo

module.exports = {
    name: 'ready',
    once: true,
    execute: async (client) => {
        const activities = [
            '💥Baneando gente💥',
            '❤️Besando un random❤️',
            '🍕Comiendo🍕',
            '❄️Obervando la nieve❄️',
            '🛹Practicando🛹',
            '⏲️Regresando el tiempo⏲️',
            '🚩Con la toxica🚩',
            '🐊Clonando animales🐊'
        ];

        setInterval(() => {
            const status = activities[Math.floor(Math.random() * activities.length)];
            client.user.setPresence({ activities: [{ name: `${status}` }] });
        }, 5000);
    }
};

//////////////////////////////////////////////////// notificacion videos yt

// Configuración del bot
const CHANNEL_ID = '1242630106858655827';
const VIDEOS_FILE_PATH = path.join(__dirname, '../Extras/guardados/videos-yt.json');

// Configuración de mensajes personalizados
const CHANNEL_MESSAGES = {
    'UCTyY4NzwyhzcVC8GbGsMClg': {
        message: '**{channelName}** el verde manco subió un nuevo video **"{title}"** vayan a ver y disfruten!!\n\n{url}\n@everyone'
    },
    'UCf7COzlvPdHvyuGRY7ilnQQ': {
        message: '**{channelName}** el sensual modder subió un nuevo video **"{title}"** disfruten de su video!\n\n{url}\n@everyone'
    }
};

// Leer el archivo de videos enviados
let sentVideos = {};
if (fs.existsSync(VIDEOS_FILE_PATH)) {
    sentVideos = JSON.parse(fs.readFileSync(VIDEOS_FILE_PATH, 'utf-8'));
} else {
    // Crear el archivo si no existe
    saveSentVideos();
}

// Guardar el archivo de videos enviados
function saveSentVideos() {
    fs.writeFileSync(VIDEOS_FILE_PATH, JSON.stringify(sentVideos, null, 4));
}

// Función para revisar nuevos videos
async function checkNewVideos() {
    try {
        for (const channelId of Object.keys(CHANNEL_MESSAGES)) {
            const response = await ytch.getChannelVideos({ channelId, sortBy: 'newest' });
            const videos = response.items;

            if (videos.length > 0) {
                const latestVideo = videos[0];
                if (!sentVideos[latestVideo.videoId]) {
                    // Obtener el nombre del canal directamente del video
                    const channelName = latestVideo.author;

                    // Enviar mensaje al canal de Discord
                    const channel = await client.channels.fetch(CHANNEL_ID);
                    if (channel && channelName) {
                        const videoMessage = CHANNEL_MESSAGES[channelId].message
                            .replace('{channelName}', channelName)
                            .replace('{title}', latestVideo.title)
                            .replace('{url}', `https://www.youtube.com/watch?v=${latestVideo.videoId}`);
                        await channel.send(videoMessage);
                    }

                    // Marcar el video como enviado
                    sentVideos[latestVideo.videoId] = true;
                    saveSentVideos();
                } else {
                }
            }
        }
    } catch (error) {
        console.error('Error al verificar nuevos videos:', error);
    }
}

client.once('ready', async () => {

    // Revisar nuevos videos inmediatamente al iniciar el bot
    await checkNewVideos();

    // Revisar nuevos videos cada 5 minutos
    setInterval(checkNewVideos, 7 * 60 * 1000);
});

// Login al bot de Discord usando el token del config.json
client.login(config.token);
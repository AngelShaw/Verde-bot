const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const gifUrls = [
    'https://i.imgur.com/fTgEgkz.gif',
    'https://i.imgur.com/odeEvIc.gif',
    'https://i.imgur.com/DqQRU2R.gif',
    'https://i.imgur.com/RttoQkf.gif',
    'https://i.imgur.com/qPf161x.gif',
    'https://i.imgur.com/ut92xcb.gif',
    'https://i.imgur.com/RmXDTqb.gif',
    'https://i.imgur.com/ytCkhs2.gif',
    'https://i.imgur.com/sw1o8hm.gif',
    'https://i.imgur.com/g9WMLtS.gif',
    'https://i.imgur.com/JMzd8BT.gif',
    'https://i.imgur.com/pJVTuKo.gif',
    'https://i.imgur.com/bDQOD9U.gif',
    'https://i.imgur.com/2aQgmWC.gif'
];

const data = new SlashCommandBuilder()
    .setName('ppt-bot')
    .setDMPermission(false)
    .setDescription('Juega Piedra - Papel - Tijeras')
    .setDMPermission(false);

const Users = new Set();

async function execute(interaction) {
    if (Users.has(interaction.user.id)) {
        return interaction.reply("Ya has jugado un juego!");
    } else {
        Users.add(interaction.user.id);
    }

    const reply = await interaction.reply({
        embeds: [
            {
                color: 0xCB1BFF,
                title: "Piedra, Papel, Tijeras",
                description: "Escoge tu arma!",
                footer: { text: "Escoge Piedra, Papel o Tijeras | Tiempo: 20 segundos" }
            }
        ],
        components: [
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel("Piedra 🧱")
                    .setCustomId("rps-Piedra 🧱")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setLabel("Papel 📄")
                    .setCustomId("rps-Papel 📄")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setLabel("Tijeras ✂️")
                    .setCustomId("rps-Tijeras ✂️")
                    .setStyle(ButtonStyle.Primary)
            )
        ]
    });

    const collector = reply.createMessageComponentCollector({ time: 20000 });

    collector.on("collect", (int) => {
        Collector(int, reply, collector);
    });

    collector.on("end", async (collected) => {
        if (collected.size === 0) {
            Users.delete(interaction.user.id);
            await reply.edit({
                components: [],
                embeds: [
                    {
                        color: 0x5865f2,
                        description: "El tiempo ha terminado."
                    }
                ]
            });
        }
    });
}

function Collector(interaction, reply, collector) {
    if (interaction.user.id !== interaction.message.interaction.user.id) {
        interaction.reply({
            ephemeral: true,
            embeds: [
                {
                    color: 0x5865f2,
                    description: "Oh no... esa no es tu interacción"
                }
            ]
        });
        return;
    }

    const bot = ["Piedra 🧱", "Papel 📄", "Tijeras ✂️"][Math.floor(Math.random() * 3)];
    const user = interaction.customId.split('-').pop() ?? "unknown";
    const description = `Yo escogí: ${bot.charAt(0).toUpperCase() + bot.slice(1)} \nTú escogiste: ${user.charAt(0).toUpperCase() + user.slice(1)}`;

    let text;
    if (bot === user) {
        text = "¡Es un empate!";
    } else if (
        (bot === "Piedra 🧱" && user === "Tijeras ✂️") ||
        (bot === "Papel 📄" && user === "Piedra 🧱") ||
        (bot === "Tijeras ✂️" && user === "Papel 📄")
    ) {
        text = "¡Yo gano!";
    } else {
        text = "¡Tú ganas!";
    }

    const randomGif = gifUrls[Math.floor(Math.random() * gifUrls.length)];

    reply.edit({
        components: [],
        embeds: [
            {
                title: "El ganador del juego",
                description: `${description}\n\n${text}`,
                color: 0xCB1BFF,
                footer: {
                    text: `${new Date().toLocaleString('es-ES', { hour12: true })}`
                },
                image: {
                    url: randomGif
                }
            }
        ]
    });

    Users.delete(interaction.message.interaction.user.id);
    collector.stop();
}

module.exports = { data, execute };

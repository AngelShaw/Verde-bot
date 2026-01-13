const { GatewayIntentBits, Client, Partials } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: Object.keys(GatewayIntentBits), partials: Object.keys(Partials) });
client.log = require('./logs.js');

// CLIENT PASSING \\
require('./CmdHandler.js')(client);
require('./mongo.js')(client);
require('./EventHandler.js')(client);

// READY EVENT \\
client.on('ready', (x) => {
    client.log.info(`${x.user.tag} esta online!`);
    // Puedes agregar un estado aquí
});

/// Usa el token desde el archivo .env
client.login(process.env.TOKEN);

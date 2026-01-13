const fs = require('node:fs');
const path = require('node:path');

module.exports = (client) => {
    client.log = require('./logs.js');
    const eventsPath = path.join(__dirname, '..', 'events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const eventModule = require(filePath);
        if (!eventModule.once) {
            client.on(eventModule.name, (...args) => eventModule.execute(client, ...args));
        } else {
            client.once(eventModule.name, (...args) => eventModule.execute(client, ...args));
        }
    }

    client.log.success(`Cargando ${eventFiles.length} eventos.`);
};

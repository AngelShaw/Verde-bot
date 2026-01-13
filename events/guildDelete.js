const invites = require("../Extras/bienvenidas/invites");

module.exports = {
    name: 'guildDelete',
    async execute(client, guild) {
        invites.updateCache(guild.client);
    },
};

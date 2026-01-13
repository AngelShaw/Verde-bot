const invites = require("../Extras/bienvenidas/invites");

module.exports = {
    name: 'guildCreate',
    async execute(client, guild) {
        invites.updateCache(guild.client);
    },
};

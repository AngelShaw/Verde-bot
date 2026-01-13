const invites = require("../Extras/bienvenidas/invites");

module.exports = {
    name: 'inviteDelete',
    async execute(client, invite) {
        invites.updateCache(invite.client);
    },
};

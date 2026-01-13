module.exports = {
    name: "messageCreate",
    async execute(client, message) {
        const schema = require(`${process.cwd()}/schemas/solo-img.js`);
        if (!message.guild || message.author.bot) return;
        const db = await schema.findOne({ guildId: message.guild.id });
        if (!db) return;
        if (!db.channels.includes(message.channel.id)) return;
        if (message.member.permissions.has("Administrator")) return;
        if (message.attachments.size > 0) return;
        message.delete().catch(() => {});
    }
}

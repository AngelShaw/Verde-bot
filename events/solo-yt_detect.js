module.exports = {
    name: "messageCreate",
    async execute(client, message) {
        const schema = require(`${process.cwd()}/schemas/solo-yt.js`);
        if (!message.guild || message.author.bot) return;
        const db = await schema.findOne({ guildId: message.guild.id });
        if (!db) return;
        if (!db.channels.includes(message.channel.id)) return;
        if (message.member.permissions.has("Administrator")) return;
        const ytRegex = /^(https?:\/\/)?([\w-]+\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com)(\/\S*)?$/;
        if (ytRegex.test(message.content)) return;
        message.delete().catch(() => {});
    }
}

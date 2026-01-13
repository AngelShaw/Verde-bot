const axios = require('axios');

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);

        if (!guild) {
            console.error("Guild not found.");
            return;
        }

        const memberCountChannel = guild.channels.cache.get(process.env.MEMBER_COUNT_CHANNEL_ID);
        const proRoleCountChannel = guild.channels.cache.get(process.env.PRO_ROLE_COUNT_CHANNEL_ID);
        const botsChannel = guild.channels.cache.get(process.env.BOTS_CHANNEL_ID);
        const boostChannel = guild.channels.cache.get(process.env.BOOST_CHANNEL_ID);
        const subCountChannel = guild.channels.cache.get(process.env.SUB_COUNT_CHANNEL_ID);

        const updateMemberAndRoleCounts = async () => {
            if (!guild.available) {
                console.error("Guild not available.");
                return;
            }

            const members = guild.memberCount;

            try {
                const proRole = guild.roles.cache.find(role => role.name === 'Los pro');
                if (!proRole) {
                    console.error('Role "Los pro" not found.');
                    return;
                }

                const proRoleCount = guild.members.cache.filter(member => member.roles.cache.has(proRole.id)).size;
                const bots = guild.members.cache.reduce(
                    (acc, member) => (member.user.bot ? acc + 1 : acc),
                    0
                );

                const boosters = guild.members.cache.filter(member => member.premiumSince !== null).size;

                if (memberCountChannel) {
                    await memberCountChannel.setName(`👥 Miembros: ${members}`);
                } else {
                    console.error("Member count channel not found.");
                }

                if (proRoleCountChannel) {
                    await proRoleCountChannel.setName(`🏆 Los pro: ${proRoleCount}`);
                } else {
                    console.error("Pro role count channel not found.");
                }

                if (botsChannel) {
                    await botsChannel.setName(`🤖 Bots: ${bots}`);
                } else {
                    console.error("Bots channel not found.");
                }

                if (boostChannel) {
                    await boostChannel.setName(`💎 Boosters: ${boosters}`);
                } else {
                    console.error("Boost channel not found.");
                }
            } catch (error) {
                console.error("Error updating member and role counts:", error);
            }
        };

        const updateYouTubeSubCount = async () => {
            if (!guild.available) {
                console.error("Guild not available.");
                return;
            }

            try {
                const youtubeApiKey = process.env.YOUTUBE_API_KEY;
                const youtubeChannelId = process.env.YOUTUBE_CHANNEL_ID;
                const youtubeResponse = await axios.get(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${youtubeChannelId}&key=${youtubeApiKey}`);
                const subCount = youtubeResponse.data.items[0].statistics.subscriberCount;

                if (subCountChannel) {
                    await subCountChannel.setName(`📺 Subs YouTube: ${subCount}`);
                } else {
                    console.error("Sub count channel not found.");
                }
            } catch (error) {
                console.error("Error updating YouTube subscriber count:", error);
            }
        };

        // Actualizar los contadores de miembros y roles cada minuto
        updateMemberAndRoleCounts();
        setInterval(updateMemberAndRoleCounts, 60000); // Cada 1 minuto

        // Actualizar el contador de suscriptores de YouTube cada hora
        updateYouTubeSubCount();
        setInterval(updateYouTubeSubCount, 3600000); // Cada 1 hora
    },
};
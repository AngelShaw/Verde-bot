const { Client, Message, EmbedBuilder } = require('discord.js');
const calculateLevelXp = require('../../Extras/rank/calculateLevelXp');
const Level = require('../../Extras/rank/Level');

const gifs = [
  "https://i.imgur.com/VqAcXlP.gif",
  "https://i.imgur.com/gdyWpv1.gif",
  "https://i.imgur.com/EIKCDop.gif",
  "https://i.imgur.com/7fc2lke.gif",
  "https://i.imgur.com/j4f3Nsq.gif",
  "https://i.imgur.com/K4wESSI.gif",
  "https://i.imgur.com/66gm3sQ.gif",
  "https://i.imgur.com/09fCyeq.gif",
  "https://i.imgur.com/63Tlbbk.gif",
  "https://i.imgur.com/RLa6tkK.gif",
  "https://i.imgur.com/XWi4pGv.gif",
  "https://i.imgur.com/YVesKZI.gif",
  "https://i.imgur.com/xb2v4As.gif",
  "https://i.imgur.com/rZWvwEu.gif",
  "https://i.imgur.com/IAMAeL0.gif"
];

function getRandomXp(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * @param {Client} client
 * @param {Message} message
 */
module.exports = async (client, message) => {
  if (!message.guild || message.author.bot) return;

  const xpToGive = getRandomXp(5, 15);

  const query = {
    userId: message.author.id,
    guildId: message.guild.id,
  };

  const specificChannelId = '1240104347300532244'; // Reemplaza 'ID_DEL_CANAL' con el ID del canal específico

  try {
    let level = await Level.findOne(query);

    if (level) {
      const previousLevel = level.level;
      let levelsGained = 0;
      level.xp += xpToGive;

      while (level.xp >= calculateLevelXp(level.level)) {
        level.xp -= calculateLevelXp(level.level);
        level.level += 1;
        levelsGained++;
      }

      if (levelsGained > 0) {
        const gif = gifs[Math.floor(Math.random() * gifs.length)];
        
        const embed = new EmbedBuilder()
          .setTitle('💢💥Acabas de subir de nivel💥💢')
          .setDescription(`Felicidades ${message.member}, acabas de subir de nivel de **${previousLevel}** a **${level.level}**. Usa **/rank** y ve tu progreso 👻`)
          .setImage(gif)
          .setFooter({ text: 'Sigue subiendo de nivel ☄️.' })
          .setColor('#CB1BFF');

        const channel = client.channels.cache.get(specificChannelId);
        if (channel) {
          const sendMessage = async () => {
            await channel.send(`**${message.member} felicidades por subir de nivel!!**`);
            await channel.send({ embeds: [embed] });
          };

          // Asegurarse de que solo se envíe una vez
          await sendMessage().catch(console.error);
        } else {
          console.error('Canal específico no encontrado.');
        }
      }

      await level.save();
    } else {
      // Crear nuevo registro de nivel
      const newLevel = new Level({
        userId: message.author.id,
        guildId: message.guild.id,
        xp: xpToGive,
        level: 0, // Nivel inicial
      });

      await newLevel.save();
    }
  } catch (error) {
    console.error('Error al dar xp:', error);
  }
};

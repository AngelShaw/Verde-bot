// commands/Admin/kill.js
const { SlashCommandBuilder } = require('discord.js');
const Kill = require('../../../schemas/kill'); // Importar el modelo Kill

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kill')
    .setDMPermission(false)
    .setDescription('Comando para matar a alguien.')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('El usuario que recibirá la kill')
        .setRequired(true)),
  
  async execute(interaction) {
    const targetUser = interaction.options.getUser('target');
    const links = [
      'http://imgfz.com/i/FgMTvDJ.gif', 'https://i.imgur.com/nIXn8jG.gif', 'https://i.imgur.com/uUu2JQI.gif',
      'https://i.imgur.com/XSNTpQ8.gif', 'https://i.imgur.com/AiRjnxY.gif', 'https://i.imgur.com/HIYng8g.gif',
      'https://i.imgur.com/GPDbIws.gif', 'https://i.imgur.com/NzdZJuV.gif', 'https://i.imgur.com/nSXlVCY.gif',
      'https://i.imgur.com/Ol1u3Ox.gif', 'https://i.imgur.com/g9ljzun.gif', 'https://i.imgur.com/yaqYYOP.gif',
      'https://i.imgur.com/yAx4JAe.gif', 'https://i.imgur.com/sEAfBqY.gif', 'https://i.imgur.com/T0mrw5u.gif'
    ];
    const index = Math.floor(Math.random() * links.length);

    try {
      // Buscar el usuario en la base de datos
      let killData = await Kill.findOne({ userId: targetUser.id });

      if (!killData) {
        // Si no existe, crear un nuevo registro
        killData = new Kill({ userId: targetUser.id, killsCount: 1 });
      } else {
        // Si existe, incrementar el contador
        killData.killsCount += 1;
      }

      // Guardar los cambios en la base de datos
      await killData.save();

      const killEmbed = {
        title: 'Te ha matado de forma devastadora.',
        description: `${interaction.user} ha matado a ${targetUser}! ☠️👿💀👿\nTotal de kills dados: ${killData.killsCount}`,
        color: 0xCB1BFF,
        image: { url: links[index] }
      };

      // Mencionar al usuario destinatario en el mensaje
      await interaction.reply({ content: `${targetUser}`, embeds: [killEmbed] });
    } catch (err) {
      console.error('Error al procesar el kill:', err);
      await interaction.reply('Hubo un problema al procesar la kill. Por favor, inténtalo de nuevo más tarde.');
    }
  },
};

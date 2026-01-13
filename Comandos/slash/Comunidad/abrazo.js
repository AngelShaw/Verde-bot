// commands/Admin/abrazo.js
const { SlashCommandBuilder } = require('discord.js');
const Hug = require('../../../schemas/abrazo'); // Importar el modelo Hug

module.exports = {
  data: new SlashCommandBuilder()
    .setName('abrazo')
    .setDescription('Comando para abrazar a alguien.')
    .setDMPermission(false)
    .addUserOption(option =>
      option.setName('target')
        .setDescription('El usuario que recibirá el abrazo')
        .setRequired(true)),
  
  async execute(interaction) {
    const targetUser = interaction.options.getUser('target');
    const links = [
      'https://i.imgur.com/p2lCMv4.gif', 'https://i.imgur.com/cAZa9rn.gif', 'https://i.imgur.com/uQr9q36.gif',
      'https://i.imgur.com/007DLgA.gif', 'https://i.imgur.com/wMocOZu.gif', 'https://i.imgur.com/4pFP1iI.gif',
      'https://i.imgur.com/Y5N1f2S.gif', 'https://i.imgur.com/eD3JASh.gif', 'https://i.imgur.com/RJbbQmW.gif',
      'https://i.imgur.com/NC5Id9Y.gif', 'https://i.imgur.com/AQKcsFD.gif', 'https://i.imgur.com/OLea5XR.gif',
      'https://i.imgur.com/r30rteZ.gif', 'https://i.imgur.com/8OBXc1k.gif', 'https://i.imgur.com/dxVyCVX.gif',
      'https://i.imgur.com/QZS7UW2.gif', 'https://i.imgur.com/o0PJPyu.gif', 'https://i.imgur.com/A7iynni.gif'
    ];
    const index = Math.floor(Math.random() * links.length);

    try {
      // Buscar el usuario en la base de datos
      let hugData = await Hug.findOne({ userId: targetUser.id });

      if (!hugData) {
        // Si no existe, crear un nuevo registro
        hugData = new Hug({ userId: targetUser.id, hugCount: 1 });
      } else {
        // Si existe, incrementar el contador
        hugData.hugCount += 1;
      }

      // Guardar los cambios en la base de datos
      await hugData.save();

      const besoEmbed = {
        title: 'Te dio un fuerte abrazo.',
        description: `${interaction.user} Le dio un enorme abrazo a ${targetUser}! 💑🧡💑\nTotal de abrazos recibidos: ${hugData.hugCount}`,
        color: 0xCB1BFF,
        image: { url: links[index] }
      };

      // Mencionar al usuario destinatario en el mensaje
      await interaction.reply({ content: `${targetUser}`, embeds: [besoEmbed] });
    } catch (err) {
      console.error('Error al procesar el abrazo:', err);
      await interaction.reply('Hubo un problema al enviar el abrazo. Por favor, inténtalo de nuevo más tarde.');
    }
  },
};

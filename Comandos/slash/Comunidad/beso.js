// commands/Admin/beso.js
const { SlashCommandBuilder } = require('discord.js');
const Kiss = require('../../../schemas/beso'); // Importar el modelo Kiss

module.exports = {
  data: new SlashCommandBuilder()
    .setName('beso')
    .setDescription('Da un beso UwU')
    .setDMPermission(false)
    .addUserOption(option =>
      option.setName('target')
        .setDescription('El usuario que recibirá el beso')
        .setRequired(true)),
  
  async execute(interaction) {
    const targetUser = interaction.options.getUser('target');
    const links = [
      'https://i.imgur.com/flqxsCw.gif', 'https://i.imgur.com/MpFx291.gif', 'https://i.imgur.com/hsvxrCY.gif',
      'https://i.imgur.com/ZMmVQJG.gif', 'https://i.imgur.com/plpUciB.gif', 'https://i.imgur.com/EUGEHSk.gif',
      'https://i.imgur.com/wjEBOtJ.gif', 'https://i.imgur.com/RdXKMga.gif', 'https://i.imgur.com/xJrab85.gif',
      'https://i.imgur.com/E3JVdHb.gif', 'https://i.imgur.com/vA6m8YG.gif', 'https://i.imgur.com/hZ1ijli.gif',
      'https://i.imgur.com/pbxkHLe.gif', 'https://i.imgur.com/Uw0Noxu.gif', 'https://i.imgur.com/dRNh46d.gif'
    ];
    const index = Math.floor(Math.random() * links.length);

    try {
      // Buscar el usuario en la base de datos
      let kissData = await Kiss.findOne({ userId: targetUser.id });

      if (!kissData) {
        // Si no existe, crear un nuevo registro
        kissData = new Kiss({ userId: targetUser.id, kissCount: 1 });
      } else {
        // Si existe, incrementar el contador
        kissData.kissCount += 1;
      }

      // Guardar los cambios en la base de datos
      await kissData.save();

      const besoEmbed = {
        title: 'Haz dado un enorme beso',
        description: `${interaction.user} le ha dado un beso a ${targetUser}! 🔥💋🔥\nTotal de besos dados: ${kissData.kissCount}`,
        color: 0xCB1BFF,
        image: { url: links[index] }
      };

      // Mencionar al usuario destinatario en el mensaje
      await interaction.reply({ content: `${targetUser}`, embeds: [besoEmbed] });
    } catch (err) {
      console.error('Error al procesar el beso:', err);
      await interaction.reply('Hubo un problema al enviar el beso. Por favor, inténtalo de nuevo más tarde.');
    }
  },
};

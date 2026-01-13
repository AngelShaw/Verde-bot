const { Client, Interaction, ApplicationCommandOptionType, AttachmentBuilder, SlashCommandBuilder } = require('discord.js');
const { createCanvas, loadImage, registerFont, GlobalFonts } = require('@napi-rs/canvas');
const calculateLevelXp = require('../../../Extras/rank/calculateLevelXp');
const Level = require('../../../Extras/rank/Level');
const path = require("path"); 
const UserSettings = require('../../../Extras/rank/user'); // Modelo para las configuraciones de usuario

// Registrar la fuente personalizada

const fontPath = path.resolve(__dirname, '../../../Extras/assets/fonts/Quicksand_Bold.otf');
GlobalFonts.registerFromPath(fontPath, 'Quicksand');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDMPermission(false)
    .setDescription(`Obtener la tarjeta rank de un usuario.`)
    .setDMPermission(false)
    .addUserOption(option => option
      .setName('usuario')
      .setDescription(`Selecciona el usuario.`)
      .setRequired(false)
    ),

  execute: async (interaction, client) => {
    if (!interaction.inGuild()) {
      interaction.reply('Sólo puedes ejecutar este comando dentro de un servidor..');
      return;
    }

    await interaction.deferReply();

    const logos = [
      './Extras/assets/images/1.png',
      './Extras/assets/images/2.png',
      './Extras/assets/images/3.png',
      './Extras/assets/images/4.png',
      './Extras/assets/images/5.png',
      './Extras/assets/images/6.png',
    ];

    const mentionedUserId = interaction.options.getUser('usuario')?.id;
    const targetUserId = mentionedUserId || interaction.user.id;
    const targetUserObj = await interaction.guild.members.fetch(targetUserId);

    const fetchedLevel = await Level.findOne({
      userId: targetUserId,
      guildId: interaction.guild.id,
    });

    if (!fetchedLevel) {
      await interaction.editReply(
        mentionedUserId
          ? `${targetUserObj.user.tag} Aún no tiene ningún nivel. Vuelve a intentarlo cuando mandes mas mensajes.`
          : "Aún no tienes ningún nivel. Chatea un poco más y vuelve a intentarlo."
      );
      return;
    }

    let allLevels = await Level.find({ guildId: interaction.guild.id }).select('-_id userId level xp');
    allLevels.sort((a, b) => (a.level === b.level ? b.xp - a.xp : b.level - a.level));

    let currentRank = allLevels.findIndex((lvl) => lvl.userId === targetUserId) + 1;

    const canvas = createCanvas(800, 300); // Tamaño del lienzo
    const ctx = canvas.getContext('2d');

    const background = await loadImage('./Extras/assets/images/rank.jpg');
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height); // Dibuja la imagen de fondo

    // Configuraciones del texto para el nombre de usuario
const userNameX = 250; // Posición X del nombre de usuario
const userNameY = 60; // Posición Y del nombre de usuario
const userNameFontSize = 48; // Tamaño de fuente del nombre de usuario
const userNameFontFamily = 'Quicksand'; // Familia de la fuente del nombre de usuario
const userNameOutlineSize = 11; // Tamaño del borde del nombre de usuario

// Configurar la fuente y el borde del texto del nombre de usuario
ctx.font = `${userNameFontSize}px ${userNameFontFamily}`;
ctx.fillStyle = '#ffffff'; // Color del texto del nombre de usuario
ctx.strokeStyle = '#000000'; // Color del borde del nombre de usuario
ctx.lineWidth = userNameOutlineSize;

// Dibujar el texto con borde y fuente personalizada para el nombre de usuario
ctx.strokeText(`${targetUserObj.user.username}`, userNameX, userNameY);
ctx.fillText(`${targetUserObj.user.username}`, userNameX, userNameY);


// Configuraciones del texto para el nivel
const levelX = 400; // Posición X del nivel
const levelY = 132; // Posición Y del nivel
const levelFontSize = 48; // Tamaño de fuente del nivel
const levelFontFamily = 'Quicksand'; // Familia de la fuente del nivel
const levelOutlineSize = 11; // Tamaño del borde del nivel

// Configurar la fuente y el borde del texto
ctx.font = `${levelFontSize}px ${levelFontFamily}`;
ctx.lineWidth = levelOutlineSize;
ctx.strokeStyle = '#000000'; // Color del borde del nivel

// Dibujar el texto con borde y fuente personalizada
ctx.strokeText(`Nivel: ${fetchedLevel.level}`, levelX, levelY);
ctx.fillStyle = '#ffffff'; // Color del texto del nivel
ctx.fillText(`Nivel: ${fetchedLevel.level}`, levelX, levelY);


    // Configuraciones del texto para el rango
const rankX = 55; // Posición X del rango
const rankY = 270; // Posición Y del rango
const rankFontSize = 30; // Tamaño de fuente del rango
const rankFontFamily = 'Quicksand'; // Familia de la fuente del rango
const rankOutlineSize = 7; // Tamaño del borde del rango

// Configurar la fuente y el borde del texto del rango
ctx.font = `${rankFontSize}px ${rankFontFamily}`;
ctx.fillStyle = '#ffffff'; // Color del texto del rango
ctx.strokeStyle = '#000000'; // Color del borde del rango
ctx.lineWidth = rankOutlineSize;

// Dibujar el texto con borde y fuente personalizada para el rango
ctx.strokeText(`Rank: #${currentRank}`, rankX, rankY);
ctx.fillText(`Rank: #${currentRank}`, rankX, rankY);

    // Corregir: Cargar la imagen de perfil del usuario consultado, no del que ejecuta el comando
try {
  const img = targetUserObj.user.displayAvatarURL({ extension: 'png', size: 512 });
  const avatar = await loadImage(img);

  // Dibujar el avatar con esquinas redondeadas
  const avatarSize = 180; // Tamaño del avatar
  const avatarX = canvas.width - avatarSize - 585; // Posición X del avatar
  const avatarY = 40; // Posición Y del avatar
  const avatarRadius = 20; // Radio para las esquinas redondeadas del avatar

  // Configuraciones para la sombra
  const shadowOffsetX = 10; // Desplazamiento X de la sombra
  const shadowOffsetY = 10; // Desplazamiento Y de la sombra
  const shadowBlur = 30; // Difuminado de la sombra
  const shadowSizeIncrease = 1; // para quitar o poner el cuadro negro

  // Dibujar la sombra con esquinas redondeadas
  ctx.shadowColor = 'rgba(0, 0, 0, 80.0)';
  ctx.shadowBlur = shadowBlur;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.0)';
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(avatarX + avatarRadius - shadowSizeIncrease, avatarY - shadowSizeIncrease);
  ctx.lineTo(avatarX + avatarSize - avatarRadius + shadowSizeIncrease, avatarY - shadowSizeIncrease);
  ctx.quadraticCurveTo(avatarX + avatarSize + shadowSizeIncrease, avatarY - shadowSizeIncrease, avatarX + avatarSize + shadowSizeIncrease, avatarY + avatarRadius - shadowSizeIncrease);
  ctx.lineTo(avatarX + avatarSize + shadowSizeIncrease, avatarY + avatarSize - avatarRadius + shadowSizeIncrease);
  ctx.quadraticCurveTo(avatarX + avatarSize + shadowSizeIncrease, avatarY + avatarSize + shadowSizeIncrease, avatarX + avatarSize - avatarRadius + shadowSizeIncrease, avatarY + avatarSize + shadowSizeIncrease);
  ctx.lineTo(avatarX + avatarRadius - shadowSizeIncrease, avatarY + avatarSize + shadowSizeIncrease);
  ctx.quadraticCurveTo(avatarX - shadowSizeIncrease, avatarY + avatarSize + shadowSizeIncrease, avatarX - shadowSizeIncrease, avatarY + avatarSize - avatarRadius + shadowSizeIncrease);
  ctx.lineTo(avatarX - shadowSizeIncrease, avatarY + avatarRadius - shadowSizeIncrease);
  ctx.quadraticCurveTo(avatarX - shadowSizeIncrease, avatarY - shadowSizeIncrease, avatarX + avatarRadius - shadowSizeIncrease, avatarY - shadowSizeIncrease);
  ctx.closePath();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // Color de la sombra
  ctx.fill();
  ctx.restore();

  // Dibujar el avatar con esquinas redondeadas
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(avatarX + avatarRadius, avatarY);
  ctx.lineTo(avatarX + avatarSize - avatarRadius, avatarY);
  ctx.quadraticCurveTo(avatarX + avatarSize, avatarY, avatarX + avatarSize, avatarY + avatarRadius);
  ctx.lineTo(avatarX + avatarSize, avatarY + avatarSize - avatarRadius);
  ctx.quadraticCurveTo(avatarX + avatarSize, avatarY + avatarSize, avatarX + avatarSize - avatarRadius, avatarY + avatarSize);
  ctx.lineTo(avatarX + avatarRadius, avatarY + avatarSize);
  ctx.quadraticCurveTo(avatarX, avatarY + avatarSize, avatarX, avatarY + avatarSize - avatarRadius);
  ctx.lineTo(avatarX, avatarY + avatarRadius);
  ctx.quadraticCurveTo(avatarX, avatarY, avatarX + avatarRadius, avatarY);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
  ctx.restore();
} catch (error) {
  console.error("Error loading avatar:", error);
  ctx.fillStyle = '#000000';
  ctx.fillRect(canvas.width - 250, 50, 200, 200);
}



    // Obtener color personalizado del usuario
    const userSettings = await UserSettings.findOne({ userId: targetUserId, guildId: interaction.guild.id });
    const rankBarColor = userSettings?.rankBarColor || '#00FF00'; // Verde por defecto
    const barOpacity = 0.85; // Transparencia deseada (80%)

    // Configuraciones de la barra de progreso
    const barWidth = 500; // Ancho de la barra de progreso
    const barHeight = 35; // Altura de la barra de progreso
    const barX = 250; // Posición X de la barra de progreso
    const barY = 240; // Posición Y de la barra de progreso
    const radius = 20; // Radio para el redondeado de las esquinas

    const currentXp = fetchedLevel.xp;
    const requiredXp = calculateLevelXp(fetchedLevel.level + 1);
    const progress = currentXp / requiredXp;

    // Fondo de la barra de progreso con esquinas redondeadas
    ctx.fillStyle = '#555555' + Math.floor(barOpacity * 255).toString(16);
    ctx.beginPath();
    ctx.moveTo(barX + radius, barY);
    ctx.lineTo(barX + barWidth - radius, barY);
    ctx.quadraticCurveTo(barX + barWidth, barY, barX + barWidth, barY + radius);
    ctx.lineTo(barX + barWidth, barY + barHeight - radius);
    ctx.quadraticCurveTo(barX + barWidth, barY + barHeight, barX + barWidth - radius, barY + barHeight);
    ctx.lineTo(barX + radius, barY + barHeight);
    ctx.quadraticCurveTo(barX, barY + barHeight, barX, barY + barHeight - radius);
    ctx.lineTo(barX, barY + radius);
    ctx.quadraticCurveTo(barX, barY, barX + radius, barY);
    ctx.closePath();
    ctx.fill();

    // Barra de progreso con color personalizado y esquinas redondeadas
    ctx.fillStyle = rankBarColor + Math.floor(barOpacity * 255).toString(16);
    ctx.beginPath();
    const filledWidth = barWidth * progress;
    ctx.moveTo(barX + radius, barY);
    if (filledWidth > radius) {
      ctx.lineTo(barX + filledWidth - radius, barY);
      ctx.quadraticCurveTo(barX + filledWidth, barY, barX + filledWidth, barY + radius);
    }
    if (filledWidth > barHeight - radius) {
      ctx.lineTo(barX + filledWidth, barY + barHeight - radius);
      ctx.quadraticCurveTo(barX + filledWidth, barY + barHeight, barX + filledWidth - radius, barY + barHeight);
    }
    ctx.lineTo(barX + radius, barY + barHeight);
    ctx.quadraticCurveTo(barX, barY + barHeight, barX, barY + barHeight - radius);
    ctx.lineTo(barX, barY + radius);
    ctx.quadraticCurveTo(barX, barY, barX + radius, barY);
    ctx.closePath();
    ctx.fill();

    // Añadir texto de XP actual y XP necesaria con borde negro
const xpText = `XP: ${currentXp} / ${requiredXp}`;
const xpTextX = barX + barWidth / 2 - 80; // Ajusta según sea necesario
const xpTextY = barY + barHeight / 2 + 10; // Ajusta según sea necesario
const xpTextFontSize = 24; // Tamaño de fuente del texto XP
const xpTextFontFamily = 'Quicksand'; // Familia de la fuente del texto XP
const xpTextOutlineSize = 4; // Tamaño del borde

// Configurar la fuente y el borde del texto XP
ctx.font = `${xpTextFontSize}px ${xpTextFontFamily}`;
ctx.lineWidth = xpTextOutlineSize;
ctx.strokeStyle = '#000000'; // Color del borde

// Dibujar el borde del texto XP
ctx.strokeText(xpText, xpTextX, xpTextY);

// Dibujar el texto en color blanco encima del borde
ctx.fillStyle = '#ffffff'; // Color del texto XP
ctx.fillText(xpText, xpTextX, xpTextY);

// Cargar los logos
const logoImages = await Promise.all(logos.map(async (logoPath) => {
  try {
    return await loadImage(logoPath);
  } catch (error) {
    console.error('Error loading logo:', error);
    return null;
  }
}));

// Verificar que todas las imágenes se hayan cargado correctamente
if (logoImages.some(image => image === null)) {
  console.error('Error loading logos.');
  return;
}
// Dibujar los logos
const logosWidth = 60;
const logosHeight = 60;
const logosSpacing = [30, 11, 17, 23, 29, 35]; // Espacios diferentes entre cada logo
const logosX = 260;
const logosY = 165; // Posición vertical inicial de los logos

let currentX = logosX;

for (let i = 0; i < logoImages.length; i++) {
  const logo = logoImages[i];
  ctx.drawImage(logo, currentX, logosY, logosWidth, logosHeight); // Cambiar 5 por logosY
  currentX += logosWidth + logosSpacing[i % logosSpacing.length]; // Aplicar un espacio diferente para cada logo
}




    const attachment = new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'rank.png' });
    await interaction.editReply({ files: [attachment] });
  },
};
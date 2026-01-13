const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const axios = require('axios');
const { execFile, exec } = require('child_process');
const screenshot = require('screenshot-desktop');
const Jimp = require('jimp');
const { createWorker } = require('tesseract.js');

const adminID = '780309070783578112';
const dbPath = path.join(__dirname, '../../../Extras/Base de mods/archivos.json');
const luajitFolder = path.join(__dirname, '../../../Decrypt/1');

const amenazas = [
  'MZ', 'vdf', 'samp.dat', 'download', 'This program cannot be run in DOS mode',
  '"gtaweap3.saa', 'getDynamicLibraryProcedure', 'sampdebug.asi',
  'discord.com/api/webhooks', 'api/webhooks', 'statdisp.asi', 'stealers.ru'
];
const patronesHex = [
  "ff ff 03 00 00 c8 0a 05 e0 00 03 01 00 a6 0a 01 e0 48 46 00 03 01 00 04 00 04 00 00 8e 0a 03 01 00 04 10 03 02 00",
  "54 68 69 73 20 70 72 6F 67 72 61 6D 20 63 61 6E 6E 6F 74 20 62 65 20 72 75 6E 20 69 6E 20 44 4F 53 20 6D 6F 64 65",
  "6C 6F 61 64 44 79 6E 61 6D 69 63 4C 69 62 72 61 72 79",
  "1b 4c 4a 02 02 0f 00 00 80 00 00 00 02 2c 00 7f 00 4a 00 81",
  "73 74 65 61 6C 65 72 6E 6F 74 65 73 2E 72 75"
];
const cleosamenazas = [
  "samp.dat",
  "samp.temp",
  "samp.tmp",
  "It cleo stealer!!!",
  "Connector_1 is present"
];
const cleonodetect = [
  "it cleo pure",
  "used unknown crypter - prime-hack"
];

const MB = 1024 * 1024;
const extensionesPermitidas = ['.cs', '.lua', '.luac', '.asi', '.dll', '.exe', '.sf'];
const pesoMaximoPorExtension = {
  '.dll': 16 * MB,
  '.exe': 16 * MB,
  '.cs': 1 * MB,
  '.lua': 3 * MB,
  '.luac': 3 * MB,
  '.asi': 3 * MB,
  '.sf': 3 * MB
};
const dbOnlyExtensions = ['.asi', '.dll', '.exe', '.sf'];

function normalizar(texto) {
  return texto.toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function capturarYGuardarOCR({ posX, posY, width, height }) {
  const rutaBase = path.resolve(__dirname, '../../../Decrypt/2/');
  if (!fs.existsSync(rutaBase)) fs.mkdirSync(rutaBase, { recursive: true });

  const nombre = 'aSteal';
  const rutaImg = path.join(rutaBase, `${nombre}.png`);
  const rutaTxt = path.join(rutaBase, `${nombre}.txt`);

  try {
    const imgBuffer = await screenshot({ format: 'png' });
    const image = await Jimp.read(imgBuffer);

    const imgWidth = image.bitmap.width;
    const imgHeight = image.bitmap.height;
    if (posX < 0 || posY < 0 || width <= 0 || height <= 0) {
      throw new Error('❌ Parámetros de recorte inválidos.');
    }

    if (posX + width > imgWidth) {
      width = imgWidth - posX;
    }
    if (posY + height > imgHeight) {
      height = imgHeight - posY;
    }

    const region = image.crop(posX, posY, width, height);
    await region.writeAsync(rutaImg);

    const worker = await createWorker('eng');
    const { data: { text } } = await worker.recognize(rutaImg);
    fs.writeFileSync(rutaTxt, text, 'utf-8');
    await worker.terminate();
  } catch (err) {
    console.error('❌ Error OCR:', err);
  }
}

async function downloadFile(url) {
  const res = await axios.get(url, { responseType: 'arraybuffer' });
  return Buffer.from(res.data);
}

async function verificarPatronesHexadecimales(file) {
  const buf = await downloadFile(file.url);
  const patBufs = patronesHex.map(h => Buffer.from(h.replace(/\s+/g, ''), 'hex'));
  return patBufs.some(p => buf.includes(p));
}

let isAnalyzing = false;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('revisar-archivos')
    .setDescription('Revisa un archivo para detectar amenazas')
    .setDMPermission(false)
    .addAttachmentOption(opt =>
      opt.setName('archivo')
         .setDescription('Archivo a revisar')
         .setRequired(true)
    ),

  async execute(interaction) {
    /////// Bloqueo para que solo haya un análisis a la vez
    if (isAnalyzing) {
      return interaction.reply({
        content: 'El bot está trabajando en analizar un archivo, por favor espera que termine y reintenta enviar tu análisis. 🤝',
        flags: 64
      });
    }
    isAnalyzing = true;

    try {
      const archivo     = interaction.options.getAttachment('archivo');
      const extension   = path.extname(archivo.name).toLowerCase();
      const nombreSinExt = path.parse(archivo.name).name;

      //////// Validar extensión
      if (!extensionesPermitidas.includes(extension)) {
        return interaction.reply({
          content: `❌ Extensión no permitida **${extension}**\n\n✅ Solo se permiten: **.cs, .lua, .luac, .asi, .dll, .sf y .exe**`,
          flags: 64
        });
      }

      //////// Validar peso
      const max = pesoMaximoPorExtension[extension] || 0;
      if (archivo.size > max) {
        return interaction.reply({
          content: `❌ El archivo **${archivo.name}** supera el tamaño permitido.\n\n📦 Tamaño máximo: **${(max/MB).toFixed(2)} MB**\n📦 Tamaño actual: **${(archivo.size/MB).toFixed(2)} MB**`,
          flags: 64
        });
      }

      await interaction.deferReply();
      const inicial = new EmbedBuilder()
        .setTitle('🔍 Analizando archivo...')
        .setDescription(`⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜ 0%\nUn momento, estamos verificando tu archivo ⏳`)
        .addFields(
          { name: 'Nombre',    value: nombreSinExt, inline: true },
          { name: 'Extensión', value: extension,     inline: true }
        )
        .setColor('Yellow')
        .setFooter({
          iconURL: interaction.user.displayAvatarURL(),
          text: `${interaction.user.username} 🔥 Gracias por analizar tu mod con el bot 🔥`
        })        
        .setImage('https://i.imgur.com/j3pRPKA.gif');
      await interaction.editReply({ embeds: [inicial] });

      const progressSteps = [...Array(11)].map((_, i) =>
        `${'🟩'.repeat(i)}${'⬜'.repeat(10 - i)} ${i * 10}%`
      );
      const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      let aStealEjecutado = false;
      for (let i = 1; i <= 10; i++) {
        await new Promise(r => setTimeout(r, 400));
        inicial.setDescription(`${progressSteps[i]}\nUn momento, seguimos analizando ⏳`);
        await interaction.editReply({ embeds: [inicial] });

        const buffer  = await downloadFile(archivo.url);
        const fileMD5 = crypto.createHash('md5').update(buffer).digest('hex');
        const dbEntry = db.find(e =>
          e.formato === extension &&
          e.MD5    === fileMD5
        );
        if (dbEntry) {
          const originalConExt = dbEntry.nombre_original + dbEntry.formato;
          const embedOK = new EmbedBuilder()
            .setTitle('✅ Archivo verificado ✅')
            .setDescription(`El archivo **${nombreSinExt}** está verificado y es seguro de usar 🤝.`)
            .addFields(
              { name: 'Nombre',          value: nombreSinExt, inline: true },
              { name: 'Extensión',       value: extension,     inline: true },
              { name: 'Nombre original', value: originalConExt, inline: true }
            )
            .setColor('Green')
            .setFooter({
              iconURL: interaction.user.displayAvatarURL(),
              text: `${interaction.user.username} 🔥 Gracias por analizar tu mod con el bot 🔥`
            }) 
            .setImage('https://i.imgur.com/4vkG02z.gif');
          return interaction.editReply({ embeds: [embedOK] });
        }

        // Archivos que solo se comprueban en DB
        if (dbOnlyExtensions.includes(extension)) {
          const embedSafe = new EmbedBuilder()
            .setTitle('✅ Archivo aparentemente seguro ✅')
            .setDescription('No se detectó keylogger, pero contacta a un admin para mayor seguridad. 🤝')
            .addFields(
              { name: 'Nombre',    value: nombreSinExt, inline: true },
              { name: 'Extensión', value: extension,     inline: true }
            )
            .setColor('Green')
            .setFooter({
              iconURL: interaction.user.displayAvatarURL(),
              text: `${interaction.user.username} 🔥 Gracias por analizar tu mod con el bot 🔥`
            }) 
            .setImage('https://i.imgur.com/4vkG02z.gif');
          await interaction.editReply({ embeds: [embedSafe] });

          const admin = await interaction.client.users.fetch(adminID);
          await admin.send({
            content: `🚨 Archivo desconocido subido por ${interaction.user}: (.${extension})`,
            files: [new AttachmentBuilder(archivo.url)]
          });
          return;
        }

        // Detección por texto
        const textPlain = buffer.toString('utf8');
        if (amenazas.some(p => textPlain.includes(p))) {
          const embedP = new EmbedBuilder()
            .setTitle('⛔ Amenaza detectada ⛔')
            .setDescription('Se detectó contenido malicioso, elimina el archivo de inmediato.')
            .addFields(
              { name: 'Nombre',    value: nombreSinExt, inline: true },
              { name: 'Extensión', value: extension,     inline: true }
            )
            .setColor('Red')
            .setFooter({
              iconURL: interaction.user.displayAvatarURL(),
              text: `${interaction.user.username} 🔥 Gracias por analizar tu mod con el bot 🔥`
            }) 
            .setImage('https://i.imgur.com/JLRfynU.gif');
          return interaction.editReply({ embeds: [embedP] });
        }

        // Análisis con aSteal.exe para .cs
        if (extension === '.cs' && i === 3) {
          const savePath = path.join(__dirname, '../../../Decrypt/2/', archivo.name);
          await fs.promises.writeFile(savePath, buffer);
          if (!aStealEjecutado) {
            aStealEjecutado = true;
            exec(`start "" "${path.join(__dirname, '../../../Decrypt/2/aSteal.exe')}" "${savePath}"`);
          }
          await new Promise(r => setTimeout(r, 11000));
          await capturarYGuardarOCR({ posX: 0, posY: 0, width: 990, height: 990 });
          {
            const rutaImg = path.resolve(__dirname, '../../../Decrypt/2/aSteal.png');
            const img     = await Jimp.read(rutaImg);
            await img
              .resize(1600, 1200)
              .writeAsync(rutaImg);
          }
          exec(`powershell -Command "Stop-Process -Name 'aSteal' -Force"`);
          const ocrPath = path.resolve(__dirname, '../../../Decrypt/2/aSteal.txt');
          if (fs.existsSync(ocrPath)) {
            const textoOCR = fs.readFileSync(ocrPath, 'utf-8').toLowerCase();
            if (cleonodetect.some(p => textoOCR.includes(p))) {
              continue;
            }
            const amenazaCleo = cleosamenazas.find(p => textoOCR.includes(p.toLowerCase()));
            if (amenazaCleo) {
              const embedC = new EmbedBuilder()
                .setTitle('⛔ Amenaza detectada ⛔')
                .setDescription(`Se encontró amenaza en el script, no uses para evitar infeccion. \n\nAmenaza encontrada: **${amenazaCleo}**.`)
                .addFields(
                  { name: 'Nombre',    value: nombreSinExt, inline: true },
                  { name: 'Extensión', value: extension,     inline: true }
                )
                .setColor('Red')
                .setFooter({
                  iconURL: interaction.user.displayAvatarURL(),
                  text: `${interaction.user.username} 🔥 Gracias por analizar tu mod con el bot 🔥`
                }) 
                .setImage('https://i.imgur.com/JLRfynU.gif');
              return interaction.editReply({ embeds: [embedC] });
            }
          }
        }

        // Análisis .lua / .luac con Luajit
        if ((extension === '.lua' || extension === '.luac') && i === 3) {
          if (!fs.existsSync(luajitFolder)) fs.mkdirSync(luajitFolder, { recursive: true });
          const fullPath = path.join(luajitFolder, archivo.name);
          fs.writeFileSync(fullPath, buffer);
          await new Promise(res =>
            execFile('luajit.exe', [archivo.name], { cwd: luajitFolder, windowsHide: true }, res)
          );
          await new Promise(r => setTimeout(r, 1500));
          const generados  = fs.readdirSync(luajitFolder);
          const sospechosos = generados.filter(n => n.endsWith('.saa') || n.endsWith('.asi'));
          sospechosos.forEach(f => fs.unlinkSync(path.join(luajitFolder, f)));
          fs.unlinkSync(fullPath);
          if (sospechosos.length > 0) {
            const embedS = new EmbedBuilder()
              .setTitle('⛔ Amenaza detectada ⛔')
              .setDescription(`Se encontró amenaza en el script, no uses para evitar infeccion. \n\nAmenaa encontrada: **${sospechosos[0]}**.`)
              .addFields(
                { name: 'Nombre',    value: nombreSinExt, inline: true },
                { name: 'Extensión', value: extension,     inline: true }
              )
              .setColor('Red')
              .setFooter({
                iconURL: interaction.user.displayAvatarURL(),
                text: `${interaction.user.username} 🔥 Gracias por analizar tu mod con el bot 🔥`
              }) 
              .setImage('https://i.imgur.com/JLRfynU.gif');
            return interaction.editReply({ embeds: [embedS] });
          }
        }

        // Detección por patrones hexadecimales
        if (i === 7 && await verificarPatronesHexadecimales(archivo)) {
          const embedH = new EmbedBuilder()
            .setTitle('⛔ Amenaza detectada ⛔')
            .setDescription('Se detectó código malicioso en patrones hex, elimina el archivo.')
            .addFields(
              { name: 'Nombre',    value: nombreSinExt, inline: true },
              { name: 'Extensión', value: extension,     inline: true }
            )
            .setColor('Red')
            .setFooter({
              iconURL: interaction.user.displayAvatarURL(),
              text: `${interaction.user.username} 🔥 Gracias por analizar tu mod con el bot 🔥`
            }) 
            .setImage('https://i.imgur.com/JLRfynU.gif');
          return interaction.editReply({ embeds: [embedH] });
        }
      }
      const embedFinal = new EmbedBuilder()
        .setTitle('✅ Archivo aparentemente seguro ✅')
        .setDescription('No se detectó ningún keylogger. Para mayor seguridad, contacta a un admin. 🤝')
        .addFields(
          { name: 'Nombre',    value: nombreSinExt, inline: true },
          { name: 'Extensión', value: extension,     inline: true }
        )
        .setColor('Green')
        .setFooter({
          iconURL: interaction.user.displayAvatarURL(),
          text: `${interaction.user.username} 🔥 Gracias por analizar tu mod con el bot 🔥`
        }) 
        .setImage('https://i.imgur.com/4vkG02z.gif');
      await interaction.editReply({ embeds: [embedFinal] });
      const admin = await interaction.client.users.fetch(adminID);
      await admin.send({
        content: `🚨 Archivo desconocido subido por ${interaction.user}: (.${extension})`,
        files: [new AttachmentBuilder(archivo.url)]
      });

    } finally {
      /////// Liberar bloqueo para el siguiente análisis
      isAnalyzing = false;
    }
  }
};

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Cargar base de datos desde archivos.json
const dbPath = path.join(__dirname, '../../../Extras/Base de mods/archivos.json');
let archivosDB = [];

if (fs.existsSync(dbPath)) {
  archivosDB = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rz')
    .setDMPermission(false)
    .setDescription('Sube un archivo y agrégalo a la base de datos')
    .addAttachmentOption(option =>
      option.setName('archivo')
        .setDescription('Archivo a subir')
        .setRequired(true)
    ),
  async execute(interaction) {
    const archivo = interaction.options.getAttachment('archivo');

    if (!archivo) {
      return interaction.reply({ content: 'Debes subir un archivo.', ephemeral: true });
    }

    const extensionArchivo = path.extname(archivo.name);
    const nombreArchivo = path.parse(archivo.name).name;

    const maxSize = 16 * 1024 * 1024;
    if (archivo.size > maxSize) {
      return interaction.reply({ content: '❌ El archivo excede el peso máximo de 10MB.', ephemeral: true });
    }

    // Descargar el archivo para calcular MD5
    const response = await fetch(archivo.url);
    const buffer = Buffer.from(await response.arrayBuffer());
    const md5Hash = crypto.createHash('md5').update(buffer).digest('hex');

    // Verificar si el archivo ya existe por su hash MD5
    const archivoExistente = archivosDB.some(file => file.MD5 === md5Hash);
    if (archivoExistente) {
      return interaction.reply({ content: '⚠️ El archivo ya existe en la base de datos. No se agregó nuevamente.', ephemeral: true });
    }

    const nuevoArchivo = {
      formato: extensionArchivo,
      bytes: archivo.size,
      MD5: md5Hash,
      nombre_original: nombreArchivo
    };

    archivosDB.push(nuevoArchivo);

    // Guardar la base de datos actualizada
    fs.writeFileSync(dbPath, JSON.stringify(archivosDB, null, 2));

    const embed = new EmbedBuilder()
      .setTitle('✅ Archivo Agregado ✅')
      .setDescription('El archivo ha sido agregado a la base de datos exitosamente.')
      .addFields(
        { name: 'Nombre Original', value: nombreArchivo, inline: true },
        { name: 'Formato', value: extensionArchivo, inline: true },
        { name: 'Bytes', value: archivo.size.toString(), inline: true },
        { name: 'MD5', value: md5Hash }
      )
      .setColor('Green');

    await interaction.reply({ embeds: [embed] });
  }
};

const { SlashCommandBuilder } = require('discord.js');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Ruta donde se encuentra aSteal.exe
const aStealFolder = path.join(__dirname, '../../../Decrypt/2');

// Función para manejar la ejecución de aSteal.exe
async function ejecutarAsteal(archivo) {
  return new Promise((resolve, reject) => {
    // Comando para ejecutar el archivo .exe con el archivo .CS como argumento
    const exePath = path.join(aStealFolder, 'aSteal.exe');
    const comando = `start "" "${exePath}" "${archivo}"`;

    exec(comando, (error, stdout, stderr) => {
      if (error) {
        reject(`Error al ejecutar aSteal.exe: ${error.message}`);
        return;
      }
      if (stderr) {
        reject(`stderr: ${stderr}`);
        return;
      }
      resolve(stdout);
    });
  });
}

// Función para mover el archivo a la carpeta de aSteal
async function moverArchivo(archivo) {
  try {
    const destino = path.join(aStealFolder, path.basename(archivo));
    // Usamos copyFileSync para asegurar que el archivo se copie intacto
    fs.copyFileSync(archivo, destino);
    return destino;
  } catch (error) {
    throw new Error(`Error al mover el archivo a la carpeta de aSteal: ${error.message}`);
  }
}

// Función principal para procesar el archivo .cs y ejecutar aSteal
async function procesarArchivo(archivo) {
  try {
    // Mover el archivo a la carpeta de aSteal
    const archivoFinal = await moverArchivo(archivo);

    // Ejecutar aSteal.exe
    await ejecutarAsteal(archivoFinal);

    console.log("El archivo fue procesado exitosamente.");
    return 'Archivo procesado exitosamente.';
  } catch (error) {
    console.error('Error al procesar el archivo:', error.message);
    return `Error: ${error.message}`;
  }
}

// Definir el comando slash /qq
module.exports = {
  data: new SlashCommandBuilder()
    .setName('qq')
    .setDescription('Procesa un archivo .cs a través de aSteal.exe')
    .addAttachmentOption(option =>
      option.setName('archivo')
        .setDescription('Sube el archivo .cs')
        .setRequired(true)),

  // Ejecutar la función cuando se use el comando
  async execute(interaction) {
    const archivo = interaction.options.getAttachment('archivo');
    await interaction.deferReply(); // Retrasar la respuesta para dar tiempo a procesar

    try {
      // Descargar el archivo desde Discord
      const archivoPath = await descargarArchivo(archivo.url, archivo.name);

      const mensaje = await procesarArchivo(archivoPath);
      await interaction.editReply(mensaje); // Enviar el mensaje de respuesta al usuario
    } catch (error) {
      await interaction.editReply(`Hubo un error: ${error.message}`);
    }
  }
};

// Función para descargar el archivo desde Discord y asegurarse de que llegue intacto
async function descargarArchivo(url, nombreArchivo) {
  const archivoDestino = path.join(aStealFolder, nombreArchivo); // Guardamos directamente en la carpeta de aSteal

  const response = await axios({
    method: 'get',
    url: url,
    responseType: 'arraybuffer', // Cambio de 'stream' a 'arraybuffer' para evitar alteraciones
  });

  return new Promise((resolve, reject) => {
    fs.writeFileSync(archivoDestino, response.data); // Escribimos el archivo directamente en la carpeta de destino

    resolve(archivoDestino);
  });
}

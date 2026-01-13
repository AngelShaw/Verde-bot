const { REST, Routes, Collection, Events, EmbedBuilder } = require('discord.js');
const { clientId, token, prefix, developerIds } = require('../config.json');
const fs = require('node:fs');
const path = require('node:path');

module.exports = async (client) => {
    const commands = [];
    
    const foldersPath = path.join(__dirname, '../Comandos/slash');
    const commandFolders = fs.readdirSync(foldersPath);
    const prefixFolders = fs.readdirSync("./Comandos/prefix").filter((f) => f.endsWith(".js"));

    client.prefix = new Collection();
    client.commands = new Collection();

    client.log = require('./logs.js');

    // Cargar comandos slash
    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                const commandData = command.data.toJSON();
                client.commands.set(commandData.name, command);
                commands.push(commandData);
            } else {
                client.log.warn(`[PELIGRO] El comando en ${filePath} no tiene funcion "data" o "execute"`);
            }
        }
    }

    const rest = new REST().setToken(token);

    try {
        client.log.debug(`Iniciando actualización de ${commands.length} comandos de aplicación (/)...`);
        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );
        client.log.success(`Se cargaron ${data.length} comandos (/) correctamente.`);
    } catch (error) {
        client.log.error(error);
    }

    // Cargar comandos prefix y contar
    let prefixCount = 0;
    for (const arx of prefixFolders) {
        const Cmd = require(`../Comandos/prefix/${arx}`);
        client.prefix.set(Cmd.name, Cmd);
        prefixCount++; // Incrementa el contador de comandos prefix cargados
    }

    // Log de comandos prefix cargados
    client.log.success(`Se cargaron ${prefixCount} comandos prefix (!) correctamente.`);

    client.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if (!command) {
            client.log.error(`No se encontró ningún comando que coincida con ${interaction.commandName}.`);
            return;
        }

        // Verificación de `devOnly` para comandos slash
        if (command.devOnly && !developerIds.includes(interaction.user.id)) {
            const embed = new EmbedBuilder()
                .setTitle('Acceso Denegado')
                .setColor('Red')
                .setDescription('```Este comando solo está disponible para desarrolladores.```');

            return interaction.reply({ embeds: [embed], flags: 64 });
        }

        try {
            await command.execute(interaction, client);
        } catch (error) {
            client.log.error(error);
            await handleError(interaction, error);
        }
        if (command.execute) {
            client.log.info(`Comando: /${interaction.commandName} fue  ejecutado por ${interaction.user.tag}`);
        }
    });

    client.on('messageCreate', async message => {
        if (!message.content.startsWith(prefix) || message.author.bot) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = client.prefix.get(commandName);

        if (!command) return;

        // Verificación de `devOnly` para comandos prefix
        if (command.devOnly && !developerIds.includes(message.author.id)) {
            const embed = new EmbedBuilder()
                .setTitle('Acceso Denegado')
                .setColor('Red')
                .setDescription('```Este comando solo está disponible para desarrolladores.```');

            return message.reply({ embeds: [embed] });
        }

        try {
            await command.execute(message, args);
        } catch (error) {
            client.log.error(error);
            await handleError(message, error);
        }
        if (command.execute) {
            client.log.info(`Prefix: ${prefix}${commandName} fue ejecutado por ${message.author.tag}`);
        }
    });

    // Función para manejar los errores y enviarlos como mensaje
    async function handleError(context, error) {
        client.log.error(`Error: ${error.stack}`);
        const errorMessage = error.toString().slice(0, 3997) + '...';
        const embed = new EmbedBuilder()
            .setTitle('¡Ocurrió un error!')
            .setColor("Red")
            .setDescription('```' + errorMessage + '```');

        if (context.reply) {
            const replyMethod = (context.deferred || context.replied) ? 'followUp' : 'reply';
            await context[replyMethod]({ embeds: [embed], flags: 64 }).catch(console.error);
        } else {
            await context.channel.send({ embeds: [embed] }).catch(console.error);
        }
    }
};
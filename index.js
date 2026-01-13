require('./handlers/main')
const { Client, GatewayIntentBits, Collection, EmbedBuilder, AuditLogEvent, Partials, Events, ActionRowBuilder} = require("discord.js");
const fs = require("fs");
const config  = require("./config.json");
const path = require("path"); 
const Discord = require('discord.js');
const event = require('./events/guildMemberAdd.js');
const Giveaway = require('./schemas/New/giveaway');
const { scheduleGiveaway } = require('./Extras/giveaway/scheduleGiveaway');
const giveUserXp = require('./events/messageCreate/giveUserXp');
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const client = new  Client({
    intents: 3276799,
});
client.config = require("./config.json");;
client.log = require('./handlers/logs.js');

///////////////////////////////////// para ready

const readyHandler = require('./events/ready'); // Ajusta la ruta según tu estructura
client.once(readyHandler.name, () => readyHandler.execute(client));

client.login(process.env.TOKEN); // Asegúrate de que el token esté correctamente 

////////////////////////////////////////////////////////////////////////////////para elminar todos los links

const allowedLinks = [
    "https://rol.fenixzone.com",
    "https://rol2.fenixzone.com",
    "https://rol3.fenixzone.com",
    "https://rol4.fenixzone.com",
    "https://rol5.fenixzone.com",
    "https://fenixzone.com",
    "https://br.fenixzone.com",
    "https://tenor.com",
    "https://www.youtube.com",
    "https://youtu.be/",
    "https://discord.com/channels/"
  ];
  
  const monitoredChannels = [
    '1254983151692808213', '1260068458981232682', '1260068458981232682',
    '1245788920759717980', '1247058278379425874', '1073156680201814037',
    '964231600386760735', '1300741005968015420', '1217630376751792188',
    '1303107495065026642', '1340222049502892062'
  ];
  
  const adminRoleName = 'Administrador';
  
  client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (!monitoredChannels.includes(message.channel.id)) return;
    if (message.member.roles.cache.some(role => role.name === adminRoleName)) return;
  
    const content = message.content.toLowerCase();
    const inviteRegex = /(https?:\/\/)?(www\.)?(discord\.gg|discord\.com\/invite)\/[a-z0-9]+/gi;
    const hasDiscordInvite = inviteRegex.test(content);
  
    if (hasDiscordInvite) {
      try {
        await message.delete();
      } catch (error) {
        if (error.code !== 10008) {
        }
      }
      return;
    }
    const links = content.match(/https?:\/\/[^\s]+/g);
    if (links) {
      const allLinksAllowed = links.every(link =>
        allowedLinks.some(allowed => link.startsWith(allowed))
      );
  
      if (!allLinksAllowed) {
        try {
          await message.delete();
        } catch (error) {
          if (error.code !== 10008) {
          }
        }
      }
    }
  });
  

////////////////////////////////////////////// conectar con mongodb + sistema rank
client.on('messageCreate', async (message) => {
  await giveUserXp(client, message);
});

////////////////////////////////////////////////////reanudar los sorteos cuando reinicie bot

async function checkPendingGiveaways() {
    try {
        const pendingGiveaways = await Giveaway.find({ ended: false, endTime: { $gt: new Date() } });
        pendingGiveaways.forEach(giveaway => {
            scheduleGiveaway(client, giveaway);
        });
        client.log.pink(`Se reanudaron ${pendingGiveaways.length} sorteos pendientes.`);
    } catch (error) {
        client.log.error('Error al revisar sorteos pendientes:', error);
    }
}

client.once('ready', () => {
    checkPendingGiveaways();
});


////////////////////////////////// geminis IA

const { GoogleGenerativeAI } = require("@google/generative-ai");
const gpt = require("./schemas/geminis");

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  try {
    const Data = await gpt.findOne({ GuildId: message.guildId });
    if (Data === null) return;

    const API_KEY = "AIzaSyD59QrJvKH1odgLSFUUK8_z_zeMWjEjT3o";
    const MODEL = "gemini-pro";

    const ai = new GoogleGenerativeAI(API_KEY);
    const model = ai.getGenerativeModel({
      model: MODEL,
    });

    if (!Data || (message.channel.id !== Data.ChannelId && message.channel.parentId !== Data.ChannelId)) return;

    const { response } = await model.generateContent(message.cleanContent);
    const generatedText = response.text().trim();

    // Asegúrese de que la respuesta no está vacía y dentro del límite de caracteres
    const finalResponse =
      generatedText.length > 0
        ? generatedText.length > 2000
          ? generatedText.substring(0, 1997) + "..."
          : generatedText
        : "Lo siento, no pude generar una respuesta apropiada.";

    // Verificar si el mensaje es en el canal principal
    if (message.channel.id === Data.ChannelId) {
      // Crea un hilo y responde dentro del hilo
      const thread = await message.channel.threads.create({
        name: `Hilo de ${message.author.username}`,
        autoArchiveDuration: 60, // Duración en minutos antes de que el hilo se archive automáticamente
      });

      await thread.send({
        content: finalResponse,
        allowedMentions: {
          parse: ["everyone", "roles", "users"],
        },
      });
    } else if (message.channel.isThread()) {
      // Si el mensaje es en un hilo, responder en el mismo hilo
      await message.channel.send({
        content: finalResponse,
        allowedMentions: {
          parse: ["everyone", "roles", "users"],
        },
      });
    }
  } catch (e) {
    console.log(e);
  }
});

////////////////////////////////////////////// Sistema sugerencia
const { ButtonBuilder, ButtonStyle, PermissionsBitField } = require("discord.js");
const suggestion = require('./schemas/suggestionSchema.js');
const formatResults = require('./Extras/sugerencias/formatResults.js');

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.guild) return;
    if (!interaction.message) return;
    if (!interaction.isButton) return;

    const data = await suggestion.findOne({ GuildID: interaction.guild.id, Msg: interaction.message.id });
    if (!data) return;
    const message = await interaction.channel.messages.fetch(data.Msg);

    if (interaction.customId == 'upv') {
        if (data.Upmembers.includes(interaction.user.id)) {
            return await interaction.reply({ content: `¡No puedes volver a votar! Ya has enviado un voto a favor de esta sugerencia.`, ephemeral: true });
        }

        let Downvotes = data.downvotes;
        if (data.Downmembers.includes(interaction.user.id)) {
            Downvotes = Downvotes - 1;
            data.downvotes = data.downvotes - 1;
        }

        data.Upmembers.push(interaction.user.id);
        data.Downmembers.pull(interaction.user.id);

        const newEmbed = EmbedBuilder.from(message.embeds[0])
            .setFields(
                { name: `Positivos`, value: `> **${data.upvotes + 1}** Votos`, inline: true },
                { name: `Negativos`, value: `> **${Downvotes}** Votos`, inline: true },
                { name: `Autor`, value: `> <@${data.AuthorID}>` },
                { name: `Votos`, value: formatResults(data.Upmembers, data.Downmembers) }
            );

        const button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('upv')
                    .setLabel('Votos a favor')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('<a:up:1285398274198732881>'),
                new ButtonBuilder()
                    .setCustomId('downv')
                    .setEmoji('<a:down:1285398314946400350>')
                    .setLabel('Votos negativos')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('totalvotes')
                    .setEmoji('💭')
                    .setLabel('Votos')
                    .setStyle(ButtonStyle.Secondary)
            );

        try {
            // Actualiza el mensaje solo con los botones de votación
            await interaction.update({ embeds: [newEmbed], components: [button] });
        } catch (error) {
            if (error.code === 10062) {
                console.log('Interaction has expired.');
            } else {
                console.error('An error occurred:', error);
            }
        }

        data.upvotes++;
        data.save();
    }

    if (interaction.customId == 'downv') {
        if (data.Downmembers.includes(interaction.user.id)) {
            return await interaction.reply({ content: `¡No puedes votar 2 veces la misma opcion!`, ephemeral: true });
        }

        let Upvotes = data.upvotes;
        if (data.Upmembers.includes(interaction.user.id)) {
            Upvotes = Upvotes - 1;
            data.upvotes = data.upvotes - 1;
        }

        data.Downmembers.push(interaction.user.id);
        data.Upmembers.pull(interaction.user.id);

        const newEmbed = EmbedBuilder.from(message.embeds[0])
            .setFields(
                { name: `Positivos`, value: `> **${Upvotes}** Votos`, inline: true },
                { name: `Negativos`, value: `> **${data.downvotes + 1}** Votos`, inline: true },
                { name: `Autor`, value: `> <@${data.AuthorID}>` },
                { name: `Votos`, value: formatResults(data.Upmembers, data.Downmembers) }
            );

        const button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('upv')
                    .setLabel('Votos a favor')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('<a:up:1285398274198732881>'),
                new ButtonBuilder()
                    .setCustomId('downv')
                    .setEmoji('<a:down:1285398314946400350>')
                    .setLabel('Votos negativos')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('totalvotes')
                    .setEmoji('💭')
                    .setLabel('Votos')
                    .setStyle(ButtonStyle.Secondary)
            );

        try {
            // Actualiza el mensaje solo con los botones de votación
            await interaction.update({ embeds: [newEmbed], components: [button] });
        } catch (error) {
            if (error.code === 10062) {
                console.log('Interaction has expired.');
            } else {
                console.error('An error occurred:', error);
            }
        }

        data.downvotes++;
        data.save();
    }

    if (interaction.customId == 'totalvotes') {
        let upvoters = data.Upmembers.map(member => `<@${member}>`);
        let downvoters = data.Downmembers.map(member => `<@${member}>`);

        const embed = new EmbedBuilder()
            .addFields(
                { name: `Votos a favor (${upvoters.length})`, value: `> ${upvoters.join(', ').slice(0, 1020) || `Sin Votos Positivos!`}`, inline: true },
                { name: `Votos negativos (${downvoters.length})`, value: `> ${downvoters.join(', ').slice(0, 1020) || `Sin votos Negativos!`}`, inline: true }
            )
            .setColor('#CB1BFF')
            .setTimestamp()
            .setFooter({ text: `💭 Datos de votación` })
            .setAuthor({ name: `${interaction.guild.name}'s Sistema de sugerencias` });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (interaction.customId == 'appr' || interaction.customId == 'rej') {
        return; // Ignorar estos botones si se usan por alguna razón
    }
});


////////////////////////////////////////////////////////////////////// recuperar encuestas
const Poll = require('./schemas/PollSchema'); // Asegúrate de la ruta correcta

// Conexión a la base de datos
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Evento cuando el bot está listo
client.once('ready', async () => {
    const polls = await Poll.find({});
    
    for (const pollData of polls) {
        try {
            const channel = client.channels.cache.get(pollData.channelId);
            if (!channel) continue;

            const pollMsg = await channel.messages.fetch(pollData.messageId).catch(() => null);
            if (!pollMsg) continue;

            // Verificar que el mensaje fue creado por este bot
            if (pollMsg.author.id !== client.user.id) {
                continue;
            }

            if (!pollData.title) continue;

            const embed = new EmbedBuilder()
                .setTitle(pollData.title)
                .setColor('#CB1BFF')
                .setThumbnail(pollMsg.guild.iconURL({ dynamic: true }))
                .setFooter({ text: 'Gracias por votar 👻' });

            if (pollData.imageUrl) embed.setImage(pollData.imageUrl);

            const emojis = ['🇦', '🇧', '🇨', '🇩', '🇪'];
            const totalVotes = pollData.options.reduce((sum, opt) => sum + opt.votes, 0);
            const updatedFields = pollData.options.map((opt, index) => {
                const percentage = totalVotes > 0 ? ((opt.votes / totalVotes) * 100).toFixed(1) : 0.0;
                const progressBar = '█'.repeat(percentage / 10) + '▒'.repeat(10 - percentage / 10);
                return {
                    name: `${emojis[index]}: ${opt.text} - ${opt.votes} votos`,
                    value: `${progressBar} ${percentage}%`,
                    inline: false
                };
            });

            updatedFields.push({ name: 'Autor:', value: `> <@${pollData.authorId}>`, inline: false });
            embed.setFields(updatedFields);

            const pollRow = new ActionRowBuilder();
            pollData.options.forEach((_, index) => {
                pollRow.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`${pollData.pollId}_option${index + 1}`)
                        .setLabel(emojis[index])
                        .setStyle(ButtonStyle.Secondary)
                );
            });

            await pollMsg.edit({ embeds: [embed], components: [pollRow] });

            const collector = pollMsg.createMessageComponentCollector();

            collector.on('collect', async (i) => {
                if (!i.isButton()) return;
                const optionIndex = parseInt(i.customId.split('_option')[1]) - 1;
                const currentPollData = await Poll.findOne({ pollId: pollData.pollId });

                if (!currentPollData || optionIndex < 0 || optionIndex >= currentPollData.options.length) {
                    return await i.reply({ content: 'Opción no válida.', ephemeral: true });
                }

                const previousVoteIndex = currentPollData.options.findIndex(opt => opt.voters.includes(i.user.id));
                if (previousVoteIndex !== -1) {
                    currentPollData.options[previousVoteIndex].votes--;
                    currentPollData.options[previousVoteIndex].voters = currentPollData.options[previousVoteIndex].voters.filter(voter => voter !== i.user.id);
                }

                currentPollData.options[optionIndex].votes++;
                currentPollData.options[optionIndex].voters.push(i.user.id);
                await currentPollData.save();

                const totalVotes = currentPollData.options.reduce((sum, opt) => sum + opt.votes, 0);
                const updatedFields = currentPollData.options.map((opt, index) => {
                    const percentage = totalVotes > 0 ? ((opt.votes / totalVotes) * 100).toFixed(1) : 0.0;
                    const progressBar = '█'.repeat(percentage / 10) + '▒'.repeat(10 - percentage / 10);
                    return {
                        name: `${emojis[index]}: ${opt.text} - ${opt.votes} votos`,
                        value: `${progressBar} ${percentage}%`,
                        inline: false
                    };
                });

                updatedFields.push({ name: 'Autor:', value: `> <@${currentPollData.authorId}>`, inline: false });
                embed.setFields(updatedFields);

                await pollMsg.edit({ embeds: [embed] });
                await i.deferUpdate();
            });

            collector.on('end', async () => {
                const disabledRow = new ActionRowBuilder();
                pollRow.components.forEach(component => {
                    disabledRow.addComponents(ButtonBuilder.from(component).setDisabled(true));
                });
                await pollMsg.edit({ components: [disabledRow] });
            });

        } catch (error) {
            console.error('Error al restaurar encuesta:', error);
        }
    }
});

/////////////// sistema antilinks

const schema = require("./schemas/antilinks-enabled");
const { URL } = require('url');

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const db = await schema.findOne({ guildId: message.guild.id });
    if (!db || !db.enabled) return; 

    if (message.member && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return; 
    }

    const inviteRegex = /(discord\.gg\/[^\s]+)/g; 
    const invites = message.content.match(inviteRegex);

    if (invites) {
        try {
            await message.delete();  // Elimina el mensaje que contiene el link de invitación
        } catch (err) {
            console.error('Error al eliminar mensaje de invitación: ', err);
        }
    }

    if (db.ignoredChannels && db.ignoredChannels.includes(message.channel.id)) {
        return; 
    }

    // Revisa si el mensaje contiene enlaces generales
    const regex = /(https?:\/\/[^\s]+)/g;
    const urls = message.content.match(regex);

    // Si se encuentra algún enlace, lo eliminamos
    if (urls) {
        ///// Revisa que el enlace no este en la lista blanca
        const isInWhitelist = (db.whitelist || []).some(domain => {
            // Extrae el dominio de la URL
            return urls.some(url => {
                try {
                    const parsedUrl = new URL(url); ///// esto analiza el link
                    const cleanUrlDomain = parsedUrl.hostname.replace(/^www\./, '').toLowerCase(); /////// Dominio sin "www."
                    return cleanUrlDomain === domain; 
                } catch (err) {
                    console.error("Error al analizar la URL:", err);
                    return false;
                }
            });
        });

        if (!isInWhitelist) {
            try {
                await message.delete();  // Elimina el mensaje con el enlace
            } catch (err) {
                console.error('Error al eliminar mensaje: ', err);
            }
        }
    }
});

client.login(process.env.TOKEN);
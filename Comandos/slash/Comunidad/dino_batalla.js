const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ActionRowBuilder } = require('discord.js');

class Dinosaurio {
  constructor(nombre, salud, ataque, defensa) {
    this.nombre = nombre;
    this.salud = salud;
    this.ataque = ataque;
    this.defensa = defensa;
  }

  atacar(oponente) {
    const daño = Math.max(this.ataque - oponente.defensa, 0);
    oponente.salud -= daño;
    return daño;
  }
}

const dinosaurios = {
  't-rex': new Dinosaurio('T-Rex', 100, 20, 10),
  'velociraptor': new Dinosaurio('Velociraptor', 80, 25, 5),
  'stegosaurus': new Dinosaurio('Estegosaurio', 90, 15, 20),
  'triceratops': new Dinosaurio('Triceratops', 110, 10, 30),
  'brachiosaurus': new Dinosaurio('Braquiosaurio', 150, 10, 10),
  'ankylosaurus': new Dinosaurio('Anquilosaurio', 100, 5, 40),
  'spinosaurus': new Dinosaurio('Espinosaurio', 120, 20, 5),
  'pterodactyl': new Dinosaurio('Pterodáctilo', 70, 30, 5),
  'allosaurus': new Dinosaurio('Alosaurio', 90, 25, 10),
  'diplodocus': new Dinosaurio('Diplodocus', 200, 5, 5)
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dino')
    .setDescription('🦖⚔️🦕Desafía a otro usuario a un duelo de dinosaurios')
    .setDMPermission(false)
    .addUserOption(option =>
      option.setName('oponente')
        .setDescription('El usuario que deseas desafiar')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('dinosaurio')
        .setDescription('El dinosaurio con el que deseas luchar')
        .setRequired(true)
        .addChoices(
            { name: 'T-Rex', value: 't-rex' },
            { name: 'Velociraptor', value: 'velociraptor' },
            { name: 'Estegosaurio', value: 'stegosaurus' },
            { name: 'Triceratops', value: 'triceratops' },
            { name: 'Braquiosaurio', value: 'brachiosaurus' },
            { name: 'Anquilosaurio', value: 'ankylosaurus' },
            { name: 'Espinosaurio', value: 'spinosaurus' },
            { name: 'Pterodáctilo', value: 'pterodactyl' },
            { name: 'Alosaurio', value: 'allosaurus' },
            { name: 'Diplodocus', value: 'diplodocus' }
        )),
  async execute(interaction) {
    const opponent = interaction.options.getUser('oponente');
    const nombreDinosaurio = interaction.options.getString('dinosaurio');
    const dinosaurio = dinosaurios[nombreDinosaurio];

    if (!dinosaurio) {
      await interaction.reply({ content: `¡Error! El dinosaurio ${nombreDinosaurio} no es válido.`, ephemeral: true });
      return;
    }

    const challengeEmbed = new EmbedBuilder()
      .setColor(0x00AE86)
      .setTitle(`¡⚔️ Desafío de Dinosaurios 🦖!`)
      .setDescription(`${interaction.user.username} ha desafiado a ${opponent.username} a un duelo de dinosaurios con un ${dinosaurio.nombre}!`);

    const acceptButton = new ButtonBuilder()
      .setCustomId('accept_challenge')
      .setLabel('Aceptar Desafío')
      .setStyle(ButtonStyle.Success);

    const declineButton = new ButtonBuilder()
      .setCustomId('decline_challenge')
      .setLabel('Rechazar Desafío')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(acceptButton, declineButton);

    await interaction.reply({ embeds: [challengeEmbed], components: [row] });

    // Inicializar el colector para la respuesta del botón
    const filter = i => i.customId === 'accept_challenge' && i.user.id === opponent.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

    collector.on('collect', async i => {
      if (i.customId === 'accept_challenge') {
        await i.update({ content: `¡${opponent.username} ha aceptado el desafío!`, components: [] });

        // Crear botones para la selección de dinosaurios
        const dinosaurButtons = Object.keys(dinosaurios).map(dinoKey => {
          return new ButtonBuilder()
            .setCustomId(dinoKey)
            .setLabel(dinosaurios[dinoKey].nombre)
            .setStyle(ButtonStyle.Primary);
        });

        // Asegúrate de no exceder el límite de botones por fila (5 botones)
        const buttonRows = [];
        while(dinosaurButtons.length) {
          buttonRows.push(new ActionRowBuilder().addComponents(dinosaurButtons.splice(0, 5)));
        }

        const dinosaurSelectionEmbed = new EmbedBuilder()
          .setColor(0x00AE86)
          .setTitle(`¡Selecciona tu Dinosaurio!`)
          .setDescription(`${opponent.username}, elige el dinosaurio con el que deseas luchar usando los botones a continuación.`);

        await i.followUp({ embeds: [dinosaurSelectionEmbed], components: buttonRows });

        // Escuchar la respuesta del oponente a través de los botones
        const buttonFilter = buttonInteraction => buttonInteraction.user.id === opponent.id;
        const buttonCollector = i.channel.createMessageComponentCollector({ buttonFilter, time: 30000 });

        buttonCollector.on('collect', async buttonInteraction => {
          const oponenteDinosaurioNombre = buttonInteraction.customId;
          const oponenteDinosaurio = dinosaurios[oponenteDinosaurioNombre];

          if (!oponenteDinosaurio) {
            await buttonInteraction.reply({ content: `¡Error! El dinosaurio ${oponenteDinosaurioNombre} no es válido.`, ephemeral: true });
            return;
          }

          // Iniciar la batalla
          let turno = 0;
          let mensajeBatalla = `¡La batalla entre ${interaction.user.username} (${dinosaurio.nombre}) y ${opponent.username} (${oponenteDinosaurio.nombre}) ha comenzado!`;

          while (dinosaurio.salud > 0 && oponenteDinosaurio.salud > 0) {
            let atacante = turno % 2 === 0 ? dinosaurio : oponenteDinosaurio;
            let defensor = turno % 2 === 0 ? oponenteDinosaurio : dinosaurio;

            const daño = atacante.atacar(defensor);
            mensajeBatalla += `\n${atacante.nombre} ataca a ${defensor.nombre} y causa ${daño} puntos de daño!`;
            mensajeBatalla += `\n${defensor.nombre} tiene ${defensor.salud} puntos de salud restantes.`;
            turno++;

            // Limitar la longitud del mensaje de batalla
            if (mensajeBatalla.length > 1800) {
              mensajeBatalla += `\n...`;
              break;
            }
          }

          const ganador = dinosaurio.salud > 0 ? interaction.user.username : opponent.username;
          mensajeBatalla += `\n¡El ganador es ${ganador}!`;

          await buttonInteraction.update({ content: mensajeBatalla, components: [] });
        });

        buttonCollector.on('end', collected => {
          if (collected.size === 0) {
            i.followUp({ content: `Parece que ${opponent.username} no ha seleccionado un dinosaurio a tiempo.`, ephemeral: true });
          }
        });
      }
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        interaction.followUp({ content: `Parece que ${opponent.username} no ha respondido al desafío a tiempo.`, ephemeral: true });
      }
    });
  }
};
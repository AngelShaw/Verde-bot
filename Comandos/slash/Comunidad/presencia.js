const {
  SlashCommandBuilder,
  ContainerBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
} = require('discord.js');

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(process.cwd(), 'Extras', 'presence-panels.json');

const PANEL_STATE = new Map();
const ATTACHED_COLLECTORS = new Set();

function readPanels() {
  try {
    if (!fs.existsSync(DB_PATH)) return {};
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    return raw.trim() ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function savePanels(data) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function upsertPanelRecord(guildId, record) {
  const all = readPanels();
  all[guildId] = {
    ...(all[guildId] || {}),
    ...record,
  };
  savePanels(all);
}

function paginateLines(lines, maxChars = 2600) {
  const pages = [];
  let current = [];
  let currentLen = 0;

  for (const line of lines) {
    const addLen = line.length + (current.length ? 1 : 0);

    if (current.length && currentLen + addLen > maxChars) {
      pages.push(current.join('\n'));
      current = [line];
      currentLen = line.length;
    } else {
      current.push(line);
      currentLen += addLen;
    }
  }

  if (current.length) pages.push(current.join('\n'));
  return pages.length ? pages : ['Nadie en línea'];
}

function getSafeDisplayName(member) {
  return (
    member?.displayName ||
    member?.user?.globalName ||
    member?.user?.username ||
    `usuario-${member?.id?.slice?.(-4) || 'desconocido'}`
  );
}

function buildPresenceSnapshot(guild) {
  const counts = { online: 0, idle: 0, dnd: 0, offline: 0 };
  const onlineLines = [];

  for (const member of guild.members.cache.values()) {
    if (!member?.user || member.user.bot) continue;

    const status = member.presence?.status ?? 'offline';
    if (counts[status] !== undefined) counts[status] += 1;

    if (status === 'online') {
      const name = getSafeDisplayName(member);
      onlineLines.push(`• ${name}`);
    }
  }

  const pages = paginateLines(onlineLines.length ? onlineLines : ['Nadie en línea'], 2600);

  return { counts, pages };
}

function buildButtonsRow(messageId, index, total) {
  const first = new ButtonBuilder()
    .setCustomId(`presence_panel:${messageId}:first`)
    .setEmoji('⏪')
    .setStyle(ButtonStyle.Primary)
    .setDisabled(index === 0);

  const prev = new ButtonBuilder()
    .setCustomId(`presence_panel:${messageId}:prev`)
    .setEmoji('⬅️')
    .setStyle(ButtonStyle.Primary)
    .setDisabled(index === 0);

  const pageCount = new ButtonBuilder()
    .setCustomId(`presence_panel:${messageId}:count`)
    .setLabel(`${index + 1}/${total}`)
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(true);

  const next = new ButtonBuilder()
    .setCustomId(`presence_panel:${messageId}:next`)
    .setEmoji('➡️')
    .setStyle(ButtonStyle.Primary)
    .setDisabled(index === total - 1);

  const last = new ButtonBuilder()
    .setCustomId(`presence_panel:${messageId}:last`)
    .setEmoji('⏩')
    .setStyle(ButtonStyle.Primary)
    .setDisabled(index === total - 1);

  return new ActionRowBuilder().addComponents(first, prev, pageCount, next, last);
}

function buildPageText(snapshot, pageIndex) {
  const totalPages = snapshot.pages.length || 1;
  const page = snapshot.pages[pageIndex] || 'Nadie en línea';

  return [
    '# Panel de presencias en vivo',
    '',
    `**Online:** ${snapshot.counts.online} · **Idle:** ${snapshot.counts.idle} · **DND:** ${snapshot.counts.dnd} · **Offline:** ${snapshot.counts.offline}`,
    '',
    '**Usuarios online ahora**',
    page,
    '',
    `**Página ${pageIndex + 1}/${totalPages}**`,
  ].join('\n');
}

function buildContainer(snapshot, messageId, index) {
  const total = snapshot.pages.length || 1;

  return new ContainerBuilder()
    .setAccentColor(0x57f287)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(buildPageText(snapshot, index)),
    )
    .addSeparatorComponents(
      new SeparatorBuilder()
        .setDivider(true)
        .setSpacing(SeparatorSpacingSize.Small),
    )
    .addActionRowComponents(buildButtonsRow(messageId, index, total));
}

function setPanelState(messageId, state) {
  PANEL_STATE.set(messageId, state);
}

function getPanelState(messageId) {
  return PANEL_STATE.get(messageId);
}

function attachPaginationCollector(message) {
  if (ATTACHED_COLLECTORS.has(message.id)) return;
  ATTACHED_COLLECTORS.add(message.id);

  const collector = message.createMessageComponentCollector({
    filter: (i) => i.isButton() && i.customId.startsWith(`presence_panel:${message.id}:`),
  });

  collector.on('collect', async (interaction) => {
    try {
      const state = PANEL_STATE.get(message.id);
      if (!state) return interaction.deferUpdate().catch(() => {});

      const action = interaction.customId.split(':').pop();

      if (action === 'first') state.index = 0;
      if (action === 'prev') state.index = Math.max(0, state.index - 1);
      if (action === 'next') state.index = Math.min(state.snapshot.pages.length - 1, state.index + 1);
      if (action === 'last') state.index = state.snapshot.pages.length - 1;

      if (state.index < 0) state.index = 0;
      if (state.index >= state.snapshot.pages.length) state.index = state.snapshot.pages.length - 1;

      PANEL_STATE.set(message.id, state);

      await interaction.update({
        components: [buildContainer(state.snapshot, message.id, state.index)],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { parse: [] },
      }).catch(() => {});

      upsertPanelRecord(state.guildId, {
        channelId: state.channelId,
        messageId: message.id,
        index: state.index,
      });
    } catch (error) {
      console.error('[presence-panel collector]', error);
      try {
        await interaction.deferUpdate();
      } catch {}
    }
  });

  collector.on('end', () => {
    ATTACHED_COLLECTORS.delete(message.id);
  });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('panel-presencias')
    .setDescription('Publica un panel vivo de presencia de miembros'),

  readPanels,
  savePanels,
  upsertPanelRecord,
  buildPresenceSnapshot,
  buildContainer,
  setPanelState,
  getPanelState,
  attachPaginationCollector,

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const guild = interaction.guild;
    if (!guild) {
      return interaction.editReply('Este comando solo se puede usar dentro de un servidor.');
    }

    await guild.members.fetch().catch(() => null);

    const snapshot = buildPresenceSnapshot(guild);

    const message = await interaction.channel.send({
      components: [buildContainer(snapshot, 'temp', 0)],
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: [] },
    });

    const initialState = {
      guildId: guild.id,
      channelId: interaction.channel.id,
      messageId: message.id,
      index: 0,
      snapshot,
    };

    setPanelState(message.id, initialState);
    upsertPanelRecord(guild.id, {
      channelId: interaction.channel.id,
      messageId: message.id,
      index: 0,
    });

    await message.edit({
      components: [buildContainer(snapshot, message.id, 0)],
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: [] },
    }).catch(() => null);

    attachPaginationCollector(message);

    await interaction.editReply('Panel de presencias publicado correctamente.');
  },
};

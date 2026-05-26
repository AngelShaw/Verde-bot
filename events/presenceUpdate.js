const { MessageFlags } = require('discord.js');

const {
  readPanels,
  buildPresenceSnapshot,
  buildContainer,
  getPanelState,
  setPanelState,
  attachPaginationCollector,
} = require('../Comandos/slash/Comunidad/prueba');

module.exports = {
  name: 'presenceUpdate',
  async execute(oldPresence, newPresence) {
    const guild = newPresence?.guild || oldPresence?.guild;
    if (!guild) return;

    const panels = readPanels();
    const saved = panels[guild.id];
    if (!saved) return;

    const channel = await guild.channels.fetch(saved.channelId).catch(() => null);
    if (!channel || !channel.messages) return;

    const message = await channel.messages.fetch(saved.messageId).catch(() => null);
    if (!message) return;

    if (guild.members.cache.size === 0) {
      await guild.members.fetch().catch(() => null);
    }

    const snapshot = buildPresenceSnapshot(guild);

    const current = getPanelState(message.id) || {
      guildId: guild.id,
      channelId: saved.channelId,
      messageId: saved.messageId,
      index: saved.index || 0,
      snapshot,
    };

    current.snapshot = snapshot;
    current.index = Math.min(current.index || 0, snapshot.pages.length - 1);
    if (current.index < 0) current.index = 0;

    setPanelState(message.id, current);

    await message.edit({
      components: [buildContainer(snapshot, message.id, current.index)],
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: [] },
    }).catch(() => null);

    attachPaginationCollector(message);
  },
};

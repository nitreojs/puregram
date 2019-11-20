function formatUser(source) {
  return {
    id: source.id,
    isBot: source.is_bot,
    firstName: source.first_name,
    lastName: source.last_name || null,
    username: source.username || null,
    languageCode: source.language_code || null,
  };
}

function formatChat(source) {
  return {
    id: source.id,
    type: source.type,
    title: source.title || null,
    username: source.username || null,
    firstName: source.first_name || null,
    lastName: source.last_name || null,
    photo: source.photo || null,
    description: source.description || null,
    inviteLink: source.invite_link || null,
    pinnedMessage: source.pinned_message || null,
    permissions: source.permissions || null,
    stickerSetName: source.sticker_set_name || null,
    canSetStickerSet: source.can_set_sticker_set || null,
  };
}

function filterPayload(payload) {
  let filtered = {};

  Object.keys(payload).forEach(
    (key) => {
      if (payload[key] !== undefined && payload[key] !== null) {
        filtered[key] = payload[key];
      }
    },
  );

  return filtered;
}

module.exports = {
  formatUser,
  formatChat,
  filterPayload,
};

class MarkdownV2 {
  [Symbol.toStringTag]() {
    return 'MarkdownV2';
  }

  static bold(text) {
    return `*${text}*`;
  }

  static italic(text) {
    return `_${text}_`;
  }

  static underline(text) {
    return `__${text}__`;
  }

  static strikethrough(text) {
    return `~${text}~`;
  }

  static url(text, link) {
    return `[${text}](${link})`;
  }

  static mention(text, id) {
    return `[${text}](tg://user?id=${id})`;
  }

  static code(text) {
    return `\`${text}\``;
  }

  static pre({
    language = '',
    code,
  }) {
    return `\`\`\`${language}\n${code}\n\`\`\``;
  }

  static brackets(text) {
    return `\\(${text}\\)`
  }

  static curlyBraces(text) {
    return `\\{${text}\\}`
  }

  static squareBraces(text) {
    return `\\[${text}\\]`
  }

  static get parseMode() {
    return 'MarkdownV2';
  }

  static toString() {
    return 'MarkdownV2';
  }
}

module.exports = MarkdownV2;

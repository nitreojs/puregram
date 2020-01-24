class Markdown {
  [Symbol.toStringTag]() {
    return 'Markdown';
  }

  static bold(text) {
    return `*${text}*`;
  }

  static italic(text) {
    return `_${text}_`;
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
    return 'Markdown';
  }

  static toString() {
    return 'Markdown';
  }
}

module.exports = Markdown;

function replaceSymbols(text) {
  return text.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

class HTML {
  [Symbol.toStringTag]() {
    return 'HTML';
  }

  static bold(text) {
    text = replaceSymbols(text);

    return `<b>${text}</b>`;
  }

  static italic(text) {
    text = replaceSymbols(text);

    return `<i>${text}</i>`;
  }

  static underline(text) {
    text = replaceSymbols(text);

    return `<u>${text}</u>`;
  }

  static strikethrough(text) {
    text = replaceSymbols(text);

    return `<strike>${text}</strike>`;
  }

  static url(text, link) {
    text = replaceSymbols(text);

    return `<a href="${link}">${text}</a>`;
  }

  static mention(text, id) {
    text = replaceSymbols(text);

    return `<a href="tg://user?id=${id}">${text}</a>`;
  }

  static code(text) {
    text = replaceSymbols(text);

    return `<code>${text}</code>`;
  }

  static pre(code) {
    text = replaceSymbols(text);

    return `<pre>${code}</pre>`;
  }

  static get parseMode() {
    return 'HTML';
  }

  static toString() {
    return 'HTML';
  }
}

module.exports = HTML;

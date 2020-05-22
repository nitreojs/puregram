let Markdown = require('./attachments/markdown');
let MarkdownV2 = require('./attachments/markdown-v2');
let HTML = require('./attachments/html');

class Utils {
  static tokenize({ text, entities, parseMode } = {}) {
    if (!entities.length) return text;

    let parseModes = {
      Markdown,
      HTML,
      MarkdownV2
    };

    let mode = parseModes[parseMode];

    let lastOffset = 0;
    let result = '';

    for (let i = 0; i < entities.length; i++) {
      let entity = entities[i];

      let parseableEntities = [
        'bold', 'italic', 'underline',
        'strikethrough', 'code', 'text_link'
      ];

      if (parseableEntities.includes(entity.type)) {
        let nextEntity = entities[i + 1] || { offset: text.length };
        let type = entity.type === 'text_link' ? 'url' : entity.type;
        let func = mode[type] || (e => e);

        let partStart = text.slice(lastOffset, entity.offset);
        let part = text.slice(entity.offset, entity.offset + entity.length);
        let partEnd = text.slice(entity.offset + entity.length, nextEntity.offset);

        lastOffset = nextEntity.offset;

        let args = type === 'url' ? [part, entity.url] : [part];

        result += `${partStart}${func(...args)}${partEnd}`;
      }
    }

    return result;
  }
}

module.exports = Utils;

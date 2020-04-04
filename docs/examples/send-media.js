let { Telegram } = require('puregram');
let fs = require('fs');
let fetch = require('node-fetch');

let telegram = new Telegram({
  token: process.env.TOKEN,
});

let filePath = process.env.FILE_PATH;
let photoUrl = process.env.PHOTO_URL;

telegram.updates.on(
  'message',
  async (context, next) => {
    if (context.hasAttachments()) {
      //             expecting attachment to be a photo
      // because there is no attachment type for photos

      let { fileId } = context.attachments[0][0];

      await context.sendPhoto(fileId, { caption: 'This photo is sent using file ID' });
    }

    return next();
  }
);

telegram.updates.hear(
  '/url',
  async (context) => {
    await context.sendPhoto(photoUrl, { caption: 'This photo is sent via URL' });
  }
);

telegram.updates.hear(
  '/stream',
  async (context) => {
    let stream = fs.createReadStream(filePath);

    await context.sendPhoto(stream, { caption: 'This photo is sent using streams' });
  }
);

telegram.updates.hear(
  '/path',
  async (context) => {
    await context.sendPhoto(filePath, { caption: 'This photo is sent by file path' });
  }
);

telegram.updates.hear(
  '/buffer',
  async (context) => {
    let fetchResponse = await fetch(photoUrl);
    let buffer = await fetchResponse.buffer();

    await context.sendPhoto(buffer, { caption: 'This photo is sent using buffers' });
  }
);

//      You can use any API method that can work with media
// using any of these methods (URL, stream, path or buffer).

telegram.updates.startPolling();

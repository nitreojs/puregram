let { Telegram } = require('puregram');
let fs = require('fs');
let fetch = require('node-fetch');

let telegram = new Telegram({
  token: process.env.TOKEN,
});

let filePath = process.env.FILE_PATH;
let photoUrl = process.env.PHOTO_URL;

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

telegram.updates.startPolling();

// Simple inline bot that generates QR codes

let { Telegram } = require('puregram');

let telegram = new Telegram({
  token: process.env.TOKEN
});

// Function that generates URL by size and data
// thanks to goqr.me!
function generateUrl({ size, data }) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&format=jpeg&margin=25&data=${encodeURIComponent(data)}`;
}

function generateUrls(data) {
  return [
    generateUrl({ size: 300, data }),
    generateUrl({ size: 150, data })
  ];
}

// Example QR codes
let exampleUrls = generateUrls('Example');

telegram.updates.on(
  'inline_query',
  async (context) => {
    // If the query is empty (''),
    // then we can send example QR codes
    if (!context.query) {
      return context.answerInlineQuery([
        {
          id: context.id,
          type: 'photo',
          photo_url: exampleUrls[0],
          thumb_url: exampleUrls[1]
        }
      ]);
    }

    // Now we know, the context.query is NOT empty
    // so we can generate QR code according to context.query

    let [photoUrl, thumbUrl] = generateUrls(context.query);

    // https://core.telegram.org/bots/api#inlinequeryresultphoto
    let results = [
      {
        type: 'photo',
        photo_url: photoUrl,
        thumb_url: thumbUrl,
        id: context.id
      }
    ];

    // https://core.telegram.org/bots/api#answerinlinequery
    let params = {
      cache_time: 60,
      is_personal: true
    };

    await context.answerInlineQuery(results, params);
  }
);

telegram.updates.startPolling();

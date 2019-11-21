# @puregram/session

Puregram session - simple implementation of the sessions ⚙️

## Installation
> **[Node.js](https://nodejs.org/) 8.0.0 or newer is required**  

### Yarn
```
yarn add @puregram/session
```

### NPM
```
npm i @puregram/session
```

## Example usage
```js
let { Telegram } = require('puregram');

let { SessionManager } = require('@puregram/session');

let telegram = new Telegram({
	token: process.env.TOKEN,
});

let sessionManager = new SessionManager();

telegram.updates.on('message', sessionManager.middleware);

telegram.updates.on('message', async (context) => {
  if (context.text !== '/counter') return;

  let { session } = context;

	if (!session.counter) {
		session.counter = 0;
	}

	session.counter += 1;

	await context.send(`You turned to the bot (${session.counter}) times`);
});

telegram.updates.start().catch(console.error);
```

## Implementation
Implementation by [Negezor](https://github.com/negezor)

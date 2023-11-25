<div align='center'>
  <img src='https://i.imgur.com/ZzjmE8i.png' />
</div>

<br />

<div align='center'>
  <a href='https://github.com/nitreojs/puregram'><b><code>puregram</code></b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='https://t.me/pureforum'><b>telegram forum</b></a>
</div>

## @puregram/media-cacher

_cache sent media `file_id`s with ease for `puregram` package_

### introduction

if you send a lot of similar `MediaSource.path` or `MediaSource.url`
media files you've probably encountered a problem with the speed
of uploading those files. sometimes those files might be really
heavy, and it's not like you really want to wait these extra
times every time, do you? that's why you probably need `@puregram/media-cacher`

### example

```js
const { Telegram, MediaSource } = require('puregram')
const { hooks: cacheHooks } = require('@puregram/media-cacher')

const telegram = Telegram.fromToken(process.env.TOKEN)

telegram.useHooks(cacheHooks())

telegram.updates.on('message', (context) => {
  return context.sendPhoto(MediaSource.path(PATH_TO_FILE))
})

telegram.updates.startPolling()
```

if the file is heavy, it might take some time to send the photo
the first time, but next times will be much faster since the
`PATH_TO_FILE` will be cached with correspnding `fileId`!

### installation

```sh
$ yarn add @puregram/media-cacher
$ npm i -S @puregram/media-cacher
```

### custom `storage`

internally `@puregram/media-cacher` uses `MemoryStorage` that will
keep everything in memory. this means that after your bot reloads
everything will be lost. you might want to use another storage
(like redis or something):

```js
const { RedisStorage } = require('some-redis-storage-implementation-i-guess')

telegram.useHooks(
  cacheHooks({
    storage: new RedisStorage({
      ...
    })
  })
)
```

### `getStorageKey`

as all storage-based `puregram` packages, `@puregram/media-cacher` exposes `getStorageKey`
function that allows you to set user keys according to your needs. that `key` will
be used in the storage (`storage.get(key)`, `storage.has(key)`) to store the `fileId`

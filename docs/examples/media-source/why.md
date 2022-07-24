# why creating `MediaSource`?

originally, you didn't have to use `MediaSource` to send media.
all you needed is to pass the value itself to the proper method and that's it.

```js
context.sendPhoto('../path/to/photo.png', { ... })
```

**but why didn't i stick to this format?**

## inferring problem

back then `puregram` tried to guess whether your value is a path, a URL, a Buffer and so on.
this is not hard, but is also not very practical because:

- you might *crash* `node:fs` by using invalid characters in your files name;
- if value is `https://foo`, *is it a URL or a path to a file?*;
- even if value is a URL, `puregram` **needs** to check *whether this URL is valid* (thus losing some speed because of RegExp tests);
- file validation is also kind of slow, *especially if the value is not a path to a file* =)

... and so on

## unification

by using `MediaSource` you mark everything related to media methods with `MediaSource` thus making easier
for you to keep your styleguide!

```js
const buffer = MediaSource.buffer(...)
const path = MediaSource.path(...)

context.sendPhoto(buffer)
context.sendDocument(path) // truly epic
```

## explicitness

with `MediaSource` it's much easier to tell what type of data you will pass into `puregram`s methods.
also, it's simply easier for you to read!

```js
context.sendDocument(MediaSource.buffer(getBuffer())) // INFO: IDE suggestions help me by showing that i need to pass a Buffer
context.sendAudio(MediaSource.path('moan.ogg')) // INFO: puregram will just lookup for 'moan.ogg' file, that's it
```

## bugless

it's kind of proven that this way is waaay less buggy than auto-inferring, i've described earlier why

```js
context.sendPhoto(MediaSource.path('https.png')) // INFO: puregram knows it's a path!
```

## validation made easier

even if you are using javascript, `puregram@^2.5.0` will tell you to use `MediaSource` when you don't.
with `MediaSource` it's way simpler for `puregram` to validate your input since it only has to rely on
`type` and `value`. nice!

```js
   MediaSource.path('path/to/file.dat')
// ^           ^    ^
// |           |    +----- and the document is located at [path/to/file.dat]. easy!
// |           +----- okay, we're sending a that media via [path]
// +----- oh, we're passing `MediaSource`! that means we are going to send some [media]
```
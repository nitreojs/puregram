# @puregram/scenes

> v3 alpha — work in progress

multi-step scene/wizard plugin for puregram v3:

- `scenes()` plugin — `tg.extend(session()).extend(scenes({ scenes: [...] }))` attaches `update.scene` (a `SceneContext`) on every dispatched update with an addressable user/chat
- `Scene` interface + `StepScene` class — the v2 building blocks, ported verbatim
- scene state persists transparently via `@puregram/session` (depends on it)

### behavior changes from v2

- module augmentation (`declare module 'puregram'`) replaced with the `tg.extend(...)` typed plugin model
- `SceneManager` is no longer a public class — `tg.scenes.{add, has, remove, all}` is the runtime registry
- two updates from the same scene-active user delivered in the same polling batch race on `update.session.__scene` reads/writes (matches v2; documented escape hatch is a per-key mutex in user code)

documentation, examples, and a v2-to-v3 migration note will land alongside the v3 stable release.

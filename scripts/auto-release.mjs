// creates a github release for every package-release commit pushed to the default branch.
//
// a release commit looks like `feat(<scope>): <pkg>@<x>.<y>.<z>` (with an optional ` (#nn)`
// suffix when squash-merged), e.g. `feat(api): @puregram/api@10.1.3` or `feat(core): puregram@3.4.0`.
//
// the release body lists every commit scoped to <scope> since that package's previous release,
// excluding docs(<scope>) and the release markers themselves. set DRY_RUN=1 to print instead of create.

import { execFileSync } from 'node:child_process'

const REPO = process.env.GITHUB_REPOSITORY ?? 'puregram/puregram'
const BEFORE = process.env.BEFORE ?? ''
const AFTER = process.env.AFTER ?? 'HEAD'
const DRY_RUN = process.env.DRY_RUN === '1'

// `feat(api): @puregram/api@10.1.3` → [, 'api', '@puregram/api', '10.1.3']
const RELEASE_RE = /^feat\(([^)]+)\): (\S+)@(\d+\.\d+\.\d+)(?: \(#\d+\))?$/
const CONVENTIONAL_RE = /^(\w+)\(([^)]+)\)!?: (.+)$/

// the bot-api watcher historically used these forms before switching to the standard
// `feat(api): @puregram/api@x.y.z`; treat them as release markers too, so a resync bounds
// against the previous release and never lists itself as a changelog entry
const RESYNC_RE = /^chore\(api\): resync @puregram\/api \d+\.\d+\.\d+(?: \(#\d+\))?$/
const BOTAPI_RE = /^feat\(api\): bot api \d+\.\d+\.\d+(?: \(#\d+\))?$/

const isReleaseMarker = (subject) => RELEASE_RE.test(subject) || RESYNC_RE.test(subject) || BOTAPI_RE.test(subject)

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim()
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const logLines = (range) => {
  let out = ''

  try {
    out = git('log', '--no-merges', '--format=%h%x09%H%x09%s', range)
  } catch {
    return []
  }

  if (!out) {
    return []
  }

  return out.split('\n').map((line) => {
    const [short, sha, ...rest] = line.split('\t')

    return { short, sha, subject: rest.join('\t') }
  })
}

// commits introduced by this push (or just the tip when there is no usable `before`)
function pushedCommits () {
  const range = BEFORE && !/^0+$/.test(BEFORE) ? `${BEFORE}..${AFTER}` : AFTER

  return logLines(range)
}

// most recent release commit for the same package strictly before `releaseSha`
function previousReleaseSha (scope, pkg, releaseSha) {
  const featRe = new RegExp(`^feat\\(${escapeRe(scope)}\\): ${escapeRe(pkg)}@\\d`)
  const isMarker = (subject) =>
    featRe.test(subject) || (scope === 'api' && (RESYNC_RE.test(subject) || BOTAPI_RE.test(subject)))

  for (const { sha, subject } of logLines(releaseSha)) {
    if (sha === releaseSha) {
      continue
    }

    if (isMarker(subject)) {
      return sha
    }
  }

  return null
}

function buildBody (scope, pkg, version, releaseSha) {
  const prev = previousReleaseSha(scope, pkg, releaseSha)
  const range = prev ? `${prev}..${releaseSha}` : releaseSha

  const bullets = []

  for (const { short, subject } of logLines(range)) {
    const match = CONVENTIONAL_RE.exec(subject)

    if (!match) {
      continue
    }

    const [, type, sc] = match

    if (sc !== scope || type === 'docs' || isReleaseMarker(subject)) {
      continue
    }

    bullets.push(`- ${subject} (${short})`)
  }

  const header = `[${pkg}@${version}](https://www.npmjs.com/package/${pkg}/v/${version})`

  return bullets.length > 0 ? `${header}\n\n${bullets.join('\n')}` : `${header}\n\n_no notable changes_`
}

function releaseExists (tag) {
  try {
    execFileSync('gh', ['release', 'view', tag, '--repo', REPO], { stdio: 'ignore' })

    return true
  } catch {
    return false
  }
}

const seen = new Set()

for (const { sha, subject } of pushedCommits()) {
  const match = RELEASE_RE.exec(subject)

  if (!match) {
    continue
  }

  const [, scope, pkg, version] = match
  const tag = `${pkg}@${version}`

  if (seen.has(tag)) {
    continue
  }

  seen.add(tag)

  if (!DRY_RUN && releaseExists(tag)) {
    console.log(`skip ${tag} — release already exists`)

    continue
  }

  const body = buildBody(scope, pkg, version, sha)

  if (DRY_RUN) {
    console.log(`\n=== ${tag} @ ${sha.slice(0, 7)} ===\n${body}\n`)

    continue
  }

  console.log(`creating release ${tag} @ ${sha.slice(0, 7)}`)
  execFileSync('gh', ['release', 'create', tag, '--repo', REPO, '--target', sha, '--title', tag, '--notes', body], {
    stdio: ['ignore', 'inherit', 'inherit']
  })
}

// maps a schema diff onto the skills that document the changed surface, so the bot-api-watch pr
// says which SKILL.md files need a matching edit instead of leaving it to memory.
//
//   tsx scripts/affected-skills.ts <old-schema.json> <new-schema.json>
//
// prints a markdown checklist on stdout, or nothing when no watched surface moved.

import { readFileSync } from 'node:fs'

import type { Schema, SchemaObject } from './lib/schema-types'

interface Watch {
  skills: string[]
  matches: (name: string) => boolean
}

const WATCHED: Watch[] = [
  {
    skills: ['telegram-rich-messages', 'rich-message-authoring', 'puregram-rich'],
    matches: name => /^(Input)?Rich/.test(name) || name === 'sendRichMessage' || name === 'sendRichMessageDraft'
  },
  {
    skills: ['puregram-stream'],
    matches: name => name === 'sendMessageDraft' || name === 'sendRichMessageDraft' || name === 'MessageGenerationStopped'
  },
  {
    skills: ['using-puregram'],
    matches: name => /^(Ephemeral|InlineKeyboard|ReplyKeyboard|KeyboardButton|DisabledButton)/.test(name)
  },
  {
    skills: ['puregram-callback-data'],
    matches: name => name === 'CallbackQuery' || name === 'answerCallbackQuery'
  }
]

function load (path: string) {
  return JSON.parse(readFileSync(path, 'utf8')) as Schema
}

function fieldNames (object: SchemaObject) {
  if (object.kind === 'object') {
    return object.fields.map(field => field.name)
  }

  return object.kind === 'enum' ? object.values : []
}

/** every object / method name whose presence or shape differs between the two schemas */
function changedNames (before: Schema, after: Schema) {
  const changed = new Set<string>()

  const objectsBefore = new Map(before.objects.map(o => [o.name, o]))

  for (const object of after.objects) {
    const previous = objectsBefore.get(object.name)

    if (previous === undefined || JSON.stringify(fieldNames(previous)) !== JSON.stringify(fieldNames(object))) {
      changed.add(object.name)
    }
  }

  const methodsBefore = new Map(before.methods.map(m => [m.name, m]))

  for (const method of after.methods) {
    const previous = methodsBefore.get(method.name)
    const args = method.arguments.map(a => a.name)

    if (previous === undefined || JSON.stringify(previous.arguments.map(a => a.name)) !== JSON.stringify(args)) {
      changed.add(method.name)
    }
  }

  for (const name of [...objectsBefore.keys()].filter(n => !after.objects.some(o => o.name === n))) {
    changed.add(name)
  }

  for (const name of [...methodsBefore.keys()].filter(n => !after.methods.some(m => m.name === n))) {
    changed.add(name)
  }

  return changed
}

const [oldPath, newPath] = process.argv.slice(2)

if (oldPath === undefined || newPath === undefined) {
  console.error('usage: tsx scripts/affected-skills.ts <old-schema.json> <new-schema.json>')
  process.exit(1)
}

const changed = changedNames(load(oldPath), load(newPath))
const hits = new Map<string, string[]>()

for (const watch of WATCHED) {
  const names = [...changed].filter(name => watch.matches(name)).sort()

  if (names.length === 0) {
    continue
  }

  for (const skill of watch.skills) {
    hits.set(skill, [...new Set([...(hits.get(skill) ?? []), ...names])].sort())
  }
}

if (hits.size === 0) {
  process.exit(0)
}

console.log('### skills that document the changed surface')
console.log()
console.log('`~/puregram-skills` ships with the code that changes it — these need a matching edit:')
console.log()

for (const [skill, names] of [...hits].sort()) {
  const shown = names.slice(0, 8).join(', ')
  const rest = names.length > 8 ? `, +${names.length - 8} more` : ''

  console.log(`- [ ] \`${skill}/SKILL.md\` — ${shown}${rest}`)
}

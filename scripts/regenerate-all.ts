// regenerate the v3 codegen pipeline end-to-end.
// run via `yarn regenerate-all` after a new bot api version drops

import { spawn } from 'node:child_process'

interface Step {
  label: string
  command: string
  args: string[]
}

const STEPS: Step[] = [
  // 1. fetch + parse the latest schema, emit @puregram/api/src/generated/*
  { label: '@puregram/api regenerate', command: 'yarn', args: ['workspace', '@puregram/api', 'regenerate'] },
  { label: '@puregram/api verify', command: 'yarn', args: ['workspace', '@puregram/api', 'verify'] },

  // 2. plugin augmentations (per-update declaration merges driven by the same schema)
  { label: '@puregram/flow augmentations', command: 'yarn', args: ['workspace', '@puregram/flow', 'generate:augmentations'] },
  { label: '@puregram/session augmentations', command: 'yarn', args: ['workspace', '@puregram/session', 'generate:augmentations'] },

  // 3. build everything so downstream packages pick up the new types
  { label: 'workspace build', command: 'yarn', args: ['build'] },

  // 4. tests + lint as a final gate
  { label: 'tests', command: 'yarn', args: ['test'] },
  { label: 'lint', command: 'yarn', args: ['lint'] }
]

const ESC = '['
const CYAN = `${ESC}36m`
const DIM = `${ESC}2m`
const GREEN = `${ESC}32m`
const RED = `${ESC}31m`
const RESET = `${ESC}0m`

async function run (step: Step) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(step.command, step.args, { stdio: 'inherit' })

    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) {
        resolve()

        return
      }

      reject(new Error(`${step.label} exited with code ${code ?? 'null'}`))
    })
  })
}

async function main () {
  const startedAt = Date.now()

  for (let i = 0; i < STEPS.length; i++) {
    const step = STEPS[i]

    console.log(`\n${CYAN}[${i + 1}/${STEPS.length}] ${step.label}${RESET}`)
    console.log(`${DIM}$ ${step.command} ${step.args.join(' ')}${RESET}`)

    await run(step)
  }

  const seconds = ((Date.now() - startedAt) / 1000).toFixed(1)

  console.log(`\n${GREEN}✓ regenerate-all complete in ${seconds}s${RESET}`)
  console.log('next: review git diff, commit per-package, push.')
}

main().catch((error: unknown) => {
  console.error(`\n${RED}✗ regenerate-all failed${RESET}`)
  console.error(error)
  process.exit(1)
})

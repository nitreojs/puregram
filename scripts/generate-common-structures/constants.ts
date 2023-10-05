import path from 'node:path'

export const PUREGRAM_SRC_PATH = path.resolve(__dirname, '..', '..', 'packages', 'puregram', 'src')
export const PUREGRAM_STRUCTURES_PATH = path.resolve(PUREGRAM_SRC_PATH, 'common', 'structures')
export const PUREGRAM_GENERATED_INTERFACES_PATH = path.resolve(PUREGRAM_SRC_PATH, 'generated', 'telegram-interfaces.ts')

export const IGNORED_TYPES = ['InputFile', 'PossibleParseMode', 'ReplyMarkupUnion', 'Currency']

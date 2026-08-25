/** draft ids reserved per stream run, so concurrent runs in one chat never share an id */
export const DRAFT_IDS_PER_RUN = 256

/** ephemeral draft preview ttl on telegram clients */
export const DRAFT_TTL_MS = 30_000

/** how much head room to reserve before draft ttl expires when forcing a finalize */
export const DRAFT_SAFETY_MS = 2_000

/** bot api hard cap on message text length */
export const MAX_CHUNK = 4096

/** bot api hard cap on rich-message text length */
export const MAX_RICH_CHUNK = 32_768

/** draft_id must be non-zero; ids are reduced modulo this range to fit a 32-bit positive int */
export const DRAFT_ID_MAX = 0xFFFF_FFFF

/** default soft floor between sendMessageDraft calls */
export const DEFAULT_EDIT_INTERVAL_MS = 250

/** default ceiling on local backoff before dropping a stale draft tick */
export const DEFAULT_MAX_EDIT_BACKOFF = 4_000

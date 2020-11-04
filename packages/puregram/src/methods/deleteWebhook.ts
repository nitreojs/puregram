export interface DeleteWebhookParams {
  /** Pass `true` to drop all pending updates */
  drop_pending_updates?: boolean;
}

/**
 * Use this method to remove webhook integration if you decide to switch back
 * to `getUpdates`.
 */
export type deleteWebhook = (params: DeleteWebhookParams) => Promise<true>;

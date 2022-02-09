import { clientRegistry } from "../index";
import {
  addNewWebhookQuery,
  getWebhookUrlsQuery,
  removeWebhookQuery,
  updateWebhookQuery,
  Webhook,
  WebhooksResponse,
} from "./webhookQueries";

export class WebhookRegistry {
  async getWebhookUrls(target: string) {
    const client = await clientRegistry.getClient(target);

    const { data: webhooks } = (await client?.query(
      getWebhookUrlsQuery()
    )) as WebhooksResponse;

    return webhooks.reduce((acc: { [key: string]: Webhook[] }, w: Webhook) => {
      if (acc[w.type]) {
        acc[w.type].push(w);
      } else {
        acc[w.type] = [w];
      }
      return acc;
    }, {});
  }

  async addWebhook(username: string, webhook: Webhook) {
    const client = await clientRegistry.getClient(`#${username.toLowerCase()}`);
    const saveRes = await client
      ?.query(addNewWebhookQuery(webhook))
      .catch(console.error);

    return saveRes;
  }

  async updateWebhook(username: string, webhook: Webhook) {
    const client = await clientRegistry.getClient(`#${username}`);

    return client?.query(updateWebhookQuery(webhook));
  }

  async removeWebhook(username: string, webhook: Webhook) {
    const client = await clientRegistry.getClient(`#${username}`);

    return client?.query(removeWebhookQuery(webhook));
  }
}

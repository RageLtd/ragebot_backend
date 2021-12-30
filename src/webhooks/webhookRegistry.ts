import { clientRegistry } from "../index";
import {
  getWebhookUrlsQuery,
  updateWebhookQuery,
  WebhooksResponse,
} from "./webhookQueries";

export class WebhookRegistry {
  async getWebhookUrls(target: string) {
    const client = await clientRegistry.getClient(target);

    const { data: webhooks } = (await client?.query(
      getWebhookUrlsQuery()
    )) as WebhooksResponse;

    return webhooks;
  }

  async addWebhook() {
    throw new Error("Implement adding a webhook, dumbass");
  }

  async updateWebhook(
    username: string,
    webhook: { name: string; webhookUrls: string[] }
  ) {
    const client = await clientRegistry.getClient(`#${username}`);

    return client?.query(updateWebhookQuery(webhook));
  }
}

import { clientRegistry } from "../index";
import { getWebhookUrlsQuery, WebhooksResponse } from "./webhookQueries";

type WebhookMap = {
  [key: string]: {
    [key: string]: string[];
  };
};

export class WebhookRegistry {
  webhooks: WebhookMap = {};

  async getWebhookUrls(target: string) {
    if (this.webhooks[target]) {
      return this.webhooks[target];
    }

    const client = await clientRegistry.getClient(target);

    const { data: webHooks } = (await client?.query(
      getWebhookUrlsQuery()
    )) as WebhooksResponse;

    const oldWebhooks = this.webhooks[target] || {};

    this.webhooks[target] = {
      ...oldWebhooks,
      ...webHooks?.reduce(
        (acc: { [key: string]: string[] }, { name, webhookUrl }) => ({
          ...acc,
          [name]: acc[name] ? [...acc[name], webhookUrl] : [webhookUrl],
        }),
        {}
      ),
    };

    return this.webhooks[target];
  }
}

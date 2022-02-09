import {
  Collection,
  Create,
  Delete,
  Documents,
  Get,
  Index,
  Lambda,
  Map,
  Match,
  Paginate,
  Select,
  Update,
  Var,
} from "faunadb";

export interface Webhook {
  name: string;
  webhookUrls: string[];
  type: string;
  notificationString: string;
  conditions: string[];
}

export interface WebhooksResponse {
  data: Webhook[];
}

export const getWebhookUrlsQuery = () =>
  Map(
    Paginate(Documents(Collection("webhooks"))),
    Lambda("webhook", Select(["data"], Get(Var("webhook"))))
  );

export const updateWebhookQuery = (webhook: Webhook) =>
  Update(
    Select(
      "ref",
      Get(
        Match(Index("webhook_by_name_and_type"), [webhook.name, webhook.type])
      )
    ),
    {
      data: webhook,
    }
  );

export const addNewWebhookQuery = (data: Webhook) =>
  Create(Collection("webhooks"), { data });

export const removeWebhookQuery = (webhook: Webhook) =>
  Delete(
    Select(
      "ref",
      Get(
        Match(Index("webhook_by_name_and_type"), [webhook.name, webhook.type])
      )
    )
  );

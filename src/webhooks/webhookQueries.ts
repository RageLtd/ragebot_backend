import {
  Collection,
  Create,
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
  Update(Select("ref", Get(Match(Index("webhook_by_name"), webhook.name))), {
    data: webhook,
  });

export const addNewWebhookQuery = (data: Webhook) =>
  Create(Collection("webhooks"), { data });

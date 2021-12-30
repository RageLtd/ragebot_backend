import {
  Collection,
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

export interface WebhooksResponse {
  data: {
    name: string;
    webhookUrls: string[];
  }[];
}

export const getWebhookUrlsQuery = () =>
  Map(
    Paginate(Documents(Collection("webhooks"))),
    Lambda("webhook", Select(["data"], Get(Var("webhook"))))
  );

export const updateWebhookQuery = (webhook: {
  name: string;
  webhookUrls: string[];
}) =>
  Update(Select("ref", Get(Match(Index("webhook_by_name"), webhook.name))), {
    data: webhook,
  });

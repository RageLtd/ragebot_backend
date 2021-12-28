import {
  Collection,
  Documents,
  Get,
  Lambda,
  Map,
  Paginate,
  Select,
  Var,
} from "faunadb";

export interface WebhooksResponse {
  data: {
    name: string;
    webhookUrl: string;
  }[];
}

export const getWebhookUrlsQuery = () =>
  Map(
    Paginate(Documents(Collection("webhooks"))),
    Lambda("webhook", Select(["data"], Get(Var("webhook"))))
  );

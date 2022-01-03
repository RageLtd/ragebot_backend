import {
  Get,
  Documents,
  Collection,
  Map,
  Paginate,
  Update,
  Select,
} from "faunadb";

export interface NotificationStylesResponse {
  data: {
    [key: string]: {
      [key: string]: string;
    };
  };
}

export interface NotificationVariablesResponse {
  data: {
    [key: string]: string;
  };
}

export const getNotificationStylesQuery = () =>
  Get(Documents(Collection("notification_styles")));

export const getNotificationVariablesQuery = () =>
  Get(Documents(Collection("notification_variables")));

export const updateNotificationStringQuery = (name: string, value: any) =>
  Update(Select("ref", Get(Documents(Collection("notification_variables")))), {
    data: { [name]: value },
  });

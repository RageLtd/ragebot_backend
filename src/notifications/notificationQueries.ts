import { Get, Documents, Collection } from "faunadb";

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

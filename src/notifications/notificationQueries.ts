import {
  Get,
  Documents,
  Collection,
  Map,
  Paginate,
  Update,
  Select,
  Create,
  Lambda,
  Var,
  Union,
  Reduce,
  Let,
  Merge,
} from "faunadb";
import { customBehaviorTypes } from "../users/setupUserDb";

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

export interface getAllCustomBehaviorsResponse {
  data: any[];
}

export const getNotificationStylesQuery = () =>
  Get(Documents(Collection("notification_styles")));

export const getNotificationVariablesQuery = () =>
  Get(Documents(Collection("notification_variables")));

export const updateNotificationStringQuery = (name: string, value: any) =>
  Update(Select("ref", Get(Documents(Collection("notification_variables")))), {
    data: { [name]: value },
  });

export const saveCustomBehaviorQuery = (
  type: string,
  behavior: { name: string }
) => Create(Collection(`${type}_custom_behaviors`), { data: behavior });

export const getCustomBehaviorsQuery = (type: string) =>
  Map(
    Paginate(Documents(Collection(`${type}_custom_behaviors`))),
    Lambda("behavior", Select(["data"], Get(Var("behavior"))))
  );

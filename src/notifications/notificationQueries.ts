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
  Match,
  Index,
  Delete,
  Do,
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

export interface getAllCustomBehaviorsResponse {
  data: any[];
}

export const getNotificationStylesQuery = () =>
  Get(Documents(Collection("notification_styles")));

export const saveNotificationStylesQuery = (styles: {
  [key: string]: string;
}) =>
  Do(
    Delete(Select("ref", Get(Documents(Collection("notification_styles"))))),
    Create(Collection("notification_styles"), { data: styles })
  );

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

export const removeCustomBehaviorQuery = (type: string, behavior: any) =>
  Map(
    Paginate(Match(Index(`${type}_custom_behaviors_by_name`), behavior.name)),
    Lambda(["ref"], Delete(Var("ref")))
  );

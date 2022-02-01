import {
  Collection,
  Create,
  Database,
  Delete,
  Do,
  Documents,
  Get,
  Select,
  Update,
} from "faunadb";

export interface ChatStylesResponse {
  data: {
    [key: string]: {
      [key: string]: string;
    };
  };
}

export const getChatStylesQuery = () =>
  Get(Documents(Collection("chat_styles")));

export const saveChatStylesQuery = (styles: { [key: string]: string }) =>
  Do(
    Delete(Select("ref", Get(Documents(Collection("chat_styles"))))),
    Create(Collection("chat_styles"), { data: styles })
  );

export const getIsModerationEnabledQuery = (username: string) =>
  Get(Database(username));

export const setIsModerationEnabledQuery = (
  username: string,
  isModerationEnabled: boolean
) => Update(Database(username), { data: { isModerationEnabled } });

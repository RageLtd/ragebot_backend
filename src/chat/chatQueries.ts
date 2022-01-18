import {
  Collection,
  Create,
  Delete,
  Do,
  Documents,
  Get,
  Select,
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

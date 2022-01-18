import { Collection, Documents, Get, Select, Update } from "faunadb";

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
  Update(Select("ref", Get(Documents(Collection("chat_styles")))), {
    data: styles,
  });

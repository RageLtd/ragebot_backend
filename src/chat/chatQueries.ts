import { Collection, Documents, Get } from "faunadb";

export interface ChatStylesResponse {
  data: {
    [key: string]: {
      [key: string]: string;
    };
  };
}

export const getChatStylesQuery = () =>
  Get(Documents(Collection("chat_styles")));

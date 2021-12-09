import {
  Collection,
  Documents,
  Get,
  Lambda,
  Let,
  Paginate,
  Var,
  Map,
} from "faunadb";

export const getAllChannelsQuery = Map(
  Paginate(Documents(Collection("channels"))),
  Lambda(
    ["ref"],
    Let(
      {
        channel: Get(Var("ref")),
      },
      Var("channel")
    )
  )
);

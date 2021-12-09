import {
  Get,
  Index,
  Lambda,
  Match,
  Paginate,
  Map,
  Var,
  Create,
  Now,
  Collection,
  Delete,
} from "faunadb";

export interface BacklogEntry {
  data: {
    name: string;
    created: any;
    notes: string;
  };
}

export interface BacklogResponse {
  data: BacklogEntry[];
}

export const getBacklogQuery = () =>
  Map(
    Paginate(Match(Index("backlog_by_creation_asc"))),
    Lambda(["time", "ref"], Get(Var("ref")))
  );

export const addBacklogQuery = (name: string, notes: string) =>
  Create(Collection("backlog"), {
    data: {
      name,
      notes,
      created: Now(),
    },
  });

export const removeBacklogQuery = (name: string) =>
  Map(
    Paginate(Match(Index("backlog_by_name"), name)),
    Lambda(["ref"], Delete(Var("ref")))
  );

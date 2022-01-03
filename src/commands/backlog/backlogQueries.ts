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
  Select,
  Update,
} from "faunadb";

export interface BacklogEntry {
  name: string;
  created: any;
  notes: string;
}

export interface BacklogResponse {
  data: BacklogEntry[];
}

export const getBacklogQuery = () =>
  Map(
    Paginate(Match(Index("backlog_by_creation_asc"))),
    Lambda(["time", "ref"], Select(["data"], Get(Var("ref"))))
  );

export const addBacklogQuery = (name: string, notes: string) =>
  Create(Collection("backlog"), {
    data: {
      name,
      notes,
      created: Now(),
    },
  });

export const updateBacklogEntryQuery = (name: string, notes: string) =>
  Update(Select("ref", Get(Match(Index("backlog_by_name"), name))), {
    data: {
      name,
      notes,
    },
  });

export const removeBacklogQuery = (name: string) =>
  Map(
    Paginate(Match(Index("backlog_by_name"), name)),
    Lambda(["ref"], Delete(Var("ref")))
  );

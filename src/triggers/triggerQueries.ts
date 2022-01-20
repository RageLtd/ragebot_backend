import {
  Map,
  Paginate,
  Documents,
  Collection,
  Lambda,
  Get,
  Var,
  Create,
  Select,
  Delete,
  Match,
  Index,
  Update,
  Let,
  Append,
  Equals,
  If,
  Merge,
} from "faunadb";

export const getTriggersQuery = () =>
  Map(
    Paginate(Documents(Collection("triggers"))),
    Lambda("trigger", Select("data", Get(Var("trigger"))))
  );

export const saveNewTriggerQuery = (trigger: any) =>
  Create(Collection("triggers"), { data: { ...trigger, behaviors: [] } });

export const deleteTriggerQuery = (keyword: string) =>
  Map(
    Paginate(Match(Index("triggers_by_keyword"), keyword)),
    Lambda("ref", Delete(Var("ref")))
  );

export const createTriggerCustomBehaviorQuery = (
  keyword: string,
  behavior: any
) =>
  Let(
    {
      behaviors: Select(
        ["data", "behaviors"],
        Get(Match(Index("triggers_by_keyword"), keyword))
      ),
    },
    Update(Select("ref", Get(Match(Index("triggers_by_keyword"), keyword))), {
      data: {
        behaviors: Append(behavior, Var("behaviors")),
      },
    })
  );

export const updateTriggerCustomBehaviorQuery = (
  keyword: string,
  {
    behaviorName,
    everyone,
    ...rest
  }: { behaviorName: string; everyone?: boolean }
) =>
  Let(
    {
      behaviors: Select(
        ["data", "behaviors"],
        Get(Match(Index("triggers_by_keyword"), keyword))
      ),
    },
    Update(Select("ref", Get(Match(Index("triggers_by_keyword"), keyword))), {
      data: {
        behaviors: Map(
          Var("behaviors"),
          Lambda(
            "behavior",
            If(
              Equals(Select("name", Var("behavior")), behaviorName),
              Merge(Var("behavior"), rest),
              Var("behavior")
            )
          )
        ),
      },
    })
  );

export const getTriggerCustomBehaviorsQuery = (keyword: string) =>
  Select(
    ["data", "behaviors"],
    Get(Match(Index("triggers_by_keyword"), keyword))
  );

import {
  Collection,
  Create,
  CreateCollection,
  CreateDatabase,
  CreateIndex,
  Do,
} from "faunadb";

export const createUserChildDBQuery = (name: string, user_id: string) =>
  CreateDatabase({ name, data: { user_id, botEnabledState: false } });

export const createBaseCollectionsQuery = (collections: string[]) =>
  Do(...collections.map((name) => CreateCollection({ name })));

export const createBaseIndexesQuery = (indexes: { [key: string]: any }[]) =>
  Do(...indexes.map((index) => CreateIndex(index)));

export const createDefaultNotificationVarsQuery = () =>
  Create(Collection("notification_variables"), {
    data: {
      followMessage: "Thanks for the follow, %user_name%",
      followPrefixString: "",
      followPostfixString: "",
      newSubMessage: "%user_name% just subscribed!",
      newSubPrefixString: "",
      newSubPostfixString: "",
      resubMessage: "%user_name% just resubscribed!",
      resubPrefixString: "",
      resubPostfixString: "%message%",
      channelGiftMessage:
        "%user_name% is gifting %total% subs to the community!",
      channelGiftPrefixString: "",
      channelGiftPostfixString: "",
      cheerMessage: "%user_name% sent %bits% bits!",
      cheerPrefixString: "",
      cheerPostfixString: "%message%",
      raidMessage:
        "%from_broadcaster_user_name% is raiding with %viewers% viewers!",
      raidPrefixString: "",
      raidPostfixString: "",
      redemptionMessage: "%user_name% redeemed %reward.title%",
      redemptionPrefixString: "",
      redemptionPostfixString: "%user_input%",
      timeoutInMillis: 5000,
    },
  });

export const createDefaultChatStylesQuery = () =>
  Create(Collection("chat_styles"), { data: {} });

export const createDefaultNotificationStylesQuery = () =>
  Create(Collection("notification_styles"), { data: {} });

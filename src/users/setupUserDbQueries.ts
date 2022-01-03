import {
  Collection,
  Create,
  CreateCollection,
  CreateDatabase,
  CreateIndex,
} from "faunadb";

export const createUserChildDBQuery = (name: string, twitchId: string) =>
  CreateDatabase({ name, data: { twitchId } });

export const createBaseCollectionQuery = (name: string) =>
  CreateCollection({ name });

export const createBaseIndexQuery = (config: { [key: string]: any }) =>
  CreateIndex(config);

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

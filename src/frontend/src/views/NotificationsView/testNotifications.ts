const follow = {
  subscription: {
    id: "cc243c5f-e0df-eb23-701a-562ba1e0961d",
    status: "enabled",
    type: "channel.follow",
    version: "1",
    condition: { broadcaster_user_id: "50318906" },
    transport: { method: "webhook", callback: "null" },
    created_at: "2022-01-12T22:08:53.613377315Z",
    cost: 0,
  },
  event: {
    user_id: "55014066",
    user_login: "testFromUser",
    user_name: "testFromUser",
    broadcaster_user_id: "50318906",
    broadcaster_user_login: "50318906",

    followed_at: "2022-01-12T22:08:53.613380565Z",
  },
};

const subscribe = {
  subscription: {
    id: "6d80ad57-177c-f0f0-1d06-9d3ba2ac9088",
    status: "enabled",
    type: "channel.subscribe",
    version: "1",
    condition: { broadcaster_user_id: "23253982" },
    transport: { method: "webhook", callback: "null" },
    created_at: "2022-01-12T22:10:56.994160027Z",
    cost: 0,
  },
  event: {
    user_id: "69921235",
    user_login: "testFromUser",
    user_name: "testFromUser",
    broadcaster_user_id: "23253982",
    broadcaster_user_login: "testBroadcaster",

    tier: "1000",
    is_gift: false,
  },
};

const channel = {
  subscription: {
    id: "942c829d-2e9e-a4c4-64a6-867ddc7d15c0",
    status: "enabled",
    type: "channel.subscription.gift",
    version: "1",
    condition: { broadcaster_user_id: "78726669" },
    transport: { method: "webhook", callback: "null" },
    created_at: "2022-01-12T22:14:39.830201981Z",
    cost: 0,
  },
  event: {
    user_id: "43658090",
    user_login: "testFromUser",
    user_name: "testFromUser",
    broadcaster_user_id: "78726669",
    broadcaster_user_login: "testBroadcaster",

    tier: "1000",
    total: 5,
    is_anonymous: false,
    cumulative_total: 149,
  },
};

const resub = {
  subscription: {
    id: "335c52dc-a5be-03be-19ce-6c7adfba4fcf",
    status: "enabled",
    type: "channel.subscription.message",
    version: "1",
    condition: { broadcaster_user_id: "85407385" },
    transport: { method: "webhook", callback: "null" },
    created_at: "2022-01-12T22:15:19.027506807Z",
    cost: 0,
  },
  event: {
    user_id: "99091694",
    user_login: "testFromUser",
    user_name: "testFromUser",
    broadcaster_user_id: "85407385",
    broadcaster_user_login: "testBroadcaster",

    tier: "1000",
    message: {
      text: "Hello from the Twitch CLI! twitchdevLeek",
      emotes: [{ begin: 26, end: 39, id: "304456816" }],
    },
    cumulative_months: 42,
    streak_months: 41,
    duration_months: 1,
  },
};

const cheer = {
  subscription: {
    id: "2f4fdb23-6353-8d4d-9271-ce9bf378ea3a",
    status: "enabled",
    type: "channel.cheer",
    version: "1",
    condition: { broadcaster_user_id: "60846924" },
    transport: { method: "webhook", callback: "null" },
    created_at: "2022-01-12T22:16:03.116091683Z",
    cost: 0,
  },
  event: {
    user_id: "34351917",
    user_login: "testFromUser",
    user_name: "testFromUser",
    broadcaster_user_id: "60846924",
    broadcaster_user_login: "testBroadcaster",

    is_anonymous: false,
    message: "This is a test event.",
    bits: 100,
  },
};

const raid = {
  subscription: {
    id: "cada3a05-7b1a-d354-fc7f-15b1643b27c9",
    status: "enabled",
    type: "channel.raid",
    version: "1",
    condition: { to_broadcaster_user_id: "12171220" },
    transport: { method: "webhook", callback: "null" },
    created_at: "2022-01-12T22:16:23.444505329Z",
    cost: 0,
  },
  event: {
    to_broadcaster_user_id: "12171220",
    to_broadcaster_user_login: "testBroadcaster",
    from_broadcaster_user_id: "85078581",
    from_broadcaster_user_login: "testFromUser",
    from_broadcaster_user_name: "testFromUser",
    viewers: 92076,
  },
};

const redemption = {
  subscription: {
    id: "7d8435dc-fede-5c29-bab2-6bc2c0aaaeb5",
    status: "enabled",
    type: "channel.channel_points_custom_reward_redemption.add",
    version: "1",
    condition: { broadcaster_user_id: "70329379" },
    transport: { method: "webhook", callback: "null" },
    created_at: "2022-01-12T22:17:00.461065759Z",
    cost: 0,
  },
  event: {
    id: "7d8435dc-fede-5c29-bab2-6bc2c0aaaeb5",
    broadcaster_user_id: "70329379",
    broadcaster_user_login: "testBroadcaster",

    user_id: "59282994",
    user_login: "testFromUser",
    user_name: "testFromUser",
    user_input: "Test Input From CLI",
    status: "unfulfilled",
    reward: {
      id: "0b0e68d4-5fd6-4756-0929-c39bfe20406e",
      title: "Test Reward from CLI",
      cost: 150,
      prompt: "Redeem Your Test Reward from CLI",
    },
    redeemed_at: "2022-01-12T22:17:00.461065759Z",
  },
};

const streamUp = {
  subscription: {
    id: "d21ed252-81ae-cddd-0982-93ae80cb7ddb",
    status: "enabled",
    type: "stream.online",
    version: "1",
    condition: { broadcaster_user_id: "93019870" },
    transport: { method: "webhook", callback: "null" },
    created_at: "2022-02-08T19:02:15.462618691Z",
    cost: 0,
  },
  event: {
    id: "53414625",
    broadcaster_user_id: "93019870",
    broadcaster_user_login: "testBroadcaster",
    type: "live",
    started_at: "2022-02-08T19:02:15.462621571Z",
  },
};

const streamDown = {
  subscription: {
    id: "2527a4d5-8eeb-10ce-fadd-d1cac66161e1",
    status: "enabled",
    type: "stream.offline",
    version: "1",
    condition: { broadcaster_user_id: "73109245" },
    transport: { method: "webhook", callback: "null" },
    created_at: "2022-02-08T19:03:04.50099269Z",
    cost: 0,
  },
  event: {
    broadcaster_user_id: "73109245",
    broadcaster_user_login: "testBroadcaster",
    broadcaster_user_name: "testBroadcaster",
  },
};

export default { follow, subscribe, channel, resub, cheer, raid, redemption };

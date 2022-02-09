interface TokenMap {
  [key: string]: string[];
}

export const tokens: TokenMap = {
  alwaysTokens: ["%user_name%", "%broadcaster_user_name%"],
  followTokens: [],
  newSubTokens: ["%tier%"],
  resubTokens: [
    "%cumulative_months%",
    "%streak_months%",
    "%tier%",
    "%message%",
    "%duration_months%",
  ],
  channelGiftTokens: ["%total%", "%tier%", "%cumulative_total%"],
  cheerTokens: ["%bits%", "%message%"],
  raidTokens: ["%from_broadcaster_user_name%", "%viewers%"],
  redemptionTokens: [
    "%user_input%",
    "%reward.title%",
    "%reward.prompt%",
    "%reward.cost%",
  ],
  onlineTokens: ["%game_name%", "%language%", "%is_mature%", "%title%"],
  offlineTokens: [],
};

export function getOtherTokens(type: string) {
  const matches = type.match(/[A-Z]/gm)!;

  const prefix = type.substring(0, type.indexOf(matches.shift()!));

  const [key] = Object.keys(tokens).filter((key) => key.startsWith(prefix));

  return tokens[key];
}

export function getHumanGroupName(name: string) {
  switch (name) {
    case "up":
      return "Stream start";
    case "down":
      return "Stream end";
    case "channel":
      return "Sub Gifts";
    case "resub":
      return "Resubscription";
    case "new":
      return "New Subscription";
    case "redemption":
      return "Channel Point Redemption";
    case "follow":
    case "cheer":
    case "raid":
      return name[0].toUpperCase() + name.slice(1);
    default:
      return "";
  }
}

export function getHumanGroupHeader(name: string) {
  switch (name) {
    case "up":
      return (
        <>
          <h3>{getHumanGroupName(name)}</h3>
          <p>This is the event that fires when your channel goes live.</p>
        </>
      );
    case "down":
      return (
        <>
          <h3>{getHumanGroupName(name)}</h3>
          <p>This is the event that fires when your channel goes offline.</p>
        </>
      );
    case "channel":
      return (
        <>
          <h3>{getHumanGroupName(name)}</h3>
          <p>
            This is the event that fires when subs are gifted in your channel.
          </p>
        </>
      );
    case "resub":
      return (
        <>
          <h3>{getHumanGroupName(name)}</h3>
          <p>
            This is the event that fires when a viewer uses their resubscribe
            message for your channel.
          </p>
        </>
      );
    case "new":
      return (
        <>
          <h3>{getHumanGroupName(name)}</h3>
          <p>
            This is the event that fires when a viewer subscribes to your
            channel for the first time.
          </p>
        </>
      );
    case "follow":
      return (
        <>
          <h3>{getHumanGroupName(name)}</h3>
          <p>This is the event that fires when a user follows your channel.</p>
        </>
      );
    case "cheer":
      return (
        <>
          <h3>{getHumanGroupName(name)}</h3>
          <p>
            This is the event that fires when a user cheers bits in your
            channel.
          </p>
        </>
      );
    case "raid":
      return (
        <>
          <h3>{getHumanGroupName(name)}</h3>
          <p>
            This is the event that fires when another streamer raids your
            channel.
          </p>
        </>
      );
    case "redemption":
      return (
        <>
          <h3>{getHumanGroupName(name)}</h3>
          <p>
            This is the event that fires when a user redeems channel points in
            your channel.
          </p>
        </>
      );
  }
}

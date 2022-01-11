import { ChangeEvent, FormEvent, ReactElement, useState } from "react";
import Button from "../../../../components/Button/Button";
import Input from "../../../../components/Input/Input";

import styles from "../../NotificationsView.module.css";
import { tokens } from "../../notificationViewUtils";

interface AddNewCustomBehaviorFormProps {
  save: Function;
  cancel: Function;
  type: string;
  twitchUserInfo: {
    username?: string;
  };
}

export function getAdditionalBehaviorOptions(type: string) {
  const options: { [key: string]: ReactElement[] } = {
    channel: [],
    cheer: [],
    follow: [],
    new: [],
    raid: [],
    redemption: [
      <option key={type + "backlog"} value="addToBacklog">
        Add To Backlog
      </option>,
    ],
    resub: [],
  };
  return options[type];
}

// async function getRedemptionConditions({ username }: { username?: string }) {
//   const state = uuidv4();
//   const userToken = await fetch(
//     `https://id.twitch.tv/oauth2/authorize?` +
//       `client_id=${process.env.REACT_APP_TWITCH_CLIENT_ID}` +
//       `&redirect_uri=${
//         window.location.protocol + "//" + window.location.host
//       }` +
//       `&response_type=token` +
//       `&scope=channel:read:redemptions`
//     // `&state=${state}`,
//   )
//     .then((res) => {
//       console.log(res);
//       return res.json();
//     })
//     .then((res) => {
//       console.log(res.state === state);
//       return res;
//     })
//     .catch(console.error);

//   const rewards = await fetch(
//     "https://api.twitch.tv/helix/channel_points/custom_rewards",
//     {
//       headers: {
//         Authorization: `Bearer ${userToken}`,
//       },
//     }
//   )
//     .then((res) => res.json())
//     .catch(console.error);

//   console.log(rewards);
//   return [<option value="doublefart">fart</option>];
// }

export default function AddNewCustomBehaviorForm({
  save,
  cancel,
  type,
  twitchUserInfo,
}: AddNewCustomBehaviorFormProps) {
  const [name, setName] = useState("");
  const [behavior, setBehavior] = useState("sound");
  const [condition, setCondition] = useState<string>("");
  const [response, setResponse] = useState("");
  // const [redemptionConditions, setRedemptionConditions] = useState<
  //   ReactElement[]
  // >([]);

  // useEffect(() => {
  //   if (type === "redemption" && twitchUserInfo.username) {
  //     getRedemptionConditions(twitchUserInfo).then((res) =>
  //       setRedemptionConditions(res)
  //     );
  //   }
  // }, [type, twitchUserInfo.username]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    save({ name, behavior, condition, response });
    cancel();
  };
  const handleCancel = () => {
    setName("");
    cancel();
  };

  /// @ts-expect-error
  const handleNameChange = (e: ChangeEvent) => setName(e.target.value);
  /// @ts-expect-error
  const handleBehvaiorChange = (e: ChangeEvent) => setBehavior(e.target.value);
  const handleConditionChange = (e: ChangeEvent) =>
    /// @ts-expect-error
    setCondition(e.target.value);
  /// @ts-expect-error
  const handleResponseChange = (e: ChangeEvent) => setResponse(e.target.value);

  const addConditionalFields = (
    type: string,
    fields: ReactElement[],
    behavior: string
  ) => {
    switch (type) {
      case "redemption":
        return [
          fields[0],
          <label>
            Event:
            <Input helper="Title of the event you want to trigger on">
              <input
                type="text"
                value={condition}
                onChange={handleConditionChange}
              />
            </Input>
          </label>,
          ...fields.slice(1),
        ];
      case "raid":
        if (behavior !== "say") {
          return fields;
        }
        console.log(type);
        return [
          ...fields,
          <label>
            Response:
            <Input
              helper={
                <>
                  <div>What should be said in chat?</div>
                  <div>You have access to the following tokens:</div>
                  <div className={styles.tokenContainer}>
                    {[...tokens.alwaysTokens, ...tokens[`${type}Tokens`]].map(
                      (token) => (
                        <pre key={type + token} className={styles.token}>
                          {token}
                        </pre>
                      )
                    )}
                  </div>
                </>
              }
            >
              <input
                type="text"
                value={response}
                onChange={handleResponseChange}
              />
            </Input>
          </label>,
        ];
      default:
        return fields;
    }
  };

  const fields = [
    <label key={type + "name"}>
      Name:
      <Input helper="A name for your new behavior">
        <input type="text" value={name} onChange={handleNameChange} />
      </Input>
    </label>,
    <label key={type + "behavior"}>
      Behavior:
      <Input helper="What do you want the behavior to do?">
        <select value={behavior} onChange={handleBehvaiorChange}>
          <option value="sound">Play Sound</option>
          <option value="say">Post to chat</option>
          {getAdditionalBehaviorOptions(type)}
        </select>
      </Input>
    </label>,
  ];

  return (
    <form onSubmit={handleSubmit}>
      {addConditionalFields(type, fields, behavior)}
      <Button type="submit" weight="secondary">
        Add Behavior
      </Button>
      <Button onClick={handleCancel}>Cancel</Button>
    </form>
  );
}

import { ChangeEvent, FormEvent, ReactElement, useState } from "react";
import Button from "../../Button/Button";
import Input from "../../Input/Input";

import styles from "./AddNewCustomBehaviorForm.module.css";
import { tokens } from "../../../views/NotificationsView/notificationViewUtils";

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
    cheer: [<option value="tts">Text to Speech</option>],
    follow: [],
    new: [],
    raid: [],
    redemption: [
      <option key={type + "backlog"} value="addToBacklog">
        Add To Backlog
      </option>,
      <option value="tts">Text to Speech</option>,
    ],
    resub: [<option value="tts">Text to Speech</option>],
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
  const [sound, setSound] = useState("");
  const [voice, setVoice] = useState(
    window.speechSynthesis.getVoices()[0].name
  );
  const [minimum, setMinimum] = useState(0);
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

    save({ name, behavior, condition, response, sound, voice, minimum });
    cancel();
  };
  const handleCancel = () => {
    setName("");
    cancel();
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) =>
    setName(e.target.value);

  const handleBehvaiorChange = (e: ChangeEvent<HTMLSelectElement>) =>
    setBehavior(e.target.value);
  const handleConditionChange = (e: ChangeEvent<HTMLInputElement>) =>
    setCondition(e.target.value);

  const handleResponseChange = (e: ChangeEvent<HTMLInputElement>) =>
    setResponse(e.target.value);

  const handleSoundChange = (e: ChangeEvent<HTMLInputElement>) =>
    setSound(e.target.value);

  const handleVoiceChange = (e: ChangeEvent<HTMLSelectElement>) =>
    setVoice(e.target.value);

  const handleMinimumChange = (e: ChangeEvent<HTMLInputElement>) =>
    setMinimum(Number(e.target.value));

  const addConditionalFields = (
    type: string,
    fields: ReactElement[],
    behavior: string
  ) => {
    switch (type) {
      case "redemption":
        const newFields = [
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

        if (behavior === "tts") {
          newFields.push(
            <label>
              Voice
              <Input>
                <select onChange={handleVoiceChange}>
                  {window.speechSynthesis.getVoices().map((v) => (
                    <option selected={voice === v.name} value={v.name}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </Input>
            </label>
          );
        }

        return newFields;
      case "raid":
        if (behavior !== "say") {
          return fields;
        }
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
      case "cheer": {
        if (behavior === "tts") {
          fields.push(
            <label>
              Voice
              <Input>
                <select onChange={handleVoiceChange}>
                  {window.speechSynthesis.getVoices().map((v) => (
                    <option value={v.name}>{v.name}</option>
                  ))}
                </select>
              </Input>
            </label>,
            <label>
              Minimum
              <Input>
                <input
                  type="number"
                  name="minimum"
                  onChange={handleMinimumChange}
                  value={minimum}
                />
              </Input>
            </label>
          );
        }
        return fields;
      }
      default:
        if (behavior === "sound") {
          return [
            ...fields,
            <label>
              Sound URL
              <Input helper="URL for sound you would like to play">
                <input type="text" value={sound} onChange={handleSoundChange} />
              </Input>
            </label>,
          ];
        } else if (behavior === "tts") {
          fields.push(
            <label>
              Voice
              <Input>
                <select onChange={handleVoiceChange}>
                  {window.speechSynthesis.getVoices().map((v) => (
                    <option value={v.name}>{v.name}</option>
                  ))}
                </select>
              </Input>
            </label>
          );
          return fields;
        } else if (behavior === "say") {
          fields.push(
            <label>
              Response:
              <Input helper={<div>What should be said in chat?</div>}>
                <input
                  type="text"
                  value={response}
                  onChange={handleResponseChange}
                />
              </Input>
            </label>
          );
        }
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

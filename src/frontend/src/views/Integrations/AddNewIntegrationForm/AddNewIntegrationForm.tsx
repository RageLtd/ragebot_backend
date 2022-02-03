import { ChangeEvent, FormEvent, useState } from "react";
import Button from "../../../components/Button/Button";
import Input from "../../../components/Input/Input";
import { IntegrationShape } from "../IntegrationsView";

const eventTypes = [
  "channel.follow",
  "channel.subscribe",
  "channel.subscription.gift",
  "channel.subscription.message",
  "channel.cheer",
  "channel.raid",
  "channel.channel_points_custom_reward_redemption.add",
  "channel.update",
];

export function getHumanTypeName(type: string) {
  switch (type) {
    case "channel.follow":
      return "Follow";
    case "channel.subscribe":
      return "New subscription";
    case "channel.subscription.gift":
      return "Gift Subscription(s)";
    case "channel.subscription.message":
      return "Resub";
    case "channel.cheer":
      return "Cheer";
    case "channel.raid":
      return "Raid";
    case "channel.channel_points_custom_reward_redemption.add":
      return "Channel Point Redemption";
    case "channel.update":
      return "Stream Info Update";
    default:
      return "";
  }
}

interface NewIntegration {
  name: string;
  webhookUrls: string[];
  draftUrl: string;
  type: string;
}

interface AddNewIntegrationFormProps {
  integrations: { [key: string]: IntegrationShape[] };
  onCancel: Function;
  onSubmit: Function;
}

export default function AddNewIntegrationForm(
  { integrations, onCancel, onSubmit }: AddNewIntegrationFormProps,
) {
  const [newIntegration, setNewIntegration] = useState<NewIntegration>({
    name: "discord",
    webhookUrls: [],
    draftUrl: "",
    type: "channel.follow",
  });

  const handleTypeSelectChange = (e: ChangeEvent<HTMLSelectElement>) =>
    setNewIntegration({
      name: newIntegration.name,
      webhookUrls: newIntegration.webhookUrls,
      draftUrl: newIntegration.draftUrl,
      type: e.target.value,
    });

  const updateNewIntegration = (
    e: ChangeEvent<HTMLSelectElement> | ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.getAttribute("name") === "name") {
      setNewIntegration({ ...newIntegration, name: e.target.value });
      return;
    }
    setNewIntegration({ ...newIntegration, draftUrl: e.target.value });
  };

  const addDraftUrl = (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (newIntegration.draftUrl !== "") {
      setNewIntegration({
        ...newIntegration,
        webhookUrls: [...newIntegration.webhookUrls, newIntegration.draftUrl],
        draftUrl: "",
      });
    }
  };

  const generateRemoveUrl = (url: string) =>
    () => {
      const urlIndex = newIntegration.webhookUrls.indexOf(url);
      setNewIntegration({
        ...newIntegration,
        webhookUrls: [
          ...newIntegration.webhookUrls.slice(0, urlIndex),
          ...newIntegration.webhookUrls.slice(urlIndex + 1),
        ],
      });
    };

  const selectedIntegrationExists = !!integrations[newIntegration.type]?.find(
    (integration) => integration.name === newIntegration.name,
  );

  const handleCancelClick = () => {
    onCancel();
  };

  const handleAddNewSubmit = (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const { draftUrl, ...rest } = newIntegration;
    onSubmit(rest);
    onCancel();
  };
  return (
    <form onSubmit={handleAddNewSubmit}>
      <div>
        <label>
          Service
          <Input>
            <select
              name="name"
              onChange={updateNewIntegration}
              value={newIntegration.name}
            >
              <option value="discord">Discord</option>
            </select>
          </Input>
        </label>
      </div>
      <div>
        <label>
          Event
          <Input>
            <select value={newIntegration.type} onChange={handleTypeSelectChange}>
              {eventTypes.map((type, index) => (
                <option key={type} selected={index === 0} value={type}>
                  {getHumanTypeName(type)}
                </option>
              ))}
            </select>
          </Input>
        </label>
      </div>
      <div>
        urls:{" "}
        <ul>
          {newIntegration.webhookUrls.map((url) => (
            <li key={url}>
              {url} <Button onClick={generateRemoveUrl(url)}>-</Button>
            </li>
          ))}
        </ul>
      </div>
      <div>
          <label>
            add new url:{" "}
            <Input postfix={<Button onClick={addDraftUrl}>+</Button>}>
              <input
                type="text"
                name="url"
                onChange={updateNewIntegration}
                value={newIntegration.draftUrl}
              />
            </Input>
          </label>
      </div>
      <Button
        disabled={selectedIntegrationExists}
        weight="secondary"
        type="submit"
      >
        Save
      </Button>
      <Button onClick={handleCancelClick}>Cancel</Button>
    </form>
  );
}

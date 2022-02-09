import { ChangeEvent, FormEvent, useState } from "react";
import Button from "../../../components/Button/Button";
import Input from "../../../components/Input/Input";
import { tokens } from "../../NotificationsView/notificationViewUtils";
import { IntegrationShape } from "../IntegrationsView";
import { conditionValues, getHumanConditionName } from "../conditionHelpers";

import styles from "./AddNewIntegrationForm.module.css";

const eventTypes = [
  "channel.follow",
  "channel.subscribe",
  "channel.subscription.gift",
  "channel.subscription.message",
  "channel.cheer",
  "channel.raid",
  "channel.channel_points_custom_reward_redemption.add",
  "channel.update",
  "stream.online",
  "stream.offline",
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
    case "stream.online":
      return "Stream start";
    case "stream.offline":
      return "Stream end";
    default:
      return "";
  }
}

function getIntegrationTokens(type: string) {
  switch (type) {
    case "channel.follow":
      return tokens.followTokens;
    case "channel.subscribe":
      return tokens.newSubTokens;
    case "channel.subscription.gift":
      return tokens.channelGiftTokens;
    case "channel.subscription.message":
      return tokens.resubTokens;
    case "channel.cheer":
      return tokens.cheerTokens;
    case "channel.raid":
      return tokens.raidTokens;
    case "channel.channel_points_custom_reward_redemption.add":
      return tokens.redemptionTokens;
    case "channel.update":
      return ["%category_name%", "%language%", "%is_mature%", "%title%"];
    case "stream.online":
      return tokens.onlineTokens;
    case "stream.offline":
      return tokens.offlineTokens;
    default:
      return [];
  }
}

interface NewIntegration {
  name: string;
  webhookUrls: string[];
  draftUrl: string;
  type: string;
  notificationString: string;
  conditions: string[];
}

interface AddNewIntegrationFormProps {
  integrations: { [key: string]: IntegrationShape[] };
  onCancel: Function;
  onSubmit: Function;
}

export default function AddNewIntegrationForm({
  integrations,
  onCancel,
  onSubmit,
}: AddNewIntegrationFormProps) {
  const [newIntegration, setNewIntegration] = useState<NewIntegration>({
    name: "discord",
    webhookUrls: [],
    draftUrl: "",
    type: "channel.follow",
    notificationString: "",
    conditions: [],
  });

  const handleTypeSelectChange = (e: ChangeEvent<HTMLSelectElement>) =>
    setNewIntegration({
      ...newIntegration,
      type: e.target.value,
    });

  const updateNewIntegration = (
    e:
      | ChangeEvent<HTMLSelectElement>
      | ChangeEvent<HTMLInputElement>
      | ChangeEvent<HTMLTextAreaElement>
  ) => {
    setNewIntegration({ ...newIntegration, [e.target.name]: e.target.value });
  };

  const selectedIntegrationExists = !!integrations[newIntegration.type]?.find(
    (integration) => integration.name === newIntegration.name
  );

  const handleCancelClick = () => {
    onCancel();
  };

  const handleConditionChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setNewIntegration({
      ...newIntegration,
      conditions: Array.from(e.target.selectedOptions).map((o) => o.value),
    });
  };

  const handleWebhookUrlsChange = (e: ChangeEvent<HTMLTextAreaElement>) =>
    setNewIntegration({
      ...newIntegration,
      webhookUrls: e.target.value.split(",").map((v) => v.trim()),
    });

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
              <option value="twitter">Twitter</option>
            </select>
          </Input>
        </label>
      </div>
      <div>
        <label>
          Event
          <Input>
            <select
              value={newIntegration.type}
              onChange={handleTypeSelectChange}
            >
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
        <label>
          Conditions
          <Input helper="Ctrl+Click to select multiple">
            <select name="conditions" multiple onChange={handleConditionChange}>
              {conditionValues.map((c) => (
                <option value={c}>{getHumanConditionName(c)}</option>
              ))}
            </select>
          </Input>
        </label>
      </div>
      <div>
        <label>
          URLs
          <Input
            helper={
              'Comma separated list of URLs for the webhook to call. eg: "https://test.url/fake/endpoint, https://fake.url/test/endpoint"'
            }
          >
            <textarea
              value={newIntegration.webhookUrls.join()}
              onChange={handleWebhookUrlsChange}
            ></textarea>
          </Input>
        </label>
      </div>
      <div>
        <label>
          Message format
          <Input
            helper={
              <>
                <p>You have access to the following tokens:</p>
                <div className={styles.tokenContainer}>
                  {[
                    ...["%broadcaster_user_name%", "%broadcaster_user_login%"],
                    ...getIntegrationTokens(newIntegration.type),
                  ].map((token) => (
                    <pre
                      key={newIntegration.type + token}
                      className={styles.token}
                    >
                      {token}
                    </pre>
                  ))}
                </div>
              </>
            }
          >
            <textarea
              name="notificationString"
              value={newIntegration.notificationString}
              onChange={updateNewIntegration}
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

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Integration from "../../components/Integration/Integration";

interface IntegrationsViewProps {
  twitchUserInfo: {
    username?: string;
    user_id?: string;
  };
}

interface NewIntegration {
  name: string;
  webhookUrls: string[];
  draftUrl: string;
}

interface Integration {
  name: string;
  webhookUrls: string[];
}

export default function IntegrationsView({
  twitchUserInfo,
}: IntegrationsViewProps) {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [newIntegration, setNewIntegration] = useState<NewIntegration>({
    name: "discord",
    webhookUrls: [],
    draftUrl: "",
  });
  useEffect(() => {
    fetch(`/api/integrations/${twitchUserInfo.username?.toLowerCase()}`)
      .then((res) => res.json())
      .then((json) => setIntegrations(json));
  }, [twitchUserInfo]);

  const updateNewIntegration = (e: ChangeEvent) => {
    if (e.target.getAttribute("name") === "name") {
      /// @ts-expect-error
      setNewIntegration({ ...newIntegration, name: e.target.value });
      return;
    }
    /// @ts-expect-error
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

  const generateRemoveUrl = (url: string) => () => {
    const urlIndex = newIntegration.webhookUrls.indexOf(url);
    setNewIntegration({
      ...newIntegration,
      webhookUrls: [
        ...newIntegration.webhookUrls.slice(0, urlIndex),
        ...newIntegration.webhookUrls.slice(urlIndex + 1),
      ],
    });
  };

  const saveEditedIntegration = (integration: Integration) => {
    fetch(`/api/integrations/${twitchUserInfo.username?.toLowerCase()}`, {
      method: "PATCH",
      body: JSON.stringify(integration),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((webhook) => {
        const hookIndex = integrations.findIndex(
          (integration) => integration.name === webhook.name
        );
        setIntegrations([
          ...integrations.slice(0, hookIndex),
          webhook,
          ...integrations.slice(hookIndex + 1),
        ]);
      });
  };

  const removeIntegration = (integration: Integration) => {
    // eslint-disable-next-line
    if (confirm(`Are you sure you want to remove ${integration.name}?`)) {
      fetch(`/api/integrations/${twitchUserInfo.username}`, {
        method: "DELETE",
        body: JSON.stringify(integration),
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  };

  const selectedIntegrationExists = !!integrations.find(
    (integration) => integration.name === newIntegration.name
  );

  return (
    <>
      <h1>This is the integrations view</h1>
      <ul>
        {integrations.map(({ name, webhookUrls }) => (
          <Integration
            key={name}
            name={name}
            webhookUrls={webhookUrls}
            save={saveEditedIntegration}
            remove={removeIntegration}
          />
        ))}
        <li>
          <div>
            <label>
              name:{" "}
              <select
                name="name"
                onChange={updateNewIntegration}
                value={newIntegration.name}
              >
                <option value="discord">Discord</option>
              </select>
            </label>
          </div>
          <div>
            <p>
              urls:{" "}
              <ul>
                {newIntegration.webhookUrls.map((url) => (
                  <li key={url}>
                    {url} <button onClick={generateRemoveUrl(url)}>-</button>
                  </li>
                ))}
              </ul>
            </p>
          </div>
          <div>
            <form onSubmit={addDraftUrl}>
              <label>
                add new url:{" "}
                <input
                  type="text"
                  name="url"
                  onChange={updateNewIntegration}
                  value={newIntegration.draftUrl}
                />
                <button type="submit">+</button>
              </label>
            </form>
          </div>
          <button disabled={selectedIntegrationExists}>
            Add New Integration
          </button>
        </li>
      </ul>
    </>
  );
}

import { useEffect, useState } from "react";
import Button from "../../components/Button/Button";
import Integration from "../../components/Integration/Integration";
import AddNewIntegrationForm, { getHumanTypeName } from "./AddNewIntegrationForm/AddNewIntegrationForm";

interface IntegrationsViewProps {
  twitchUserInfo: {
    username?: string;
    user_id?: string;
  };
}

export interface IntegrationShape {
  name: string;
  webhookUrls: string[];
}

async function getIntegrations(username: string) {
  return fetch(`/api/integrations/${username?.toLowerCase()}`)
    .then((res) => res.json());
}

export default function IntegrationsView({
  twitchUserInfo,
}: IntegrationsViewProps) {
  const [integrations, setIntegrations] = useState<
    { [key: string]: IntegrationShape[] }
  >({});
  const [isAddingNewIntegration, setIsAddingNewIntegration] = useState(false);
  useEffect(() => {
    if (twitchUserInfo.username) {
      getIntegrations(twitchUserInfo.username)
        .then((json) => setIntegrations(json));
    }
  }, [twitchUserInfo]);

  const saveEditedIntegration = (integration: IntegrationShape) => {
    fetch(`/api/integrations/${twitchUserInfo.username?.toLowerCase()}`, {
      method: "PATCH",
      body: JSON.stringify(integration),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((webhook) => {
        const hookIndex = integrations[webhook.type].findIndex(
          (integration) => integration.name === webhook.name,
        );
        setIntegrations({
          [webhook.type]: [
            ...integrations[webhook.type].slice(0, hookIndex),
            webhook,
            ...integrations[webhook.type].slice(hookIndex + 1),
          ],
        });
      });
  };

  const removeIntegration = (integration: IntegrationShape) => {
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

  const handleAddNewClick = () => setIsAddingNewIntegration(true);
  const handleAddNewCancelClick = () => setIsAddingNewIntegration(false);
  const handleAddNew = async (newIntegration: IntegrationShape) => {
    await fetch(`/api/integrations/${twitchUserInfo.username?.toLowerCase()}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newIntegration),
    });

    getIntegrations(twitchUserInfo.username!)
      .then((json) => setIntegrations(json));
  };

  return (
    <>
      <h1>Integrations</h1>
      <p>
        Here you can add and manage various integrations with Ragebot. Currently
        only Discord is supported, but any Webhook will be supported in the
        future!
      </p>
      {!isAddingNewIntegration && (
        <Button onClick={handleAddNewClick}>
          Add New Integration
        </Button>
      )}
      {isAddingNewIntegration && (
        <AddNewIntegrationForm
          onSubmit={handleAddNew}
          onCancel={handleAddNewCancelClick}
          integrations={integrations}
        />
      )}
      <ul>
        {Object.keys(integrations).map(type => (
          <div>
            <h3>{getHumanTypeName(type)}</h3>
            {integrations[type].map(({ name, webhookUrls }) => (
              <Integration
                key={name + webhookUrls.toString()}
                name={name}
                webhookUrls={webhookUrls}
                save={saveEditedIntegration}
                remove={removeIntegration}
              />
            ))}
          </div>
        ))}
      </ul>
    </>
  );
}

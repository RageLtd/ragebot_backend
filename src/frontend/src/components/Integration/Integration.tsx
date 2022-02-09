import { useState } from "react";
import {
  conditionValues,
  getHumanConditionName,
} from "../../views/Integrations/conditionHelpers";
import Button from "../Button/Button";
import EditableProperty from "../EditableProperty/EditableProperty";

interface IntegrationProps {
  name: string;
  webhookUrls: string[];
  notificationString: string;
  conditions: string[];
  type: string;
  save: Function;
  remove: Function;
}

export default function Integration({
  name,
  webhookUrls,
  notificationString,
  conditions,
  type,
  save,
  remove,
}: IntegrationProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleRemove = () => {
    remove({ name, type });
  };

  const handleSave = async (property: { value: string; name: string }) => {
    if (property.name === "webhookUrls") {
      return save({
        name,
        type,
        [property.name]: property.value.split(",").map((v) => v.trim()),
      });
    }
    save({ name, [property.name]: property.value });
  };

  return (
    <li key={name + notificationString}>
      <p>Service {name[0].toUpperCase() + name.slice(1)}</p>
      <EditableProperty
        name="conditions"
        type="select"
        multiple
        options={conditionValues.map((c) => (
          <option value={c} selected={conditions.includes(c)}>
            {getHumanConditionName(c)}
          </option>
        ))}
        value={conditions}
        save={handleSave}
      />
      <EditableProperty
        name="webhookUrls"
        type="textarea"
        value={webhookUrls.join(", ")}
        save={handleSave}
      />
      <EditableProperty
        type="textarea"
        name="notificationString"
        value={notificationString}
        save={handleSave}
      />
      <Button weight="danger" onClick={handleRemove}>
        Remove
      </Button>
    </li>
  );
}

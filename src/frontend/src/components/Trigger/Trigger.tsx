import CustomBehaviorControls from "../CustomBehaviorControls/CustomBehaviorControls";
import Button from "../Button/Button";

export interface iTrigger {
  keyword: string;
  behaviors?: {
    behavior: string;
    response?: string;
    src?: string;
  }[];
}

interface TriggerProps extends iTrigger {
  twitchUserInfo: {
    username?: string;
  };
  remove: Function;
}

export default function Trigger({
  keyword,
  behaviors,
  twitchUserInfo,
  remove,
}: TriggerProps) {
  const handleRemove = () => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm("Are you sure you want to remove this Trigger?")) {
      remove({ keyword, behaviors });
    }
  };
  return (
    <div>
      <CustomBehaviorControls
        category="triggers"
        name={keyword}
        formattedName={keyword}
        twitchUserInfo={twitchUserInfo}
      />
      <Button weight="danger" onClick={handleRemove}>
        Remove Trigger
      </Button>
    </div>
  );
}

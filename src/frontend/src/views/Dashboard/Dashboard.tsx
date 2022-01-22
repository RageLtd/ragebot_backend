import CommandToggles from "./CommandToggles/CommandToggles";
import TriggerToggles from "./TriggerToggles/TriggerToggles";

interface DashboardViewProps {
  twitchUserInfo: {
    username?: string;
    user_id?: string;
  };
}

function DashboardView({ twitchUserInfo }: DashboardViewProps) {
  return (
    <div>
      <CommandToggles twitchUserInfo={twitchUserInfo} />
      <TriggerToggles twitchUserInfo={twitchUserInfo} />
      <p>Holy shit auth is working</p>
      <p>Username: {twitchUserInfo?.username}</p>
    </div>
  );
}

export default DashboardView;

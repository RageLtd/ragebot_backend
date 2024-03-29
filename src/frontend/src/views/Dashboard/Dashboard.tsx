import CommandToggles from "./CommandToggles/CommandToggles";
import DashboardChat from "./DashboardChat/DashboardChat";
import NotificationLog from "./NotificationLog/NotificationLog";
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
      <DashboardChat twitchUserInfo={twitchUserInfo} />
      <NotificationLog twitchUserInfo={twitchUserInfo} />
      <CommandToggles twitchUserInfo={twitchUserInfo} />
      <TriggerToggles twitchUserInfo={twitchUserInfo} />
      <p>Holy shit auth is working</p>
      <p>Username: {twitchUserInfo?.username}</p>
    </div>
  );
}

export default DashboardView;

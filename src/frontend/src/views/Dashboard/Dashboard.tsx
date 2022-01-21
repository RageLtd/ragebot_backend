interface DashboardViewProps {
  twitchUserInfo: {
    username?: string;
    user_id?: string;
  };
}

function DashboardView({ twitchUserInfo }: DashboardViewProps) {
  return (
    <div>
      <p>Holy shit auth is working</p>
      <p>Username: {twitchUserInfo?.username}</p>
    </div>
  );
}

export default DashboardView;

import { Link } from "react-router-dom";

interface DashboardViewProps {
  twitchUserInfo: {
    username?: string;
    user_id?: string;
  };
}

export default function DashboardView({ twitchUserInfo }: DashboardViewProps) {
  return (
    <div>
      <p>Holy shit auth is working</p>
      <p>Username: {twitchUserInfo?.username}</p>
      <Link to="/followers">Followers</Link>
    </div>
  );
}

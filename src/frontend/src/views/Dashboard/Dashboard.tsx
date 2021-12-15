import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

interface DashboardViewProps {
  twitchUserInfo: {
    username?: string;
    user_id?: string;
  };
}

export default function DashboardView({ twitchUserInfo }: DashboardViewProps) {
  const { isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  });

  return (
    <div>
      <p>Holy shit auth is working</p>
      <p>Username: {twitchUserInfo?.username}</p>
      <Link to="/followers">Followers</Link>
    </div>
  );
}

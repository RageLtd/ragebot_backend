import { useAuth0, User } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { setupUserDb } from "../utils/setupUserDb";

export default function DashboardView() {
  const { isAuthenticated, user, getAccessTokenSilently } = useAuth0();
  const [userInfo, setUserInfo] = useState({
    username: undefined,
    user_id: undefined,
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  });

  useEffect(() => {
    const audience = process.env.REACT_APP_AUTH0_MANAGEMENT_AUDIENCE;
    const getUserInfoByEmail = async (user: User) => {
      const token = await getAccessTokenSilently({
        audience,
        scope: "openid profile",
      });

      return await fetch(
        `${audience}users/${user.sub}?fields=username,user_id&include_fields=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    };

    if (isAuthenticated) {
      getUserInfoByEmail(user!)
        .then((res) => res.json())
        .then((user) => {
          setUserInfo(user);
          return user;
        })
        .then((user) => setupUserDb(user.username, user.user_id))
        .catch((error: Error) => console.error(error));
    }
  }, [getAccessTokenSilently, user, isAuthenticated, navigate]);

  return (
    <div>
      <p>Holy shit auth is working</p>
      <p>Username: {userInfo?.username}</p>
    </div>
  );
}

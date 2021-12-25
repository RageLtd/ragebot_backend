import "./App.css";
import { Route, Routes } from "react-router-dom";
import { useAuth0, User, withAuthenticationRequired } from "@auth0/auth0-react";
import DashboardView from "./views/Dashboard/Dashboard";
import Followers from "./views/Followers/Followers";
import { useEffect, useState } from "react";
import { setupUserDb } from "./views/utils/setupUserDb";
import { userDbExists } from "./views/utils/user";

function App() {
  const {
    isAuthenticated,
    user,
    isLoading,
    error,
    logout,
    getAccessTokenSilently,
  } = useAuth0();
  const [isUserLoading, setIsUserLoading] = useState(true);

  const isApplicationLoading = () => {
    return isLoading && isUserLoading;
  };

  const [twitchUserInfo, setTwitchUserInfo] = useState({
    username: undefined,
    user_id: undefined,
  });

  useEffect(() => {
    setIsUserLoading(true);
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
          setTwitchUserInfo({
            ...user,
            user_id: user.user_id.split("|").pop(),
          });
          return { ...user, user_id: user.user_id.split("|").pop };
        })
        .then(async (user) => {
          if (!userDbExists(user.username)) {
            setupUserDb(user.username, user.user_id);
          }
        })
        .then(() => {
          setIsUserLoading(false);
        })
        .catch((error: Error) => console.error(error));
    }
  }, [getAccessTokenSilently, user, isAuthenticated]);

  const handleLogout = () => logout({ returnTo: window.location.origin });
  if (isApplicationLoading()) {
    return (
      <div className="App">
        <h3>Loading...</h3>
        <Routes>
          <Route
            path="/"
            element={withAuthenticationRequired(DashboardView)({
              twitchUserInfo,
            })}
          />
          <Route
            path="/followers"
            element={withAuthenticationRequired(Followers)({ twitchUserInfo })}
          />
        </Routes>
      </div>
    );
  }

  if (error) {
    console.error(error);
    return (
      <div className="App">
        <p>Something broke! {error.message}</p>
        <Routes>
          <Route
            path="/"
            element={withAuthenticationRequired(DashboardView)({
              twitchUserInfo,
            })}
          />
          <Route
            path="/followers"
            element={withAuthenticationRequired(Followers)({ twitchUserInfo })}
          />
        </Routes>
      </div>
    );
  }
  return (
    <div className="App">
      {isAuthenticated && <button onClick={handleLogout}>Log out</button>}
      <Routes>
        <Route
          path="/"
          element={withAuthenticationRequired(DashboardView)({
            twitchUserInfo,
          })}
        />
        <Route
          path="/followers"
          element={withAuthenticationRequired(Followers)({ twitchUserInfo })}
        />
      </Routes>
    </div>
  );
}

export default App;

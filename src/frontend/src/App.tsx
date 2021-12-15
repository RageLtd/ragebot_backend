import "./App.css";
import { Route, Routes } from "react-router-dom";
import Auth from "./views/Auth/Auth";
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

  const [twitchUserInfo, setTwitchUserInfo] = useState({
    username: undefined,
    user_id: undefined,
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
          setTwitchUserInfo(user);
          return user;
        })
        .then(async (user) => {
          if (!userDbExists(user.username)) {
            setupUserDb(user.username, user.user_id);
          }
        })
        .catch((error: Error) => console.error(error));
    }
  }, [getAccessTokenSilently, user, isAuthenticated]);

  const handleLogout = () => logout({ returnTo: window.location.origin });
  if (isLoading) {
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
          <Route path="/login" element={<Auth />} />
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
          <Route path="/login" element={<Auth />} />
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
        <Route path="/login" element={<Auth />} />
        <Route
          path="/followers"
          element={withAuthenticationRequired(Followers)({ twitchUserInfo })}
        />
      </Routes>
    </div>
  );
}

export default App;

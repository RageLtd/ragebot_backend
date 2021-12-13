import "./App.css";
import { Route, Routes } from "react-router-dom";
import Auth from "./views/Auth/Auth";
import { useAuth0 } from "@auth0/auth0-react";
import DashboardView from "./views/Dashboard/Dashboard";

function App() {
  const { isAuthenticated, isLoading, error, logout } = useAuth0();

  const handleLogout = () => logout({ returnTo: window.location.origin });
  if (isLoading) {
    return <p>Loading stuff</p>;
  }

  if (error) {
    console.error(error);
    return <p>Something broke! {error.message}</p>;
  }
  return (
    <div className="App">
      {isAuthenticated && <button onClick={handleLogout}>Log out</button>}
      <Routes>
        <Route path="/" element={<DashboardView />} />
        <Route path="/login" element={<Auth />} />
      </Routes>
    </div>
  );
}

export default App;

import { useAuth0 } from "@auth0/auth0-react";

export default function AuthView() {
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  console.log(isAuthenticated);
  if (!isAuthenticated) {
    return (
      <>
        Please log in first
        <button onClick={loginWithRedirect}>Log in</button>
      </>
    );
  }

  return <></>;
}

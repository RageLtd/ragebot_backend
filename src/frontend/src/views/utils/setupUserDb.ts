export function setupUserDb(username: string, user_id: string) {
  // TODO: Don't do this
  fetch(
    `http://${window.location.hostname}:${
      Number(window.location.port) + 1
    }/user-setup`,
    {
      method: "post",
      body: JSON.stringify({ username, user_id }),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

// {
//   username: 'RageLtd'
// }

export function setupUserDb(username: string) {
  // TODO: Don't do this
  fetch(
    `http://${window.location.hostname}:${
      Number(window.location.port) + 1
    }/user-setup`,
    {
      method: "post",
      body: JSON.stringify({ username }),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

// {
//   username: 'RageLtd'
// }

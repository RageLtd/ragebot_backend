export function setupUserDb(username: string, user_id: string) {
  // TODO: Don't do this
  fetch(`https://${window.location.hostname}/user-setup`, {
    method: "post",
    body: JSON.stringify({ username, user_id }),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

// {
//   username: 'RageLtd'
// }

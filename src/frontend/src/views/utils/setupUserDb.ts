export function setupUserDb(username: string, user_id: string) {
  // TODO: Don't do this
  fetch(`//${window.location.host}/api/user-setup`, {
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

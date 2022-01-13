export function setupUserDb(username: string, user_id: string) {
  return fetch(`/api/user-setup`, {
    method: "post",
    body: JSON.stringify({ username, user_id }),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

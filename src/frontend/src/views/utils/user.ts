export async function userDbExists(username: string) {
  const res = await fetch(
    `http://${window.location.hostname}:${
      Number(window.location.port) + 1
    }/user-setup?username=${username.toLowerCase()}`
  );

  return res.ok;
}

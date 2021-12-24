export async function userDbExists(username: string) {
  const res = await fetch(
    `https://${
      window.location.hostname
    }/user-setup?username=${username.toLowerCase()}`
  );

  return res.ok;
}

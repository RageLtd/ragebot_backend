export async function userDbExists(username: string) {
  const res = await fetch(
    `//${
      window.location.host
    }/api/user-setup?username=${username.toLowerCase()}`
  );

  return res.ok;
}

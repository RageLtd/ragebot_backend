import { Userstate } from "tmi.js";
import { filterRegistry } from "..";
import { isModerator } from "../utils/permissioning";

export async function addTermToWhitelist(
  target: string,
  userState: Userstate,
  params: string[]
) {
  if (isModerator(userState)) {
    await filterRegistry.addToWhitelist(target, params[0]);
  }
}

export async function removeTermFromWhitelist(
  target: string,
  userState: Userstate,
  params: string[]
) {
  if (isModerator(userState)) {
    await filterRegistry.removeFromWhitelist(target, params[0]);
  }
}

export async function addTermToBlacklist(
  target: string,
  userState: Userstate,
  params: string[]
) {
  if (isModerator(userState)) {
    await filterRegistry.addToBlacklist(target, params[0]);
  }
}

export async function removeTermFromBlacklist(
  target: string,
  userState: Userstate,
  params: string[]
) {
  if (isModerator(userState)) {
    await filterRegistry.removeFromBlacklist(target, params[0]);
  }
}

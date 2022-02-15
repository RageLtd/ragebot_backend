import { Userstate } from "tmi.js";
import { tmiClient } from "../..";
import { raffle_sse_clients } from "../../ragebotServer";
import { isModerator } from "../../utils/permissioning";

export const raffles: { [key: string]: Set<string> } = {};

function getRandomValue(set: Set<string>) {
  const index = Math.floor(Math.random() * set.size);
  let count = 0;
  for (let entry of set.keys()) {
    if (count++ === index) {
      return entry;
    }
  }
}

export async function parseRaffle(
  target: string,
  userState: Userstate,
  params: string[]
) {
  if (isModerator(userState) && params[0] === "open") {
    openRaffle(target);
    return;
  }

  if (isModerator(userState) && params[0] === "close") {
    closeRaffle(target);
    return;
  }

  enterRaffle(target, userState);
}

export async function openRaffle(target: string) {
  const raffleExists = !!raffles[target];
  if (raffleExists) {
    tmiClient.say(target, "Raffle already open!");
    return;
  }

  raffles[target] = new Set();

  tmiClient.say(target, "Raffle opened! Type !raffle to enter!");
}

export function closeRaffle(target: string) {
  const winner = getRandomValue(raffles[target]);

  tmiClient.say(target, `Raffle winner is: ${winner}`);
  delete raffles[target];

  return winner;
}

export function enterRaffle(target: string, userState: Userstate) {
  if (!raffles[target]) {
    if (userState.id) {
      tmiClient.deletemessage(target, userState.id);
    }
    tmiClient.say(target, "No raffle is open.");
    return;
  }

  raffles[target].add(userState["display-name"]!);

  raffle_sse_clients[target]?.forEach((client) => {
    client.res.write(
      `data: ${JSON.stringify([userState["display-name"]])}\r\n\r\n`
    );
  });
}

import Filter from "bad-words";
import { Client } from "faunadb";
import { clientRegistry, faunaClient } from "..";
import { Database } from "../channelEvents";
import {
  addToBlacklistQuery,
  addToWhitelistQuery,
  BlacklistResponse,
  getBlacklistQuery,
  getUsingDefaultBlocklistQuery,
  getWhitelistQuery,
  removeFromBlacklistQuery,
  removeFromWhitelistQuery,
  WhitelistResponse,
} from "./filterQueries";

export async function getWhitelist(
  client: Client,
  after?: any
): Promise<string[]> {
  return await client
    ?.query<WhitelistResponse>(getWhitelistQuery(after))
    .then(async (res) => {
      if (res.after) {
        return [...res.data, ...(await getWhitelist(client, res.after))];
      }
      return res.data;
    });
}

export async function getBlacklist(
  client: Client,
  after?: any
): Promise<string[]> {
  return await client
    ?.query<BlacklistResponse>(getBlacklistQuery())
    .then(async (res) => {
      if (res.after) {
        return [...res.data, ...(await getBlacklist(client, res.after))];
      }
      return res.data;
    });
}

interface FilterMap {
  [key: string]: Filter;
}

export class ChatFilterRegistry {
  filters: FilterMap = {};

  async getFilter(target: string) {
    if (this.filters[target]) {
      return this.filters[target];
    }

    await this.initializeFilter(target);

    return this.filters[target];
  }

  async initializeFilter(target: string) {
    const {
      data: { useDefaultBlocklist },
    } = await faunaClient.query<Database>(
      getUsingDefaultBlocklistQuery(target.substring(1))
    );

    this.filters[target] = new Filter({
      emptyList: !useDefaultBlocklist,
    });

    // Go get whitelist
    const client = await clientRegistry.getClient(target);

    const whitelist = await getWhitelist(client!).catch(console.error);

    // Apply whitelist
    this.filters[target].removeWords(...whitelist!);

    // Go get blacklist
    const blacklist = await getBlacklist(client!).catch(console.error);
    this.filters[target].addWords(...blacklist!);
  }

  async addToWhitelist(target: string, term: string) {
    const client = await clientRegistry.getClient(target);
    await client?.query(addToWhitelistQuery(term));

    this.initializeFilter(target);
  }

  async removeFromWhitelist(target: string, term: string) {
    const client = await clientRegistry.getClient(target);
    await client?.query(removeFromWhitelistQuery(term));

    await this.initializeFilter(target);
  }

  async addToBlacklist(target: string, term: string) {
    const client = await clientRegistry.getClient(target);
    await client?.query(addToBlacklistQuery(term));

    this.initializeFilter(target);
  }

  async removeFromBlacklist(target: string, term: string) {
    const client = await clientRegistry.getClient(target);
    await client?.query(removeFromBlacklistQuery(term));

    await this.initializeFilter(target);
  }
}

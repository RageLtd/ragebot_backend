import Filter from "bad-words";
import { clientRegistry } from "..";
import {
  addToBlacklistQuery,
  addToWhitelistQuery,
  BlacklistResponse,
  getBlacklistQuery,
  getWhitelistQuery,
  removeFromBlacklistQuery,
  removeFromWhitelistQuery,
  WhitelistResponse,
} from "./filterQueries";

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
    this.filters[target] = new Filter();

    // Go get whitelist
    const client = await clientRegistry.getClient(target);

    const { data: whitelist } = (await client?.query(
      getWhitelistQuery()
    )) as WhitelistResponse;
    // Apply whitelist
    this.filters[target].removeWords(...whitelist!);

    // Go get blacklist
    const { data: blacklist } = (await client?.query(
      getBlacklistQuery()
    )) as BlacklistResponse;
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

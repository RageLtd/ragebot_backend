import { Client, CreateKey, Database, Get } from "faunadb";
import { faunaClient } from ".";

type ClientMap = {
  [key: string]: {
    client?: Client;
    ref?: any;
  };
};

interface KeyCreateReponse {
  secret: string;
  ref: any;
}

export async function childDbExists(target: string) {
  const { code } = (await faunaClient.query(
    Get(Database(target.substring(1)))
  )) as {
    [key: string]: string;
  };

  return code !== "invalid ref";
}

export class ClientRegistry {
  clients: ClientMap = {};

  async getClient(target: string) {
    if (this.clients[target]?.client) {
      return this.clients[target].client;
    }

    // Create a new client if one doesn't exist
    if (await childDbExists(target)) {
      // If the DB exists already we need keys
      const { secret, ref } = (await faunaClient.query(
        CreateKey({
          data: {
            name: `${target.substring(1)}_key`,
          },
          role: "server",
          database: Database(target.substring(1)),
        })
      )) as KeyCreateReponse;

      this.clients[target] = {};

      this.clients[target].ref = ref;

      this.clients[target].client = new Client({
        domain: "db.us.fauna.com",
        port: 443,
        scheme: "https",
        secret,
      });

      return this.clients[target].client;
    }

    //Todo: Handle cases when the DB doesn't exist
  }
}

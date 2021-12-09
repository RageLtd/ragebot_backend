import { Client, CreateKey, Database } from "faunadb";
import { faunaClient } from "../..";

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

export class ClientRegistry {
  clients: ClientMap = {};

  async childDbExists(target: string) {
    return await faunaClient.query(Database(target.substring(1)));
  }

  async getClient(target: string) {
    if (this.clients[target]?.client) {
      return this.clients[target].client;
    }

    // Create a new client if one doesn't exist
    if (await this.childDbExists(target)) {
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

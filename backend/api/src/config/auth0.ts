import { ManagementClient } from "auth0";

let auth0Client: ManagementClient | null = null;

export const getAuth0ManagementClient = async (): Promise<ManagementClient> => {
  if (!auth0Client) {
    auth0Client = new ManagementClient({
      domain: process.env.AUTH0_DOMAIN || "",
      clientId: process.env.AUTH0_CLIENT_ID || "",
      clientSecret: process.env.AUTH0_CLIENT_SECRET || "",
    });
  }
  return auth0Client;
}; 
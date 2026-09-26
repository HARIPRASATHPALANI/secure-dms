import { CosmosClient } from '@azure/cosmos';
import { DefaultAzureCredential } from '@azure/identity';

const COSMOS_ENDPOINT =
  process.env.COSMOS_ENDPOINT ||
  'https://dms-cosmos-2026-hari.documents.azure.com:443/';

const DATABASE_NAME = 'dmsdb';

const credential = new DefaultAzureCredential();

export const cosmosClient = new CosmosClient({
  endpoint: COSMOS_ENDPOINT,
  aadCredentials: credential
});

export const cosmosDatabase = cosmosClient.database(DATABASE_NAME);

export const usersContainer = cosmosDatabase.container('Users');
export const casesContainer = cosmosDatabase.container('Cases');
export const documentsContainer = cosmosDatabase.container('Documents');
export const auditLogsContainer = cosmosDatabase.container('AuditLogs');

console.log('✅ Cosmos DB configuration loaded');

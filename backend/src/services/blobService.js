import { BlobServiceClient } from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';

const STORAGE_ACCOUNT_NAME =
  process.env.BLOB_STORAGE_ACCOUNT || 'dmsdocuments2026hari';

const CONTAINER_NAME =
  process.env.BLOB_CONTAINER || 'documents';

const accountUrl =
  `https://${STORAGE_ACCOUNT_NAME}.blob.core.windows.net`;

const credential = new DefaultAzureCredential();

const blobServiceClient = new BlobServiceClient(
  accountUrl,
  credential
);

const containerClient =
  blobServiceClient.getContainerClient(CONTAINER_NAME);

export { blobServiceClient, containerClient };

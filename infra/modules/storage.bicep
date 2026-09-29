param frontendStorageName string
param documentStorageName string
param location string = resourceGroup().location

resource frontendStorage 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: frontendStorageName
  location: location
  sku: {
    name: 'Standard_ZRS'
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    supportsHttpsTrafficOnly: true
    allowBlobPublicAccess: false
    minimumTlsVersion: 'TLS1_0'
  }
}

resource documentStorage 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: documentStorageName
  location: location
  sku: {
    name: 'Standard_ZRS'
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    supportsHttpsTrafficOnly: true
    allowBlobPublicAccess: false
    minimumTlsVersion: 'TLS1_2'
  }
}

resource documentBlobService 'Microsoft.Storage/storageAccounts/blobServices@2021-09-01' = {
  parent: documentStorage
  name: 'default'
}

resource documentsContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = {
  parent: documentBlobService
  name: 'documents'
  properties: {
    publicAccess: 'None'
  }
}

output frontendStorageId string = frontendStorage.id
output documentStorageId string = documentStorage.id

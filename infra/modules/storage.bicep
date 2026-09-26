param frontendStorageName string
param documentStorageName string

resource frontendStorage 'Microsoft.Storage/storageAccounts@2023-05-01' existing = {
  name: frontendStorageName
}

resource documentStorage 'Microsoft.Storage/storageAccounts@2023-05-01' existing = {
  name: documentStorageName
}

output frontendStorageId string = frontendStorage.id
output documentStorageId string = documentStorage.id

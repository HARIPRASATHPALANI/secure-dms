param cosmosAccountName string

resource cosmos 'Microsoft.DocumentDB/databaseAccounts@2024-05-15' existing = {
  name: cosmosAccountName
}

output cosmosId string = cosmos.id
output cosmosName string = cosmos.name

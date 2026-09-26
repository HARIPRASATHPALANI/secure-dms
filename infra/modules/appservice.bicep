param appServiceName string

resource appService 'Microsoft.Web/sites@2024-04-01' existing = {
  name: appServiceName
}

output appServiceId string = appService.id
output appServiceName string = appService.name

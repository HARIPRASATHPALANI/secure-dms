param privateEndpointName string

resource privateEndpoint 'Microsoft.Network/privateEndpoints@2024-01-01' existing = {
  name: privateEndpointName
}

output privateEndpointId string = privateEndpoint.id
output privateEndpointName string = privateEndpoint.name

param appGatewayName string

resource appGateway 'Microsoft.Network/applicationGateways@2024-01-01' existing = {
  name: appGatewayName
}

output appGatewayId string = appGateway.id
output appGatewayName string = appGateway.name

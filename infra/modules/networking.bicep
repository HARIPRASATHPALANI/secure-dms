param vnetName string

resource vnet 'Microsoft.Network/virtualNetworks@2024-01-01' existing = {
  name: vnetName
}

output vnetId string = vnet.id
output vnetName string = vnet.name

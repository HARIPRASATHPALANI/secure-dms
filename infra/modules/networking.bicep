param vnetName string
param location string = resourceGroup().location

resource appNsg 'Microsoft.Network/networkSecurityGroups@2024-01-01' = {
  name: 'dms-app-nsg'
  location: location
}

resource dataNsg 'Microsoft.Network/networkSecurityGroups@2024-01-01' = {
  name: 'dms-data-nsg'
  location: location
}

resource vnet 'Microsoft.Network/virtualNetworks@2024-01-01' = {
  name: vnetName
  location: location
  properties: {
    addressSpace: {
      addressPrefixes: [
        '10.0.0.0/16'
      ]
    }
  }
}

resource appSubnet 'Microsoft.Network/virtualNetworks/subnets@2024-01-01' = {
  parent: vnet
  name: 'dms-app-subnet'
  properties: {
    addressPrefix: '10.0.1.0/24'
    networkSecurityGroup: {
      id: appNsg.id
    }
    serviceEndpoints: [
      {
        service: 'Microsoft.Web'
      }
    ]
    delegations: [
      {
        name: 'webDelegation'
        properties: {
          serviceName: 'Microsoft.Web/serverfarms'
        }
      }
    ]
  }
}

resource dataSubnet 'Microsoft.Network/virtualNetworks/subnets@2024-01-01' = {
  parent: vnet
  name: 'dms-data-subnet'
  properties: {
    addressPrefix: '10.0.2.0/24'
    networkSecurityGroup: {
      id: dataNsg.id
    }
    privateEndpointNetworkPolicies: 'Disabled'
  }
}

resource gatewaySubnet 'Microsoft.Network/virtualNetworks/subnets@2024-01-01' = {
  parent: vnet
  name: 'GatewaySubnet'
  properties: {
    addressPrefix: '10.0.3.0/24'
  }
}

resource applicationGatewaySubnet 'Microsoft.Network/virtualNetworks/subnets@2024-01-01' = {
  parent: vnet
  name: 'dms-applicationgate-subnet'
  properties: {
    addressPrefix: '10.0.4.0/24'
    serviceEndpoints: [
      {
        service: 'Microsoft.Web'
      }
    ]
  }
}

output vnetId string = vnet.id
output vnetName string = vnet.name
output appSubnetId string = appSubnet.id
output dataSubnetId string = dataSubnet.id
output applicationGatewaySubnetId string = applicationGatewaySubnet.id
output appNsgId string = appNsg.id
output dataNsgId string = dataNsg.id

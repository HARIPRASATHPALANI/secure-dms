param appGatewayPublicIpName string
param dnsZoneName string = 'haricloud.in'
param location string = 'global'

resource publicIp 'Microsoft.Network/publicIPAddresses@2024-01-01' existing = {
  name: appGatewayPublicIpName
}

resource dnsZone 'Microsoft.Network/dnszones@2018-05-01' = {
  name: dnsZoneName
  location: location
  properties: {
    zoneType: 'Public'
  }
}

resource dmsARecord 'Microsoft.Network/dnszones/A@2018-05-01' = {
  parent: dnsZone
  name: 'dms'
  properties: {
    TTL: 3600
    ARecords: [
      {
        ipv4Address: publicIp.properties.ipAddress
      }
    ]
  }
}

output dnsZoneId string = dnsZone.id
output dmsFqdn string = dmsARecord.properties.fqdn

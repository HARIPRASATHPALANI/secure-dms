param appGatewayName string
param vnetName string
param location string = resourceGroup().location

var publicIpName = 'dms-appgw-public-ip'
var wafPolicyName = 'dms-waf-policy'
var managedIdentityName = 'dms-appgw-identity'
var keyVaultName = 'dms-kv-hari-2026'

var frontendStorageFqdn = 'dmsfrontendhari2026.z29.web.core.windows.net'
var backendAppServiceFqdn = 'dms-backend-appservice-hari-f5g6fnagejfsgqhg.centralindia-01.azurewebsites.net'

resource vnet 'Microsoft.Network/virtualNetworks@2024-01-01' existing = {
  name: vnetName
}

resource applicationGatewaySubnet 'Microsoft.Network/virtualNetworks/subnets@2024-01-01' existing = {
  parent: vnet
  name: 'dms-applicationgate-subnet'
}

resource publicIp 'Microsoft.Network/publicIPAddresses@2024-01-01' = {
  name: publicIpName
  location: location
  sku: {
    name: 'Standard'
  }
  zones: [
    '1'
    '2'
    '3'
  ]
  properties: {
    publicIPAllocationMethod: 'Static'
    publicIPAddressVersion: 'IPv4'
  }
}

resource wafPolicy 'Microsoft.Network/ApplicationGatewayWebApplicationFirewallPolicies@2024-01-01' = {
  name: wafPolicyName
  location: location
  properties: {
    policySettings: {
      state: 'Enabled'
      mode: 'Detection'
      requestBodyCheck: true
      requestBodyEnforcement: true
      maxRequestBodySizeInKb: 128
      fileUploadEnforcement: true
      fileUploadLimitInMb: 100
    }
    managedRules: {
      managedRuleSets: [
        {
          ruleSetType: 'Microsoft_DefaultRuleSet'
          ruleSetVersion: '2.1'
        }
      ]
    }
  }
}

resource appGatewayIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: managedIdentityName
  location: location
}

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' existing = {
  name: keyVaultName
}

resource keyVaultSecretsUserRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(
    keyVault.id,
    appGatewayIdentity.id,
    'Key Vault Secrets User'
  )
  scope: keyVault
  properties: {
    roleDefinitionId: subscriptionResourceId(
      'Microsoft.Authorization/roleDefinitions',
      '4633458b-17de-408a-b874-0445c86b69e6'
    )
    principalId: appGatewayIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

resource applicationGateway 'Microsoft.Network/applicationGateways@2024-01-01' = {
  name: appGatewayName
  location: location

  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${appGatewayIdentity.id}': {}
    }
  }

  properties: {
    autoscaleConfiguration: {
      minCapacity: 1
      maxCapacity: 2
    }

    enableHttp2: true

    firewallPolicy: {
      id: wafPolicy.id
    }

    sku: {
      name: 'WAF_v2'
      tier: 'WAF_v2'
    }

    gatewayIPConfigurations: [
      {
        name: 'dms-appgw-ipconfig'
        properties: {
          subnet: {
            id: applicationGatewaySubnet.id
          }
        }
      }
    ]

    frontendIPConfigurations: [
      {
        name: 'dms-appgw-public-frontend'
        properties: {
          publicIPAddress: {
            id: publicIp.id
          }
        }
      }
    ]

    frontendPorts: [
      {
        name: 'dms-http-port'
        properties: {
          port: 80
        }
      }
      {
        name: 'dms-https-port'
        properties: {
          port: 443
        }
      }
    ]

    sslCertificates: [
      {
        name: 'dms-haricloud-letsencrypt'
        properties: {
          keyVaultSecretId: 'https://dms-kv-hari-2026.vault.azure.net/secrets/dms-haricloud-letsencrypt'
        }
      }
    ]

    httpListeners: [
      {
        name: 'dms-http-listener'
        properties: {
          frontendIPConfiguration: {
            id: resourceId(
              'Microsoft.Network/applicationGateways/frontendIPConfigurations',
              appGatewayName,
              'dms-appgw-public-frontend'
            )
          }
          frontendPort: {
            id: resourceId(
              'Microsoft.Network/applicationGateways/frontendPorts',
              appGatewayName,
              'dms-http-port'
            )
          }
          protocol: 'Http'
        }
      }
      {
        name: 'dms-https-listener'
        properties: {
          frontendIPConfiguration: {
            id: resourceId(
              'Microsoft.Network/applicationGateways/frontendIPConfigurations',
              appGatewayName,
              'dms-appgw-public-frontend'
            )
          }
          frontendPort: {
            id: resourceId(
              'Microsoft.Network/applicationGateways/frontendPorts',
              appGatewayName,
              'dms-https-port'
            )
          }
          protocol: 'Https'
          hostName: 'dms.haricloud.in'
          requireServerNameIndication: true
          sslCertificate: {
            id: resourceId(
              'Microsoft.Network/applicationGateways/sslCertificates',
              appGatewayName,
              'dms-haricloud-letsencrypt'
            )
          }
        }
      }
    ]

    backendAddressPools: [
      {
        name: 'dms-backend-pool'
        properties: {
          backendAddresses: [
            {
              fqdn: backendAppServiceFqdn
            }
          ]
        }
      }
      {
        name: 'dms-frontend-pool'
        properties: {
          backendAddresses: [
            {
              fqdn: frontendStorageFqdn
            }
          ]
        }
      }
    ]

    probes: [
      {
        name: 'dms-health-probe'
        properties: {
          protocol: 'Https'
          path: '/api/health'
          interval: 30
          timeout: 30
          unhealthyThreshold: 3
          pickHostNameFromBackendHttpSettings: true
          match: {
            statusCodes: [
              '200-399'
            ]
          }
        }
      }
      {
        name: 'dms-frontend-probe'
        properties: {
          protocol: 'Https'
          path: '/'
          interval: 30
          timeout: 30
          unhealthyThreshold: 3
          host: frontendStorageFqdn
          pickHostNameFromBackendHttpSettings: false
          match: {
            statusCodes: [
              '200-399'
            ]
          }
        }
      }
    ]

    backendHttpSettingsCollection: [
      {
        name: 'dms-backend-http-setting'
        properties: {
          port: 443
          protocol: 'Https'
          cookieBasedAffinity: 'Disabled'
          requestTimeout: 20
          pickHostNameFromBackendAddress: true
          probe: {
            id: resourceId(
              'Microsoft.Network/applicationGateways/probes',
              appGatewayName,
              'dms-health-probe'
            )
          }
        }
      }
      {
        name: 'dms-frontend-http-setting'
        properties: {
          port: 443
          protocol: 'Https'
          cookieBasedAffinity: 'Disabled'
          requestTimeout: 20
          hostName: frontendStorageFqdn
          pickHostNameFromBackendAddress: false
          probe: {
            id: resourceId(
              'Microsoft.Network/applicationGateways/probes',
              appGatewayName,
              'dms-frontend-probe'
            )
          }
        }
      }
    ]

    urlPathMaps: [
      {
        name: 'dms-main-path-map'
        properties: {
          defaultBackendAddressPool: {
            id: resourceId(
              'Microsoft.Network/applicationGateways/backendAddressPools',
              appGatewayName,
              'dms-frontend-pool'
            )
          }
          defaultBackendHttpSettings: {
            id: resourceId(
              'Microsoft.Network/applicationGateways/backendHttpSettingsCollection',
              appGatewayName,
              'dms-frontend-http-setting'
            )
          }
          pathRules: [
            {
              name: 'dms-api-path-rule'
              properties: {
                paths: [
                  '/api/*'
                ]
                backendAddressPool: {
                  id: resourceId(
                    'Microsoft.Network/applicationGateways/backendAddressPools',
                    appGatewayName,
                    'dms-backend-pool'
                  )
                }
                backendHttpSettings: {
                  id: resourceId(
                    'Microsoft.Network/applicationGateways/backendHttpSettingsCollection',
                    appGatewayName,
                    'dms-backend-http-setting'
                  )
                }
              }
            }
          ]
        }
      }
    ]

    requestRoutingRules: [
      {
        name: 'dms-https-routing-rule'
        properties: {
          ruleType: 'PathBasedRouting'
          priority: 90
          httpListener: {
            id: resourceId(
              'Microsoft.Network/applicationGateways/httpListeners',
              appGatewayName,
              'dms-https-listener'
            )
          }
          urlPathMap: {
            id: resourceId(
              'Microsoft.Network/applicationGateways/urlPathMaps',
              appGatewayName,
              'dms-main-path-map'
            )
          }
        }
      }
      {
        name: 'dms-routing-rule'
        properties: {
          ruleType: 'Basic'
          priority: 100
          httpListener: {
            id: resourceId(
              'Microsoft.Network/applicationGateways/httpListeners',
              appGatewayName,
              'dms-http-listener'
            )
          }
          backendAddressPool: {
            id: resourceId(
              'Microsoft.Network/applicationGateways/backendAddressPools',
              appGatewayName,
              'dms-backend-pool'
            )
          }
          backendHttpSettings: {
            id: resourceId(
              'Microsoft.Network/applicationGateways/backendHttpSettingsCollection',
              appGatewayName,
              'dms-backend-http-setting'
            )
          }
        }
      }
    ]
  }
}

output appGatewayId string = applicationGateway.id
output appGatewayName string = applicationGateway.name
output publicIpId string = publicIp.id
output publicIpAddress string = publicIp.properties.ipAddress
output identityPrincipalId string = appGatewayIdentity.properties.principalId

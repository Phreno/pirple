// container for all the environments
const environments = {}
// default
environments.staging = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: 'staging',
  hashingSecret: 'notAStrongSecret'
}
// production
environments.production = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: 'production',
  hashingSecret: 'notAStrongSecret'
}
// determine the current environment
const currentEnvironment = (process.env.NODE_ENV || '').toLowerCase()
// check the current environment existence
const environmentToExport = environments[currentEnvironment] || environments.staging
// export the module
module.exports = environmentToExport
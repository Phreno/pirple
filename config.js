// container for all the environments
const environments = {}
// default
environments.staging = {
  port: 3000,
  envName: 'staging'
}
// production
environments.production = {
  port: 5000,
  envName: 'production'
}
// determine the current environment
const currentEnvironment = (process.env.NODE_ENV || '').toLowerCase()
// check the current environment existence
const environmentToExport = environments[currentEnvironment] || environments.staging
// export the module
module.exports = environmentToExport
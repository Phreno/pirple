/**
 * @ Author: Phreno
 * @ Create Time: 2020-04-05 07:52:08
 * @ Modified Phreno
 * @ Modified time: 2020-04-05 08:28:59
 * @ Description: Container for all the environments
 */

/* ------------------------------ configuration ----------------------------- */

const environments = {}

/* --------------------------------- default -------------------------------- */

environments.staging = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: 'staging',
  hashingSecret: 'notAStrongSecret'
}

/* ------------------------------- production ------------------------------- */

environments.production = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: 'production',
  hashingSecret: 'notAStrongSecret'
}

/* -------------------------------------------------------------------------- */
/*                      determine the current environment                     */
/* -------------------------------------------------------------------------- */

const currentEnvironment = (process.env.NODE_ENV || '').toLowerCase()
const environmentToExport =
  environments[currentEnvironment] || environments.staging

/* ---------------------------- export the module --------------------------- */

module.exports = environmentToExport
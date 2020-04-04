const crypto = require('crypto')
const config = require('./config')
const helpers = {}
helpers.hash = (str) => {
  let hash;
  ['string'].includes(typeof (str)) &&
    str.length &&
    (hash = crypto.createHmac('sha256', config.hashingSecret)).update(str).digest('hex')
  return hash
}
module.exports = helpers
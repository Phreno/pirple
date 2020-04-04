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
helpers.parseJsonToObject = (str) => {
  let obj
  try {
    obj = JSON.parse(str)
  } catch (error) {
    obj = {}
  }
  return obj
}
module.exports = helpers
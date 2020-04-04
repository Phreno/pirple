const crypto = require('crypto')
const config = require('./config')
const helpers = {}

/* --------------------------------- regexp --------------------------------- */

helpers.isValidPhone = (str) => ['string'].includes(typeof (str)) &&
  str.match(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/)

helpers.isValidName = (str) => ['string'].includes(typeof (str)) &&
  str.match(/^([A-Z][a-z]+([ ]?[a-z]?['-]?[A-Z][a-z]+)*)$/)

helpers.isValidPassword = (str) => ['string'].includes(typeof (str)) &&
  str.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm)

/* --------------------------------- crypto --------------------------------- */

helpers.hash = (str) => {
  let hash;
  ['string'].includes(typeof (str)) &&
    str.length &&
    (hash = crypto.createHmac('sha256', config.hashingSecret)).update(str).digest('hex')
  return hash
}

/* ---------------------------- parse & serialize --------------------------- */

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
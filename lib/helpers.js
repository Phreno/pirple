/**
 * @ Author: Phreno
 * @ Create Time: 2020-04-05 08:02:20
 * @ Modified by: Phreno
 * @ Modified time: 2020-04-05 13:45:22
 * @ Description: Container for tools and stuff
 */

/* --------------------------------- import --------------------------------- */

const crypto = require('crypto')
const config = require('./config')

/* ------------------------------ configuration ----------------------------- */

const helpers = {}

/* -------------------------------------------------------------------------- */
/*                               data generation                              */
/* -------------------------------------------------------------------------- */

// https://stackoverflow.com/a/2117523
helpers.createGUID = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
  .replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });

helpers.createRandomString = (strLength) => {
  let randomString
  if (helpers.checkNumber(strLength) && strLength) {
    let possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0987654321';
    randomString = [...Array(strLength)].map(() =>
      possibleCharacters.charAt(
        Math.floor(Math.random() * possibleCharacters.length))
    ).join('')
  }
  return randomString
}

helpers.createTokenExpiration = () => Date.now() + 1000 * 60 * 60


/* -------------------------------------------------------------------------- */
/*                                  validator                                 */
/* -------------------------------------------------------------------------- */

helpers.checkString = (str) => ['string'].includes(typeof (str))
helpers.checkNumber = (nb) => ['number'].includes(typeof (nb))
helpers.checkBoolean = (bool) => ['boolean'].includes(typeof (bool))

/* --------------------------------- regexp --------------------------------- */

helpers.isValidPhone = (str) => helpers.checkString(str) &&
  str.match(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/)

helpers.isValidName = (str) => helpers.checkString(str) &&
  str.match(/^([A-Z][a-z]+([ ]?[a-z]?['-]?[A-Z][a-z]+)*)$/)

helpers.isValidPassword = (str) => helpers.checkString(str) &&
  str.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm)

helpers.isValidGUID = (str) => helpers.checkString(str) &&
  str.match(/(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}/)

helpers.isValidTokenID = helpers.isValidGUID

/* -------------------------------------------------------------------------- */
/*                                   crypto                                   */
/* -------------------------------------------------------------------------- */

helpers.hash = (str) => {
  let hash;
  helpers.checkString(str) &&
    str.length &&
    (hash = crypto.createHmac('sha256', config.hashingSecret)
      .update(str)
      .digest('hex'))
  return hash.toString()
}

/* -------------------------------------------------------------------------- */
/*                              parse & serialize                             */
/* -------------------------------------------------------------------------- */

helpers.parseJsonToObject = (str) => {
  let obj
  try {
    obj = JSON.parse(str)
  } catch (error) {
    obj = {}
  }
  return obj
}

/* -------------------------------------------------------------------------- */
/*                              export the module                             */
/* -------------------------------------------------------------------------- */

module.exports = helpers
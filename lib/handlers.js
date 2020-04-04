const _data = require('./data')
const helpers = require('./helpers')
// define the handlers
const handlers = {}
handlers.ping = (data, cb) => cb(200)
handlers.notFound = (data, cb) => cb(404)
// users
handlers.users = (data, cb) => {
  const acceptableMethods = Object.keys(handlers._users).includes(data.method) ?
    handlers._users[data.method](data, cb) :
    cb(405)
}
handlers._users = {}
handlers._users.post = (data, cb) => {
  let firstName, lastName, phone, password, tosAgreement;
  ['string'].includes(typeof (data.payload.firstName)) &&
    data.payload.firstName.trim().match(/^([A-Z][a-z]+([ ]?[a-z]?['-]?[A-Z][a-z]+)*)$/) &&
    (firstName = data.payload.firstName.trim());
  ['string'].includes(typeof (data.payload.lastName)) &&
    data.payload.lastName.trim().match(/^([A-Z][a-z]+([ ]?[a-z]?['-]?[A-Z][a-z]+)*)$/) &&
    (lastName = data.payload.lastName.trim());
  ['string'].includes(typeof (data.payload.phone)) &&
    data.payload.phone.trim().match(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/) &&
    (lastName = data.payload.lastName.trim());
  ['string'].includes(typeof (data.payload.password)) &&
    data.payload.password.trim().match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm) &&
    (password = data.payload.password.trim());
  ['boolean'].includes(typeof (data.payload.tosAgreement)) &&
    (tosAgreement = data.payload.tosAgreement)
  // all fields are mandatory
  if ([firstName, lastName, phone, password, tosAgreement].every(el => el)) {
    _data.read('users', phone, (err, data) => {
      if (err) {
        const hashedPassword = helpers.hash(password)
        const userObject = {
          firstName,
          lastName,
          phone,
          hashedPassword,
          tosAgreement: true
        }
      } else {
        cb(400, {
          Error: 'A user with this phone number already exist'
        })
      }
    })
  } else {
    cb(400, {
      Error: 'Missing required fields'
    })
  }

}
handlers._users.get = (data, cb) => {

}
handlers._users.delete = (data, cb) => {

}
handlers._users.put = (data, cb) => {

}
/**
 * @ Author: Phreno
 * @ Create Time: 2020-04-05 08:29:33
 * @ Modified by: Phreno
 * @ Modified time: 2020-04-05 08:38:25
 * @ Description: Container for the handlers
 */

/* --------------------------------- import --------------------------------- */

const _data = require('./data')
const helpers = require('./helpers')

/* ------------------------------ configuration ----------------------------- */

const handlers = {}
handlers.ping = (data, cb) => cb(200)
handlers.notFound = (data, cb) => cb(404)

/* -------------------------------------------------------------------------- */
/*                                    users                                   */
/* -------------------------------------------------------------------------- */

handlers.users = (data, cb) => {
  const acceptableMethods = Object.keys(handlers._users).includes(data.method) ?
    handlers._users[data.method](data, cb) :
    cb(405)
}
handlers._users = {}

/* ------------------------------ create a user ----------------------------- */

handlers._users.post = (data, cb) => {
  let firstName, lastName, phone, password, tosAgreement;
  helpers.isValidName((data.payload.firstName || '').trim()) &&
    (firstName = data.payload.firstName.trim())
  helpers.isValidName((data.payload.lastName || '').trim()) &&
    (lastName = data.payload.lastName.trim());
  helpers.isValidPhone((data.payload.phone || '').trim()) &&
    (phone = data.payload.phone.trim());
  helpers.isValidPassword((data.payload.password || '').trim()) &&
    (password = data.payload.password.trim());
  ['boolean'].includes(typeof (data.payload.tosAgreement)) &&
    (tosAgreement = data.payload.tosAgreement)
  // all fields are mandatory
  if ([
      firstName,
      lastName,
      phone,
      password,
      tosAgreement
    ].every(el => el)) {

    _data.read('users', phone, (err, data) => {
      if (err) {
        const hashedPassword = helpers.hash(password)
        if (hashedPassword) {
          const userObject = {
            firstName,
            lastName,
            phone,
            hashedPassword: hashedPassword,
            tosAgreement: true
          }
          _data.create('users', phone, userObject, (err) => {
            if (!err) {
              cb(200)
            } else {
              console.error(err);
              cb(500, {
                Error: 'Could not create the new user'
              })
            }
          })
        } else {
          cb(500, {
            Error: 'Could not hash the user’s password'
          })
        }
      } else {
        cb(400, {
          Error: 'A user with this phone number already exist'
        })
      }
    })
  } else {
    cb(400, {
      Error: 'Missing required fields: ' + [
        !firstName && 'firstName',
        !lastName && 'lastName',
        !phone && 'phone',
        !password && 'password',
        !tosAgreement && 'tosAgreement'
      ].filter(el => el).join(', ')
    })
  }
}

/* ------------------------------- read a user ------------------------------ */
     
handlers._users.get = (data, cb) => {
  let phone
  helpers.isValidPhone(data.queryStringObject.phone) &&
    (phone = data.queryStringObject.phone)
  if (phone) {
    _data.read('users', phone, (err, data) => {
      if (!err && data) {
        delete(data.hashedPassword)
        cb(200, data)
      } else {
        cb(404)
      }
    })
  } else {
    cb(400, {
      Error: 'Missing required phone number'
    })
  }
}

/* ------------------------------ delete a user ----------------------------- */

handlers._users.delete = (data, cb) => {
  let phone
  helpers.isValidPhone(data.queryStringObject.phone) &&
    (phone = data.queryStringObject.phone)
  if (phone) {
    _data.read('users', phone, (err, data) => {
      if (!err && data) {
        _data.delete('users', phone, (err) => {
          if (!err) {
            cb(200)
          } else {
            cb(500, {
              Error: 'Could not delete the specified user'
            })
          }
        })
      } else {
        cb(400, {
          Error: 'Could not find the specified user'
        })
      }
    })
  } else {
    cb(400, {
      Error: 'Missing required phone number'
    })
  }
}

/* ------------------------------ update a user ----------------------------- */

handlers._users.put = (data, cb) => {
  let firstName, lastName, phone, password;
  helpers.isValidName((data.payload.firstName || '').trim()) &&
    (firstName = data.payload.firstName.trim())
  helpers.isValidName((data.payload.lastName || '').trim()) &&
    (lastName = data.payload.lastName.trim());
  helpers.isValidPhone((data.payload.phone || '').trim()) &&
    (phone = data.payload.phone.trim());
  helpers.isValidPassword((data.payload.password || '').trim()) &&
    (password = data.payload.password.trim());
  const fieldsToUpdate = [
    firstName,
    lastName,
    password
  ]
  if (phone) {
    if (fieldsToUpdate.some(el => el)) {
      _data.read('users', phone, (err, data) => {
        if (!err && data) {
          firstName && (data.firstName = firstName)
          lastName && (data.lastName = lastName)
          password && (data.hashedPassword = helpers.hash(password))
          _data.update('users', phone, data, (err) => {
            if (!err) {
              cb(200)
            } else {
              console.error(err)
              cb(500, {
                Error: 'Could not update the user'
              });
            }
          })
        } else {
          cb(400, {
            Error: 'The specified user does not exist'
          })
        }
      })
    } else {
      cb(400, {
        Error: 'Missing required fields, at least one of those is needed: ' + [
          'firstName',
          'lastName',
          'password'
        ].join(', ')
      })
    }
  } else {
    cb(400, {
      Error: 'Missing required phone number'
    })
  }
}

/* ---------------------------- export the module --------------------------- */

module.exports = handlers
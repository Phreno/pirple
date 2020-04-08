/**
 * @ Author: Phreno
 * @ Create Time: 2020-04-05 08:29:33
 * @ Modified by: Phreno
 * @ Modified time: 2020-04-08 08:21:35
 * @ Description: Container for the handlers
 */

/* --------------------------------- import --------------------------------- */

const _storage = require('./data')
const helpers = require('./helpers')
const config = require('./config')

/* ------------------------------ configuration ----------------------------- */

const handlers = {}
handlers.ping = (_data, cb) => cb(200)
handlers.notFound = (_data, cb) => cb(404)

/* -------------------------------------------------------------------------- */
/*                                   checks                                   */
/* -------------------------------------------------------------------------- */

handlers.checks = (data, cb) => {
  Object.keys(handlers._checks).includes(data.method) ?
    handlers._checks[data.method](data, cb) :
    cb(405)
}
handlers._checks = {}

/* ----------------------------- create a checks ---------------------------- */

handlers._checks.post = (data, cb) => {
  let protocol, url, method, successCodes, timeoutSeconds
  helpers.isValidHttpProtocol((data.payload.protocol || '').trim()) &&
    (protocol = data.payload.protocol.trim())
  helpers.checkString((data.payload.url || '').trim()) &&
    (url = data.payload.url.trim())
  helpers.isValidHttpMethod((data.payload.method || '').trim()) &&
    (method = data.payload.method.trim())
  helpers.checkArray(data.payload.successCodes) &&
    (successCodes = data.payload.successCodes)
  helpers.isValidTimeoutSeconds(data.payload.timeoutSeconds, 5) &&
    (timeoutSeconds = data.payload.timeoutSeconds)
  if (protocol && url && method && successCodes && timeoutSeconds) {
    let tokenID
    helpers.isValidTokenID(data.headers.token) &&
      (tokenID = data.headers.token)
    _storage.read('tokens', tokenID, (err, data) => {
      if (!err && data) {
        const userPhone = data.phone
        _storage.read('users', userPhone, (err, userData) => {
          if (!err && userData) {
            let checks = []
            helpers.checkArray(userData.checks) &&
              (checks = userData.checks)
            if (checks.length < config.maxChecks) {
              const checkID = helpers.createGUID()
              const checkObject = {
                checkID,
                userPhone,
                protocol,
                url,
                method,
                successCodes,
                timeoutSeconds
              }
              _storage.create('checks', checkID, checkObject, (err) => {
                if (!err) {
                  userData.checks = checks
                  userData.checks.push(checkID)
                  _storage.update('users', userPhone, userData, (err) => {
                    if (!err) {
                      cb(200, checkObject)
                    } else {
                      cb(500, { Error: 'Could not update the user with the new checks' })
                    }
                  })

                } else {
                  cb(500, { Error: 'Could not create the new check' })
                }
              })
            } else {
              cb(400, { Error: `The user already have the maximum of checks (${config.maxChecks})` })
            }
          } else {
            cb(403)
          }
        })
      } else {
        cb(403)
      }
    })
  } else {
    cb(400, { Error: 'Missing required inputs, or inputs are invalid' })
  }
}

/* ------------------------------- get a check ------------------------------ */

handlers._checks.get = (data, cb) => {
  let checkID
  helpers.isValidGUID(data.queryStringObject.id) &&
    (checkID = data.queryStringObject.id)
  if (checkID) {
    _storage.read('checks', checkID, (err, checksData) => {
      if (!err && checksData) {
        let tokenID
        helpers.checkString(data.headers.token) &&
          (tokenID = data.headers.token)
        handlers._tokens.verifyToken(tokenID, checksData.userPhone, (tokenIsValid) => {
          if (tokenIsValid) {
            cb(200, checksData)
          } else {
            cb(403)
          }
        })
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

/* ----------------------------- update a check ----------------------------- */

handlers._checks.put = (data, cb) => {
  let protocol, url, method, successCodes, timeoutSeconds, checkID
  helpers.isValidGUID((data.payload.checkID)) &&
    (checkID = data.payload.checkID)
  helpers.isValidHttpProtocol((data.payload.protocol || '').trim()) &&
    (protocol = data.payload.protocol.trim())
  helpers.checkString((data.payload.url || '').trim()) &&
    (url = data.payload.url.trim())
  helpers.isValidHttpMethod((data.payload.method || '').trim()) &&
    (method = data.payload.method.trim())
  helpers.checkArray(data.payload.successCodes) &&
    (successCodes = data.payload.successCodes)
  helpers.isValidTimeoutSeconds(data.payload.timeoutSeconds, 5) &&
    (timeoutSeconds = data.payload.timeoutSeconds)
  if (checkID) {
    if (protocol || url || method || successCodes || timeoutSeconds) {
      _storage.read('checks', checkID, (err, checkData) => {
        if (!err && checkData) {
          let tokenID
          helpers.checkString(data.headers.token) &&
            (tokenID = data.headers.token)
          handlers._tokens.verifyToken(tokenID, checkData.userPhone, (tokenIsValid) => {
            if (tokenIsValid) {
              protocol && (checkData.protocol = protocol)
              url && (checkData.url = url)
              method && (checkData.method = method)
              successCodes && (checkData.successCodes = successCodes)
              timeoutSeconds && (checkData.timeoutSeconds = timeoutSeconds)
              _storage.update('checks', checkID, checkData, (err) => {
                if (!err) {
                  cb(200)
                } else {
                  cb(500, { Error: 'Could not update the check' })
                }
              })
            } else {
              cb(403)
            }
          })
        } else {
          cb(400, { Error: 'CheckID did not exist' })
        }
      })
    } else {
      cb(400, { Error: 'Missing fields to update' })
    }

  } else {
    cb(400, {
      Error: 'Missing required checkID number'
    })
  }
}

/* ----------------------------- delete a check ----------------------------- */

handlers._checks.delete = (data, cb) => {
  let checkID
  helpers.isValidGUID(data.queryStringObject.id) &&
    (checkID = data.queryStringObject.id)
  if (checkID) {
    _storage.read('checks', checkID, (err, checkData) => {
      if (!err && checkData) {
        let tokenID
        helpers.checkString(data.headers.token) &&
          (tokenID = data.headers.token)
        handlers._tokens.verifyToken(tokenID, checkData.userPhone, (tokenIsValid) => {
          if (tokenIsValid) {
            _storage.delete('checks', checkID, (err) => {
              if (!err) {
                _storage.read('users', checkData.userPhone, (err, userData) => {
                  if (!err && userData) {
                    let checks = []
                    helpers.checkArray(userData.checks) &&
                      (checks = userData.checks)
                    if (checks.includes(checkID)) {
                      checks = checks.filter((c) => checkID !== c)
                      _storage.update('users', checkData.userPhone, { ...userData, checks }, (err) => {
                        if (!err) {
                          cb(200)
                        } else { cb(500, { Error: 'Could not update the specified user' }) }
                      })
                    } else { cb(500, { Error: 'Could not find the check on the user, so user checks update is canceled' }) }
                  } else { cb(500, { Error: 'Could not find the user who created the check, so user checks update is canceled' }) }
                })
              } else { cb(500, { Error: 'Could not delete the check data' }) }
            })
          } else { cb(403, { Error: 'Missing required token in the header, or token is invalid' }) }
        })
      } else { cb(400, { Error: 'The specified checkID did not exist' }) }
    })
  } else { cb(400, { Error: 'Missing required checkID' }) }
}

/* -------------------------------------------------------------------------- */
/*                                   tokens                                   */
/* -------------------------------------------------------------------------- */

handlers.tokens = (data, cb) => {
  Object.keys(handlers._tokens).includes(data.method) ?
    handlers._tokens[data.method](data, cb) :
    cb(405)
}
handlers._tokens = {}

/* ----------------------------- create a token ----------------------------- */

handlers._tokens.post = (data, cb) => {
  let phone, password
  helpers.isValidPhone((data.payload.phone || '').trim()) &&
    (phone = data.payload.phone.trim())
  helpers.isValidPassword((data.payload.password || '').trim()) &&
    (password = data.payload.password.trim())
  if (phone && password) {
    _storage.read('users', phone, (err, data) => {
      if (!err && data) {
        const hashedPassword = helpers.hash(password)
        if (hashedPassword == data.hashedPassword) {
          const tokenID = helpers.createGUID()
          const expires = helpers.createTokenExpiration()
          const tokenObject = {
            phone,
            tokenID,
            expires
          }
          _storage.create('tokens', tokenID, tokenObject, (err) => {
            if (!err) {
              cb(200, tokenObject)
            } else {
              cb(500, {
                Error: 'Could not create the new token'
              })
            }
          })
        } else {
          cb(400, {
            Error: 'Password did nod match the specified user’s password'
          })
        }
      } else {
        cb(400, {
          Error: 'Could not find the specified user'
        })
      }
    })
  } else {
    cb(400, {
      Error: 'Missing required fields'
    })
  }
}
/* ------------------------------ read a token ------------------------------ */

handlers._tokens.get = (data, cb) => {
  let tokenID
  helpers.isValidTokenID(data.queryStringObject.tokenID) &&
    (tokenID = data.queryStringObject.tokenID)
  if (tokenID) {
    _storage.read('tokens', tokenID, (err, data) => {
      if (!err && data) {
        cb(200, data)
      } else {
        cb(404)
      }
    })
  } else {
    cb(400, {
      Error: 'Missing required id'
    })
  }
}

/* ----------------------------- update a token ----------------------------- */

handlers._tokens.put = (data, cb) => {
  let tokenID, extend
  helpers.checkBoolean(data.payload.extend) &&
    (extend = data.payload.extend)
  helpers.isValidTokenID(data.payload.tokenID) &&
    (tokenID = data.payload.tokenID)
  if (tokenID && extend) {
    _storage.read('tokens', tokenID, (err, data) => {
      if (!err && data) {
        if (data.expires > Date.now()) {
          data.expires = helpers.createTokenExpiration()
          _storage.update('tokens', tokenID, data, (err) => {
            if (!err) {
              cb(200)
            } else {
              cb(500, {
                Error: 'Could not update the token’s expiration'
              })
            }
          })
        } else {
          cb(400, {
            Error: 'The token has already expires, and cannot be extend'
          })
        }
      } else {
        cb(400, {
          Error: 'Specified token does not exist'
        })
      }
    })
  } else {
    cb(400, {
      Error: 'Missing required field(s) or field(s) are invalid'
    })
  }
}

/* ----------------------------- delete a token ----------------------------- */

handlers._tokens.delete = (data, cb) => {
  let tokenID
  helpers.isValidTokenID(data.queryStringObject.tokenID) &&
    (tokenID = data.queryStringObject.tokenID)
  if (tokenID) {
    _storage.read('tokens', tokenID, (err, data) => {
      if (!err && data) {
        _storage.delete('tokens', tokenID, (err) => {
          if (!err) {
            cb(200)
          } else {
            cb(500, {
              Error: 'Could not delete the specified tokenID'
            })
          }
        })
      } else {
        cb(400, {
          Error: 'Could not find the specified tokenID'
        })
      }
    })
  } else {
    cb(400, {
      Error: 'Missing required tokenID'
    })
  }
}

/* ----------------------------- verify a token ----------------------------- */

handlers._tokens.verifyToken = (tokenID, phone, cb) => {
  _storage.read('tokens', tokenID, (err, data) => {
    if (!err && data) {
      if (data.phone == phone && data.expires > Date.now()) {
        cb(true)
      } else {
        cb()
      }
    } else {
      cb()
    }
  })
}

/* -------------------------------------------------------------------------- */
/*                                    users                                   */
/* -------------------------------------------------------------------------- */

handlers.users = (data, cb) => {
  Object.keys(handlers._users).includes(data.method) ?
    handlers._users[data.method](data, cb) :
    cb(405)
}
handlers._users = {}

/* ------------------------------ create a user ----------------------------- */

handlers._users.post = (data, cb) => {
  let firstName, lastName, phone, password, tosAgreement;
  helpers.checkBoolean(data.payload.tosAgreement) &&
    (tosAgreement = data.payload.tosAgreement)
  helpers.isValidName((data.payload.firstName || '').trim()) &&
    (firstName = data.payload.firstName.trim())
  helpers.isValidName((data.payload.lastName || '').trim()) &&
    (lastName = data.payload.lastName.trim())
  helpers.isValidPhone((data.payload.phone || '').trim()) &&
    (phone = data.payload.phone.trim())
  helpers.isValidPassword((data.payload.password || '').trim()) &&
    (password = data.payload.password.trim())
  // all fields are mandatory
  if ([
    firstName,
    lastName,
    phone,
    password,
    tosAgreement
  ].every(el => el)) {
    _storage.read('users', phone, (err, _data) => {
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
          _storage.create('users', phone, userObject, (err) => {
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
    let tokenID
    helpers.checkString(data.headers.token) &&
      (tokenID = data.headers.token)
    handlers._tokens.verifyToken(tokenID, phone, (tokenIsValid) => {
      if (tokenIsValid) {
        _storage.read('users', phone, (err, data) => {
          if (!err && data) {
            delete (data.hashedPassword)
            cb(200, data)
          } else {
            cb(404)
          }
        })
      } else {
        cb(403, { Error: 'Missing required token in the header, or token is invalid' })
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
    (phone = data.payload.phone.trim())
  helpers.isValidPassword((data.payload.password || '').trim()) &&
    (password = data.payload.password.trim())
  const fieldsToUpdate = [
    firstName,
    lastName,
    password
  ]
  if (phone) {
    let tokenID
    helpers.checkString(data.headers.token) &&
      (tokenID = data.headers.token)
    handlers._tokens.verifyToken(tokenID, phone, (tokenIsValid) => {
      if (tokenIsValid) {
        if (fieldsToUpdate.some(el => el)) {
          _storage.read('users', phone, (err, data) => {
            if (!err && data) {
              firstName && (data.firstName = firstName)
              lastName && (data.lastName = lastName)
              password && (data.hashedPassword = helpers.hash(password))
              _storage.update('users', phone, data, (err) => {
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
        cb(403, { Error: 'Missing required token in the header, or token is invalid' })
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
    let tokenID
    helpers.checkString(data.headers.token) &&
      (tokenID = data.headers.token)
    handlers._tokens.verifyToken(tokenID, phone, (tokenIsValid) => {
      if (tokenIsValid) {
        _storage.read('users', phone, (err, data) => {
          if (!err && data) {
            _storage.delete('users', phone, (err) => {
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
        cb(403, { Error: 'Missing required token in the header, or token is invalid' })
      }
    })

  } else {
    cb(400, {
      Error: 'Missing required phone number'
    })
  }
}

/* -------------------------------------------------------------------------- */
/*                              export the module                             */
/* -------------------------------------------------------------------------- */

module.exports = handlers
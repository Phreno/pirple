/**
 * @ Author: Phreno
 * @ Create Time: 2020-04-05 07:52:08
 * @ Modified by: Phreno
 * @ Modified time: 2020-04-07 08:30:39
 * @ Description: Launch the server
 */

/* --------------------------------- import --------------------------------- */

const http = require('http')
const https = require('https')
const url = require('url')
const StringDecoder = require('string_decoder').StringDecoder
const config = require('./lib/config')
const fs = require('fs')
const _data = require('./lib/data')
const handlers = require('./lib/handlers')
const helpers = require('./lib/helpers')

/* ----------------------- configuration http & https ----------------------- */

// create the http server
const httpServer = http.createServer((req, res) => {
  unifiedServer(req, res)
})
// start the server
httpServer.listen(config.httpPort, () => {
  console.log(`server is starting on port ${config.httpPort} (${config.envName})`)
})
// create the https server
const httpsServerOptions = {
  key: fs.readFileSync('./https/key.pem'),
  cert: fs.readFileSync('./https/cert.pem')
}
const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
  unifiedServer(req, res)
})
// start the https server
httpsServer.listen(config.httpsPort, () => {
  console.log(`server is starting on port ${config.httpsPort} (${config.envName})`)
})

/* -------------------------------------------------------------------------- */
/*                              define the router                             */
/* -------------------------------------------------------------------------- */

const router = {
  ping: handlers.ping,
  users: handlers.users,
  tokens: handlers.tokens,
  checks: handlers.checks
}

/* -------------------------------------------------------------------------- */
/*                      all the logic for http and https                      */
/* -------------------------------------------------------------------------- */

const unifiedServer = (req, res) => {
  // parse the url
  const parsedUrl = url.parse(req.url, true)
  // get the path
  const path = parsedUrl.pathname
  const trimmedPath = path.replace(/^\/+|\/+$/g, '')
  // get the HTTP method
  const method = req.method.toLowerCase()
  // get the headers
  const headers = req.headers
  // get the payload
  const decoder = new StringDecoder('utf-8')
  let buffer = ''
  req.on('data', (data) => {
    buffer += decoder.write(data)
  })
  req.on('end', () => {
    buffer += decoder.end()
    // choose the handler
    const chosenHandler = (
      typeof (router[trimmedPath]) && router[trimmedPath]
    ) || handlers.notFound
    // get the query string
    const queryStringObject = parsedUrl.query
    // construct the data
    const data = {
      trimmedPath,
      queryStringObject,
      method,
      headers,
      payload: helpers.parseJsonToObject(buffer)
    }
    // route the request to the handler
    chosenHandler(data, (statusCode, payload) => {
      typeof (statusCode) === 'number' || (statusCode = 200)
      typeof (payload) === 'object' || (payload = {})
      const payloadString = JSON.stringify(payload)
      // send the response
      res.setHeader('Content-Type', 'application/json')
      res.writeHead(statusCode)
      res.end(payloadString)
      // log the request
      console.log(method.toUpperCase(), `/${trimmedPath}`, 'returns', statusCode, payloadString)
    })
  })
}
const http = require('http')
const url = require('url')
const StringDecoder = require('string_decoder').StringDecoder

// the server respond
const server = http.createServer((req, res) => {
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
    const chosenHandler = typeof (router[trimmedPath]) && router[trimmedPath] || handlers.notFound
    // get the query string
    const queryStringObject = parsedUrl.query
    // construct the data
    const data = {
      trimmedPath,
      queryStringObject,
      method,
      headers,
      'payload': buffer
    }
    // route the request to the handler
    chosenHandler(data, (statusCode, payload) => {
      statusCode || (statusCode = 200)
      payload || (payload = {})
      const payloadString = JSON.stringify(payload)
      // send the response
      res.writeHead(statusCode)
      res.end(payloadString)
      // log the request
      console.log('returning ', statusCode, payloadString)
    })
  })
})
// start the server
server.listen(3000, () => {
  console.log("start")
})
// define the handlers
const handlers = {}
handlers.sample = (data, cb) => {
  cb(406, {
    'name': 'sample handler'
  })
}
handlers.notFound = (data, cb) => {
  cb(404)
}
// define the router
const router = {
  'sample': handlers.sample
}
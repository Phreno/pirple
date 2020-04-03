const http = require('http')
const url = require('url')

// the server respond
const server = http.createServer((req, res) => {
  // parse the url
  const parsedUrl = url.parse(req.url, true)
  // get the path
  const path = parsedUrl.pathname
  const trimmedPath = path.replace(/^\/+|\/+$/g, '')
  // get the HTTP method
  const method = req.method.toLowerCase()
  // get the query string
  const queryStringObject = parsedUrl.query
  // send the response
  res.end("hello\n")
  // log the request
  console.log([
    `Request received on path: ${trimmedPath}`,
    `with method: ${method}`,
    `and with these query string parameters ${JSON.stringify(queryStringObject)}`
  ])
})
// start the server
server.listen(3000, () => {
  console.log("start")
})
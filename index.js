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
  // get the headers
  const headers = req.headers
  // get the query string
  const queryStringObject = parsedUrl.query
  // send the response
  res.end("hello\n")
  // log the request
  console.log([
    `request received on path: ${trimmedPath}`,
    `method: ${method}`,
    `query string parameters ${JSON.stringify(queryStringObject)}`,
    `headers: ${JSON.stringify(headers, null, 2)}`
  ].join("\n"))
})
// start the server
server.listen(3000, () => {
  console.log("start")
})
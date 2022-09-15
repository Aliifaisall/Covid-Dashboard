const { server } = require('./service.js')
const port = 9123

server.listen(port, () => {
  //console.log(`Proxy server listening on http://localhost:${port}`)
})
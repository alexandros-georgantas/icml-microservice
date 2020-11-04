const htmlToICMLEndpoint = require('./api')

module.exports = {
  server: () => app => htmlToICMLEndpoint(app),
}

const express = require('express')
const path = require('path')
const app = express()
const fs = require('fs')

const DIST_DIR = path.join(__dirname, 'dist/spa')
const INDEX_FILE = path.join(__dirname, 'index.html')

const certPath = '/etc/ssl/batterysync'

let options
try {
  options = {
    key: fs.readFileSync(`${certPath}/privkey.pem`),
    cert: fs.readFileSync(`${certPath}/fullchain.pem`),
  }
  console.log('✅ SSL certificates loaded.')
} catch (err) {
  console.error('⚠️  SSL certificates not found, starting HTTP server instead.', err.message)
  options = null
}

let server
if (options) {
  const https = require('https')
  server = https.createServer(options, app)
} else {
  const http = require('http')
  server = http.createServer(app)
}

app.use(
  express.static(DIST_DIR, {
    extensions: ['html'],
    maxAge: 1000 * 60 * 60,
    setHeaders: customCacheControl,
  }),
)

function customCacheControl(res, file) {
  if (path.extname(file) === '.html') {
    res.setHeader('Cache-Control', 'public, max-age=0')
  }
}

const PORT = 443

app.get('/{*any}', (req, res) => {
  res.set('Cache-Control', 'no-store')
  res.sendFile(INDEX_FILE)
})

server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`)
})

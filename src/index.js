const express = require('express')

const app = express()

const PORT = '8888'

app.listen(PORT, async () => {
  console.log(`🚀 server is running`)
  require('./bot')
})

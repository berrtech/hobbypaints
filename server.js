const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

const mongoose = require('mongoose')
const { dbName, url } = require('./dbConfig')

const db = url + '/' + dbName

require('./routes')(app)

const connect = () => mongoose.connect(db)

const listen = () => {
  app.listen(port)
  console.log(`Listening on port ${port}`)
}

connect()
  .then(
    listen,
    console.log
  )
  .catch(console.log)

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 5000;

const mongoose = require('mongoose')
const { dbName, url } = require('./dbConfig')

const db = url + '/' + dbName

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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

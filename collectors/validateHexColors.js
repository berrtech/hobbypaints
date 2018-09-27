const mongoose = require('mongoose')
const { areDbPaintsValid } = require('../services/paints')

const validate = async () => {
  await areDbPaintsValid()
  return mongoose.disconnect()
}

validate()
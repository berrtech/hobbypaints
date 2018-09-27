const mongoose = require('mongoose')
const _ = require('lodash')
const { dbName, url } = require('../../dbConfig')
const paintTypes = require('./paintTypes')
const { isValidHexColor } = require('./utils')
const { Util } = require('node-vibrant')

const paintSchema = {
  _id: String,
  name: String,
  brand: String,
  range: String,
  hex: String,
  type: String,
  reference: String
}

const connect = async () => {
  await mongoose.connect(url + '/' + dbName)
  return mongoose
}

const Paint = mongoose.model('Paint', paintSchema, 'paints')

const findClosestPaint = (color, paints) => {
  const paintsWithDistances = paints.map(paint => {
    return ({
      paint,
      deltaE: paint.hex ? Math.round(Util.hexDiff(color, paint.hex) * 100) / 100 : 99999
    })
  })

  return _.sortBy(paintsWithDistances, 'deltaE')[0]
}

const findClosestPaintsFromBrands = (color, paints) => {
  const grouped = _.groupBy(paints, 'brand')
  return _.values(grouped).map(paints => findClosestPaint(color, paints))
}

const getAllPaints = () => Paint.find((err, paints) => paints)

const getPaintsOfType = type => Paint.find({ type }, (err, paints) => paints)

const getClosestPaints = async (hex, type = paintTypes.BASIC) => {
  const paints = await getPaintsOfType(type)
  const closestPaints = findClosestPaintsFromBrands(hex, paints)

  return closestPaints
}

const getBrandsCount = async () => {
  const paints = await getAllPaints()
  const grouped = _.groupBy(paints, 'brand');
  const count = _.values(grouped).length

  return count
}

const dropBrandPaints = async brand => {
  let result;
  try {
    console.log('Dropping paints from brand ' + brand);
    result = await Paint.deleteMany({ brand })
  } catch (e) {
    console.log(e)
    return Promise.reject(e)
  }
  return result
}

const typesToSkip = ['Texture']

const arePaintsValid = (paints) => {
  const invalidPaints = paints
    .filter(({ type }) => !typesToSkip.includes(type))
    .filter(({ hex }) => !isValidHexColor(hex))

  if (invalidPaints.length) {
    console.log('Invalid paints: ', invalidPaints);
  }

  return !invalidPaints.length
}

const areDbPaintsValid = async () => {
  const paints = await getAllPaints()
  return arePaintsValid(paints)
}

const addPaints = async paints => {
  let result

  try {
    console.log('Inserting ' + paints.length + ' paints')
    result = await Paint.insertMany(paints, { ordered: false })
  } catch (e) {
    console.log(e.writeErrors);
  }

  return result
}

const populateBrandPaints = async (brand, paints) => {
  if (!arePaintsValid(paints)) {
    throw new Error('Found paints with invalid hex colors')
  }

  console.log(process.argv)

  if (process.argv.includes('--force')) {
    await dropBrandPaints(brand)
  }

  return addPaints(paints)
}

module.exports = {
  connect,
  getAllPaints,
  getClosestPaints,
  getBrandsCount,
  populateBrandPaints,
  areDbPaintsValid
}
const path = require('path');
const express = require('express');
const _ = require('lodash')

const { getClosestPaints, getBrandsCount, searchPaints, getPaintById, getAllPaints, updatePaint, createPaint, deletePaint } = require('./services/paints')
const { isValidHexColor } = require('./services/paints/utils')
const authConfig = require('./authConfig')

const brandsOrder = [
  'Citadel',
  'Vallejo Game Color',
  'Vallejo Model Color',
  'P3 Formula'
]

const isAuthenticated = authheader => {
  // -----------------------------------------------------------------------
  // authentication middleware

  const auth = authConfig

  // parse login and password from headers
  const b64auth = (authheader || '').split(' ')[1] || ''
  const [login, password] = new Buffer(b64auth, 'base64').toString().split(':')

  // Verify login and password are set and correct
  if (!login || !password || login !== auth.login || password !== auth.password) {
    return false
  }

  return true
}

const validatePaint = (paint, withId) => {

  console.log(paint);

  if (!paint.name || !paint.brand || !paint.type) return false
  if (!isValidHexColor(paint.hex)) return false

  if (withId && !paint._id) return false

  return true
}

module.exports = app => {
  // API calls
  app.get('/api/closestPaints/:hex', async (req, res) => {
    let paints = await getClosestPaints(req.params.hex)

    paints = _.sortBy(paints, ({ paint }, i) => {
      return brandsOrder.indexOf(paint.brand)
    })

    res.send(paints)
  });

  app.get('/api/brands/count', async (req, res) => {
    const brandsCount = await getBrandsCount()
    res.send({ count: brandsCount })
  })

  app.get('/api/paints/search', async (req, res) => {
    const paints = await searchPaints(req.query.query)
    res.send(paints)
  })

  app.get('/api/paints', async (req, res) => {
    const paints = await getAllPaints()
    res.send(paints)
  })

  app.get('/api/paints/:id', async (req, res) => {
    const paint = await getPaintById(req.params.id)
    res.send(paint)
  })

  app.get('/api/admin/isauthenticated', async (req, res) => {
    const authenticated = await isAuthenticated(req.headers.authorization)

    if (!authenticated) {
      res.status(401)
      res.send(false)
      return
    }

    res.send(true)
  })

  app.post('/api/admin/paints', async (req, res) => {
    const authenticated = await isAuthenticated(req.headers.authorization)
    if (!authenticated) {
      res.status(401)
      res.send(false)
      return
    }
    const paint = req.body

    if (!validatePaint(paint, true)) {
      res.status(500)
      res.end()
      return
    }

    const createdPaint = await createPaint(paint)

    res.send(createdPaint)
  })


  app.post('/api/admin/paints/:id', async (req, res) => {
    const authenticated = await isAuthenticated(req.headers.authorization)
    if (!authenticated) {
      res.status(401)
      res.send(false)
      return
    }
    const id = req.params.id
    const paint = req.body

    if (!validatePaint(paint)) {
      res.status(500)
      res.end()
      return
    }

    const updatedPaint = await updatePaint(id, paint)

    res.send(updatedPaint)
  })

  app.delete('/api/admin/paints/:id', async (req, res) => {
    const authenticated = await isAuthenticated(req.headers.authorization)
    if (!authenticated) {
      res.status(401)
      res.send(false)
      return
    }
    const id = req.params.id

    await deletePaint(id)

    res.send(true)
  })


  if (process.env.NODE_ENV === 'production') {
    // Serve any static files
    app.use(express.static(path.join(__dirname, 'client/build')));
    // Handle React routing, return all requests to React app
    app.get('*', function (req, res) {
      res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    });
  }
}
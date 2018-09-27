const path = require('path');
const express = require('express');
const _ = require('lodash')

const { getClosestPaints, getBrandsCount } = require('./services/paints')

const brandsOrder = [
  'Citadel',
  'Vallejo Game Color',
  'Vallejo Model Color',
  'P3 Formula'
]

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

  if (process.env.NODE_ENV === 'production') {
    // Serve any static files
    app.use(express.static(path.join(__dirname, 'client/build')));
    // Handle React routing, return all requests to React app
    app.get('*', function (req, res) {
      res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    });
  }
}
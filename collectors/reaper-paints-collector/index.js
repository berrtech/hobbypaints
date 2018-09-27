/**
 * UNFINISHED
 */

const axios = require('axios')
const { populateBrandPaints, connect } = require('../../services/paints')
const cheerio = require('cheerio')
const _ = require('lodash')
const paintTypes = require('../../services/paints/paintTypes.js')

const reaperMasterPaintsUrl = 'https://www.reapermini.com/Paints/corecolors'

const brand = 'Reaper Master Series'

const fetchPageHtml = async url => {
  const res = await axios.request({
    url,
    method: 'get'
  })

  return res.data
}

const urlsObject = {
  'https://www.reapermini.com/OnlineStore/wash/sku-down/': {
    type: paintTypes.WASH
  },
  // 'https://www.reapermini.com/OnlineStore/ink/sku-down/': {
  //   type: paintTypes.WASH
  // },
  // 'https://www.reapermini.com/OnlineStore/metallic/sku-down/': {
  //   type: paintTypes.METALLIC
  // },
  // 'https://www.reapermini.com/OnlineStore/core%20colors/sku-down/': {
  // }
}

const paintPriceThreshold = 5

const priceRegex = /\(\$(.*?)\)/

const getPrice = str => str.match(priceRegex)[1]

const getPaintsFromPage = async url => {
  const html = await fetchPageHtml(url)
  const $ = cheerio.load(html)

  const body = $('body')

  const items = body.find('.listindent')
  const paintItems = items.filter((index, item) => {
    const text = $(item).text()
    const price = getPrice(text)
    return price < paintPriceThreshold
  })

  const paints = paintItems.map((index, paintItem) => {
    const text = $(paintItem).text()
    console.log(text);



    // const img = $(paintItem).find('img')
    // const alt = $(img).attr('alt')
    // const reference = alt.substring(0, 5)

    // const lastSemicolonIndex = _.lastIndexOf(alt, ':')
    // const name = alt.substring(lastSemicolonIndex + 2)

    // return {
    //   _id: reference,
    //   brand,
    //   name,
    //   // TODO
    //   hex: '#',
    //   //TODO
    //   type: paintTypes.BASIC,
    //   reference
    // }
  }).get()

  // return paints
}

const getTaggedPaints = async url => {
  let page = 1
  let finished = false

  while (!finished) {
    const pagePaints = await getPaintsFromPage(url + 'page' + page)
    finished = true
  }

}

const getPaints = async () => {
  const results = Object.keys(urlsObject).map(async url => {
    return getTaggedPaints(url)
  })

  const paints = await Promise.all(results)

  return _.flatten(paints)
}

const collect = async () => {
  const paints = await getPaints()

  console.log(paints);
}

connect()
  .then(async mongoose => {
    await collect()

    return mongoose.disconnect()
  })

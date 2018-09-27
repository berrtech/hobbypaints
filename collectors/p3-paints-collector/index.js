const Vibrant = require('node-vibrant')

const axios = require('axios');
const cheerio = require('cheerio')
const _ = require('lodash')
const { populateBrandPaints, connect } = require('../../services/paints')
const paintTypes = require('../../services/paints/paintTypes')

const host = 'http://privateerpress.com'
const getPageUrl = page => `${host}/views/ajax?js=1&page=${page}&view_name=paint_page_view&view_display_id=default&view_args=1376&view_path=node%2F1376&view_base_path=null&view_dom_id=1&pager_element=0`

const P3_BRAND_NAME = 'P3 Formula'

const washPaintNames = [
  // spaces are necessary for skipping 'Pink' etc
  ' Wash',
  ' Ink'
]

// map of hardcoded paints in case something goes horribly wrong
const hardcodedPaints = {
  // Thamar Black
  '93072': {
    hex: '040707'
  },
  // Morrow White
  '93073': {
    hex: 'FEFBFD'
  }
}

const replaceAll = (input, search, replace) => input.split(search).join(replace);

const replacements = {
  '\\x3c': '<',
  '\\x3e': '>',
  '\\x26': '&'
}

const decodeString = hexString => {
  let parsed = hexString
  Object.keys(replacements).forEach(search => {
    parsed = replaceAll(parsed, search, replacements[search])
  })
  return parsed
}

const fetchPageHtml = async page => {
  const res = await axios.request({
    url: getPageUrl(page),
    method: 'get'
  })

  const parsed = decodeString(res.data)
  return JSON.parse(parsed).display
}

const fetchPaintPageHtml = async paintPageUrl => {
  const res = await axios.request({
    url: `${host}${paintPageUrl}`,
    method: 'get'
  })

  return decodeString(res.data)
}

const getPaintFromPaintPage = async paintUrl => {
  let html
  try {
    html = await fetchPaintPageHtml(paintUrl)
  } catch (e) {
    throw new Error(e)
  }
  const $ = cheerio.load(html)

  const body = $('body')

  const pipCodeNode = body.find('.field-field-pip-code')
  const pipCode = $(pipCodeNode).text().replace('PIP Code:', '').trim();

  const image = body.find('.imagecache')
  const imageUrl = $(image).attr('src')

  const palette = await Vibrant.from(imageUrl).getPalette()
  const swatches = _.values(palette).filter(swatch => swatch)
  const sortedSwatches = _.orderBy(swatches, swatch => swatch.getPopulation(), 'desc')
  const primaryColor = _.first(sortedSwatches).getHex()

  // name 
  const name = $(body.find('div.h2-title')).text().trim()

  // type
  let type = paintTypes.BASIC

  const totalPopulation = sortedSwatches.reduce((population, swatch) => {
    return population + swatch.getPopulation()
  }, 0)

  const swatchesPopulationArray = sortedSwatches.map(swatch => swatch.getPopulation())

  const populationPercentageArray = swatchesPopulationArray.map(population => {
    return Math.round(population / totalPopulation * 100)
  })

  // metallic images consist of gradient with two major colors which are quiet different
  // if majority of image is filled with two colors, there is probably gradient
  if (
    populationPercentageArray.length > 1
    && populationPercentageArray[0] - populationPercentageArray[1] <= 25
  ) {
    const topTwoColorsDeltaE = Vibrant.Util.rgbDiff(sortedSwatches[0].getRgb(), sortedSwatches[1].getRgb())
    // if these two colors are not too different, there is most likely no gradient
    if (topTwoColorsDeltaE > 7) {
      type = paintTypes.METALLIC
    }
  }

  // wash can have gradient image too, so instead it should be detected by name
  if (_.some(washPaintNames, washPaintName => name.includes(washPaintName))) {
    type = paintTypes.WASH
  }

  return {
    _id: pipCode,
    brand: P3_BRAND_NAME,
    name,
    hex: primaryColor.replace('#', ''),
    type,
    reference: pipCode
  }
}

const getPaintsFromPage = async page => {
  let html;
  try {
    html = await fetchPageHtml(page)
  } catch (e) {
    throw new Error(e)
  }

  const $ = cheerio.load(html)

  const body = $('div')
  let links = body.find('.views-field-title .field-content a')

  if (links.length !== 12) {
    throw new Error('Links count is not 12, something is wrong, aborting')
  }

  // filter out paint sets
  links = links.filter((i, link) => !$(link).text().includes('Colors'))

  const paints = await Promise.all(links.map(async (i, link) => {
    const paint = await getPaintFromPaintPage($(link).attr('href'))

    return paint
  }).get())

  return paints
}

const getPaints = async () => {
  let lastHtml
  let shouldStop
  let currentPage = 0
  let paints = []

  do {
    console.log('parsing page', currentPage);

    let html

    try {
      html = await fetchPageHtml(currentPage)
    } catch (e) {
      throw new Error(e)
    }

    if (html == lastHtml) {
      shouldStop = true
      return paints
    }

    paints = paints.concat(await getPaintsFromPage(currentPage))

    lastHtml = html
    currentPage++
  } while (!shouldStop)
}

const collect = async () => {
  let paints = await getPaints()
  paints = paints.map(paint => ({
    ...paint,
    ...hardcodedPaints[paint._id]
  }))

  return populateBrandPaints(P3_BRAND_NAME, paints)
}

connect()
  .then(async mongoose => {
    await collect()

    return mongoose.disconnect()
  })

const axios = require('axios');
const cheerio = require('cheerio')
const { populateBrandPaints, connect } = require('../../services/paints')
const paintTypes = require('../../services/paints/paintTypes')

const paintsWikiUrl = 'https://en.wikipedia.org/wiki/List_of_Citadel_paints'

const CitadelPaintTypesMap = {
  'base': paintTypes.BASIC,
  'layer': paintTypes.BASIC,
  'edge': paintTypes.BASIC,
  'shade': paintTypes.WASH,
  'dry': paintTypes.DRY,
  'glaze': paintTypes.GLAZE,
  'texture': paintTypes.TEXTURE,
  'technical': paintTypes.TECHNICAL,
}

const paintBrand = 'Citadel'

const collect = async () => {
  const res = await axios
    .request({
      url: paintsWikiUrl,
      method: 'get'
    })

  const $ = cheerio.load(res.data)
  const body = $('body')

  let paintRows = body.find('.wikitable tbody>tr')

  paintRows = $(paintRows).filter((i, e) => i !== 0)

  const paints = paintRows.map((index, paintRow) => {
    const arr = $(paintRow).find('td').map((index, td) => {
      return $(td).text().replace('\n', '')
    }).get()

    const range = arr[1].trim().toLowerCase()
    let type = CitadelPaintTypesMap[range]
    let name = arr[0]
    const hex = arr[2].replace('#', '')

    if (name.includes('Metal')) {
      name = name.replace('(Metal)', '').trim()
      type = paintTypes.METALLIC
    }

    return {
      _id: name + '_' + type,
      brand: paintBrand,
      name,
      range,
      hex,
      type
    }
  }).get()

  return populateBrandPaints(paintBrand, paints);
}

connect()
  .then(async mongoose => {
    await collect()

    return mongoose.disconnect()
  })

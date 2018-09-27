const axios = require('axios');
const cheerio = require('cheerio')
const _ = require('lodash')
const { populateBrandPaints, connect } = require('../../services/paints')
const paintTypes = require('../../services/paints/paintTypes')

// all vallejo technical paints use this hex
const technicalHex = 'ffffff'

// technical paints usually contain these words
const technicalPaintNames = ['Varnish', 'Medium', 'Thinner']

// glaze
const glazePaintNames = ['Glaze']

// wash
const washPaintNames = [' Wash', ' Ink']

// fluorescent paints
const fluorescentPaintNames = ['Fluo']

// useless paint names
const paintNamesToSkip = ['Primer']

// vallejo website errors, etc
const paintReferencesToSkip = [
  '72.410', // http://www.acrylicosvallejo.com/en_US/extra-opaque/family/18/82 - wrong reference code,
  '70.919' // Foundation White, useless
]

// hardcoded paint types for concrete paints
const paintReferenceToTypeMap = {
  '72.091': paintTypes.WASH, // Sepia
  // these metallics taken from http://cdn.acrylicosvallejo.com/2d567ed91fb58cdc74108685395ac19a/CC070-Rev14.pdf
  // '70.950': paintTypes.METALLIC, // Black, officially, is metallic, according to vallejo document, but that's confusing
  '70.861': paintTypes.METALLIC,
  '70.997': paintTypes.METALLIC,
  '70.996': paintTypes.METALLIC,
  '70.878': paintTypes.METALLIC,
  '70.801': paintTypes.METALLIC,
  '70.998': paintTypes.METALLIC,
  '70.999': paintTypes.METALLIC,
  '70.865': paintTypes.METALLIC,
  '70.864': paintTypes.METALLIC,
  '70.863': paintTypes.METALLIC,
  '70.800': paintTypes.METALLIC,
}

const VALLEJO_GAME_COLOR = 'Vallejo Game Color'
const VALLEJO_MODEL_COLOR = 'Vallejo Model Color'

const gameColorUrls = [
  'http://www.acrylicosvallejo.com/en_US/skintones/family/18/72',
  'http://www.acrylicosvallejo.com/en_US/elves/family/18/74',
  'http://www.acrylicosvallejo.com/en_US/extra-opaque/family/18/77',
  'http://www.acrylicosvallejo.com/en_US/specialist/family/18/78',
  'http://www.acrylicosvallejo.com/en_US/advanced/family/18/79',
  'http://www.acrylicosvallejo.com/en_US/leather-_-metal/family/18/81',
  'http://www.acrylicosvallejo.com/en_US/extra-opaque/family/18/82',
  'http://www.acrylicosvallejo.com/en_US/72-colors-_-3-brushes/family/18/87',
  'http://www.acrylicosvallejo.com/en_US/ironsfist-dwarf-berserker-(8-colors)/family/18/83',
  'http://www.acrylicosvallejo.com/en_US/intro-8-colors_-2-brushes-_-figure/family/18/84',
  'http://www.acrylicosvallejo.com/en_US/non-metallic-metal---8-game-color_-instructions-_-color-chart/family/18/137',
  'http://www.acrylicosvallejo.com/en_US/special-effects-set---8-game-effects-with-painting-guide-by-angel-giraldez./family/18/154',
  'http://www.acrylicosvallejo.com/en_US/non-death-chaos-_by-angel-giraldez_-(8-game-color)/family/18/157',
  'http://www.acrylicosvallejo.com/en_US/orcs-and-goblins/family/18/75',
  'http://www.acrylicosvallejo.com/en_US/introduction/family/18/80',
]

const gameColorUrlsObject = {
  'http://www.acrylicosvallejo.com/en_US/game-inks/family/18/73': {
    brand: VALLEJO_GAME_COLOR,
    type: paintTypes.WASH
  },
  'http://www.acrylicosvallejo.com/en_US/game-colos-washes/family/18/114': {
    brand: VALLEJO_GAME_COLOR,
    type: paintTypes.WASH
  },
  'http://www.acrylicosvallejo.com/en_US/metallic-colors/family/18/136': {
    brand: VALLEJO_GAME_COLOR,
    type: paintTypes.METALLIC
  },
  ...gameColorUrls.reduce((acc, val) => {
    acc[val] = {
      brand: VALLEJO_GAME_COLOR
    }
    return acc
  }, {})
}

const modelColorUrls = [
  'http://www.acrylicosvallejo.com/en_US/wargames-basics/family/15/8',
  'http://www.acrylicosvallejo.com/en_US/elfos/family/15/9',
  'http://www.acrylicosvallejo.com/en_US/orcos-y-goblins/family/15/10',
  'http://www.acrylicosvallejo.com/en_US/non-death-chaos/family/15/11',
  'http://www.acrylicosvallejo.com/en_US/panzer-colors/family/15/12',
  'http://www.acrylicosvallejo.com/en_US/skintones-colors/family/15/13',
  'http://www.acrylicosvallejo.com/en_US/demag-africa-corps/family/15/111',
  'http://www.acrylicosvallejo.com/en_US/demag-rusia-1942/family/15/112',

  'http://www.acrylicosvallejo.com/en_US/folkstone-basics/family/15/14',
  'http://www.acrylicosvallejo.com/en_US/folkstone-specialist/family/15/15',
  'http://www.acrylicosvallejo.com/en_US/wwii-german/family/15/16',
  'http://www.acrylicosvallejo.com/en_US/wwii-allied/family/15/17',
  'http://www.acrylicosvallejo.com/en_US/napoleonic-colors/family/15/18',
  'http://www.acrylicosvallejo.com/en_US/american-civil-war/family/15/19',
  'http://www.acrylicosvallejo.com/en_US/wargame-special/family/15/20',
  'http://www.acrylicosvallejo.com/en_US/american-colonial/family/15/21',
  'http://www.acrylicosvallejo.com/en_US/american-revolution/family/15/22',
  'http://www.acrylicosvallejo.com/en_US/wwii-german-camouflage/family/15/23',
  'http://www.acrylicosvallejo.com/en_US/skintones-colors/family/15/24',
  'http://www.acrylicosvallejo.com/en_US/basic-colors-u.s.a./family/15/25',
  'http://www.acrylicosvallejo.com/en_US/earth-colors/family/15/26',
  'http://www.acrylicosvallejo.com/en_US/medieval-colors/family/15/27',
  'http://www.acrylicosvallejo.com/en_US/equestrian-colors/family/15/28',
  'http://www.acrylicosvallejo.com/en_US/native-americans/family/15/29',
  'http://www.acrylicosvallejo.com/en_US/naval-(steam-era)/family/15/30',
  'http://www.acrylicosvallejo.com/en_US/imperial-roman/family/15/128',

  'http://www.acrylicosvallejo.com/en_US/us-infantry-paint-set/family/15/141',
  'http://www.acrylicosvallejo.com/en_US/german-ss-paint-set/family/15/144',
  'http://www.acrylicosvallejo.com/en_US/british-paint-set/family/15/145',
  'http://www.acrylicosvallejo.com/en_US/german-infantry-paint-set/family/15/146',
  'http://www.acrylicosvallejo.com/en_US/german-armour-paint-set/family/15/147',
  'http://www.acrylicosvallejo.com/en_US/infantry-basic-paint-set/family/15/148',
  'http://www.acrylicosvallejo.com/en_US/vehicle-basic-paint-set/family/15/149',

  'http://www.acrylicosvallejo.com/en_US/waffen-camouflage-set/family/15/150',
  'http://www.acrylicosvallejo.com/en_US/german-field-grey/family/15/151',
  'http://www.acrylicosvallejo.com/en_US/face-painting-set/family/15/31',
  'http://www.acrylicosvallejo.com/en_US/introduction-8-colors-_-2-brushes-_-figure/family/15/32',
  'http://www.acrylicosvallejo.com/en_US/winter-weathering-set/family/15/33',
  'http://www.acrylicosvallejo.com/en_US/weathering-a-steam-locomotive/family/15/34',
  'http://www.acrylicosvallejo.com/en_US/rust-and-steel-effects/family/15/126',
  'http://www.acrylicosvallejo.com/en_US/black-_-white/family/15/127',
  'http://www.acrylicosvallejo.com/en_US/wood-_-leather/family/15/152',
  'http://www.acrylicosvallejo.com/en_US/rust_-stain-_-streaking/family/15/153',

  'http://www.acrylicosvallejo.com/en_US/72-basic-hobby-colors-_-brushes/family/15/35',
  'http://www.acrylicosvallejo.com/en_US/74-military-colors-_-brushes/family/15/36',
  'http://www.acrylicosvallejo.com/en_US/72-basic-color-combinations-_-brushes/family/15/106',

]

const modelColorUrlsObject = {
  'http://www.acrylicosvallejo.com/en_US/metallic-colors/family/15/104': {
    brand: VALLEJO_MODEL_COLOR,
    type: paintTypes.METALLIC
  },
  'http://www.acrylicosvallejo.com/en_US/transparent-colors/family/15/105': {
    brand: VALLEJO_MODEL_COLOR,
    type: paintTypes.TRANSPARENT
  },
  'http://www.acrylicosvallejo.com/en_US/gold_-silver-_-copper/family/15/122': {
    brand: VALLEJO_MODEL_COLOR,
    type: paintTypes.METALLIC,
  },
  ...modelColorUrls.reduce((acc, val) => {
    acc[val] = {
      brand: VALLEJO_MODEL_COLOR
    }
    return acc
  }, {})
}

const shouldNotSkipPaint = ({ reference, name }) => {
  const isHardSkip = paintReferencesToSkip.includes(reference);
  const paintNameSkip = _.some(paintNamesToSkip, paintNameToSkip => name.includes(paintNamesToSkip))
  return !isHardSkip && !paintNameSkip
}

const getPaintsFromPage = async (url) => {
  const { brand, type: proposedType } = gameColorUrlsObject[url] || modelColorUrlsObject[url]

  const res = await axios
    .request({
      url: url,
      method: 'get'
    })

  const $ = cheerio.load(res.data)
  const body = $('body')

  let paintRows = body.find('#estuche_right tbody>tr')

  const paints = paintRows.map((index, paintRow) => {

    const arr = $(paintRow).find('td').map((index, td) => {
      return $(td).text().replace('\n', '').trim()
    }).get()

    // paint name
    const name = arr[2]

    // paint hex
    let hex;

    try {
      hex = $(paintRow).find('td div').css('background-color').replace('#', '')
    } catch (e) {
      hex = arr[0]
    }

    //paint reference
    const reference = arr[1]

    // paint type
    let type = paintTypes.BASIC

    if (
      _.some(technicalPaintNames, technicalPaintName => name.includes(technicalPaintName))
      && hex.toLowerCase() === technicalHex
    ) {
      type = paintTypes.TECHNICAL
    }

    if (_.some(glazePaintNames, glazePaintName => name.includes(glazePaintName))) {
      type = paintTypes.GLAZE
    }

    if (_.some(washPaintNames, washPaintName => name.includes(washPaintName))) {
      type = paintTypes.WASH
    }

    if (_.some(fluorescentPaintNames, fluorescentPaintName => name.includes(fluorescentPaintName))) {
      type = paintTypes.FLUORESCENT
    }

    type = paintReferenceToTypeMap[reference] || proposedType || type

    return {
      _id: reference,
      brand,
      name,
      hex,
      type,
      reference
    }
  }).get()

  return paints.filter(shouldNotSkipPaint)
}

const getPaintObjects = async (urlsObject) => {
  const results = Object.keys(urlsObject).map(async (url) => {
    return getPaintsFromPage(url);
  })

  const paints = await Promise.all(results)

  return _.flatten(paints)
}

// not Model Color or Game Color
const trainColorsLineReference = '73'

const collect = async () => {
  let gameColorPaints = await getPaintObjects(gameColorUrlsObject)
  gameColorPaints = _.uniqBy(gameColorPaints, paint => paint._id);

  gameColorPaints = gameColorPaints.filter(({ _id }) => !_.startsWith(_id, trainColorsLineReference + '.'))

  await populateBrandPaints(VALLEJO_GAME_COLOR, gameColorPaints)

  let modelColorPaints = await getPaintObjects(modelColorUrlsObject)
  modelColorPaints = _.uniqBy(modelColorPaints, paint => paint._id);

  modelColorPaints = modelColorPaints.filter(({ _id }) => !_.startsWith(_id, trainColorsLineReference + '.'))

  const gameColorIdsArray = gameColorPaints.map(paint => paint._id)
  const modelColorIdsArray = modelColorPaints.map(paint => paint._id)

  const intersection = _.intersection(gameColorIdsArray, modelColorIdsArray)

  modelColorPaints = modelColorPaints.filter(({ _id }) => !intersection.includes(_id))

  return populateBrandPaints(VALLEJO_MODEL_COLOR, modelColorPaints)
}

connect()
  .then(async mongoose => {
    await collect()

    return mongoose.disconnect()
  })



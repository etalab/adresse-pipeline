const {createReadStream} = require('fs')
const {Transform} = require('stream')
const {pathExists} = require('fs-extra')
const {createGunzip} = require('gunzip-stream')
const pumpify = require('pumpify')
const {parse} = require('geojson-stream')
const getStream = require('get-stream')

function prepareData(feature, enc, next) {
  const props = feature.properties

  const adresse = {
    source: 'ftth',
    idAdresse: props.id,
    numero: props.numero,
    suffixe: props.suffixe,
    nomVoie: props.nomVoie,
    codeCommune: props.codeCommune,
    nomCommune: props.nomCommune,
    codePostal: props.codePostal || undefined,
    position: feature.geometry,
    licence: 'lov2'
  }

  next(null, adresse)
}

async function importData(path) {
  if (!(await pathExists(path))) {
    return []
  }

  const adresses = await getStream.array(pumpify.obj(
    createReadStream(path),
    createGunzip(),
    parse(),
    new Transform({objectMode: true, transform: prepareData})
  ))
  return adresses
}

module.exports = importData

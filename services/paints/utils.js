const isValidHexColor = hex => /^#[0-9A-F]{6}$/i.test('#' + hex)

module.exports = {
  isValidHexColor
}
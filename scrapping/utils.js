import fetch from 'node-fetch'

/**
 * @param {string} url
 *   URL's image to transform.
 *
 * @return {string}
 *   Base64 of image.
 */
export const getAvatarBase64 = async (url) => {
  const blob = await fetch(url)
    .then(response => response.blob())
    .catch(error => console.log(error))
  const symbols = Object.getOwnPropertySymbols(blob)

  return `data:image/png;base64,${blob[symbols[1]].toString('base64')}`
}

/**
 * @param {Object} element
 *   The <tr> node.
 * @param {number} nth
 *   The nth child.
 *
 * @return {string}
 *   The text.
 */
export const getText = (element, nth) => element.find(`td:nth-child(${nth})`).text().trim()

/**
 * @param {Object} firstRow
 *   The first row.
 * @param {Object} secondRow
 *   The second row.
 * @param {Object} thirdRow
 *   The third row.
 * @param {number} nth
 *   Column id.
 * @param {string} type
 *   Familiar's type: familiar or fusion.
 *
 * @return {object}
 *   The skill.
 */
export const setSkill = (firstRow, secondRow, thirdRow, nth, type = 'familiar') => {
  if (firstRow.find(`td:nth-child(${nth})`).text().trim() !== '') {
    return {
      name: getText(firstRow, nth).replace(/( \([0-4]SP\))/, ''),
      skillPoint: getText(firstRow, nth).match(/([0-4])/)[0],
      action: getText(secondRow, nth - (type === 'familiar' ? 2 : 1)),
      pourcentage: getText(thirdRow, nth - 1),
    }
  }
}

/**
 * @param {Array} columns
 *   Columns array.
 * @param {Object} firstRow
 *   The first row.
 * @param {Object} secondRow
 *   The second row.
 * @param {Object} thirdRow
 *   The third row.
 * @param {string} type
 *   Familiar's type: familiar or fusion.
 *
 * @return {array}
 *   Array with all skills.
 */
export const setSkills = (columns, firstRow, secondRow, thirdRow, type = 'familiar') =>
  columns.reduce((accumulator, nth) => {
    const skill = setSkill(firstRow, secondRow, thirdRow, nth, type)
    if (skill) {
      accumulator.push(skill)
    }
    return accumulator
  }, [])

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

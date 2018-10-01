import cheerio from 'cheerio'
import fs from 'fs'
import fetch from 'node-fetch'

export const equipmentUpgrades = {
  Common: {
    1: [11],
    2: [13],
    3: [19],
    4: [27],
    5: [35],
    6: [48],
    7: [64],
    8: [85],
  },
  Rare: {
    1: [16, 20],
    2: [21, 27],
    3: [39, 37],
    4: [40, 50],
    5: [53, 67],
    6: [72, 90],
    7: [96, 120],
    8: [128, 160],
  },
  Epic: {
    1: [21, 27, 32],
    2: [29, 37, 44],
    3: [40, 50, 60],
    4: [53, 67, 80],
    5: [72, 90, 108],
    6: [96, 120, 144],
    7: [128, 160, 192],
    8: [171, 213, 256],
  },
  Legendary: {
    4: [67, 83, 100, 117],
    5: [91, 113, 136, 159],
    6: [120, 150, 180, 210],
    7: [160, 200, 240, 280],
    8: [213, 267, 320, 373],
  },
  Set: {
    5: [91, 113, 136, 159],
    6: [120, 150, 180, 210],
    7: [160, 200, 240, 280],
    8: [213, 267, 320, 373],
  },
  Mythic: {
    7: [160, 200, 240, 280],
    8: [213, 267, 320, 373],
  },
  Ancient: {
    8: [213, 267, 320, 373],
  },
}

/**
 * @param {string} url
 *   URL's image to transform.
 *
 * @return {string}
 *   Base64 of image.
 */
export const getAvatarBase64 = async (url) => {
  const response = await fetch(url)

  try {
    const blob = await response.blob()
    const symbols = Object.getOwnPropertySymbols(blob)

    return `data:image/png;base64,${blob[symbols[1]].toString('base64')}`
  }
  catch (error) {
    console.error(error)
  }
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

/**
 * @param {Object} row
 *   The row.
 *
 * @return {string}
 *   The item's type with uppercase's first letter.
 */
export const getType = (row) => {
  const classType = row.attr('class')
  return classType.charAt(0).toUpperCase() + classType.slice(1)
}

/**
 * @param {string} zone
 *   Equipement's zone.
 *
 * @return {number}
 *   Tier's number.
 */
export const setEquipmentTier = (zone) => {
  if (zone === "Trials reward - 'Magi'") {
    return 4
  }

  if (zone === 'Starter') {
    return 1
  }
  if (zone[0] === 'R') {
    return Number(zone[1]) + 3
  }

  if (zone[0] === 'Z' || zone[0] === 'T') {
    return Number(zone[1])
  }

  if (zone === 'Booster Pack') {
    return 2
  }
}

/**
 * @param {Object} firstRow
 *   The first row.
 * @param {Object} secondRow
 *   The second row.
 * @param {string} equipmentType
 *   The equipment's type.
 *
 * @return {Object}
 *   The equipment.
 */
export const setEquipment = async (firstRow, secondRow, equipmentType = null) => {
  const avatar = await getAvatarBase64(firstRow.find('span img').attr('data-src'))
  const type = getType(firstRow.find('td'))
  const zone = getText(secondRow, 1)
  const power = getText(firstRow, equipmentType === 'mainhands' ? 4 : 3)
  const stamina = getText(firstRow, equipmentType === 'mainhands' ? 5 : 4)
  const agility = getText(firstRow, equipmentType === 'mainhands' ? 6 : 5)
  const upgrade = /\(.*\)/
  const tier = setEquipmentTier(zone)
  const data = {
    type,
    avatar,
    name: getText(firstRow, 2).replace('*', ''),
    zone,
    power,
    stamina,
    agility,
    baseStats: Number(power.replace(upgrade, '')) + Number(stamina.replace(upgrade, '')) + Number(agility.replace(upgrade, '')),
    upgrade: equipmentUpgrades[type][tier],
    tier,
  }

  if (equipmentType === 'mainhands') {
    data.weaponType = getText(firstRow, 3)
  }

  return data
}

/**
 * @param {Object} html
 *   HTML page.
 * @param {string} equipmentType
 *  The equipment's type.
 */
export const equipmentScrapping = async (html, equipmentType) => {
  const $ = cheerio.load(html)
  $('noscript').remove()
  const equipment = []
  const excludeUselessTr = (index, element) => ($(element).children('.common, .rare, .epic, .legendary, .ancient').length ? null : $(element))
  const tr = $('article tr').not(excludeUselessTr)

  for (let index = 0; index < tr.length; index += 2) {
    equipment.push(setEquipment($(tr[index]), $(tr[index + 1]), equipmentType))
  }

  fs.promises.writeFile(`data/${equipmentType}.json`, JSON.stringify(await Promise.all(equipment)), 'utf8')
}

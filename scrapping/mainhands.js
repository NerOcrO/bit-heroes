import cheerio from 'cheerio'
import fs from 'fs'
import * as utils from './utils'

const updates = {
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

const setTier = (zone) => {
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

const setMainhand = async (firstRow, secondRow) => {
  const avatar = await utils.getAvatarBase64(firstRow.find('span img').attr('data-src'))
  const type = utils.getType(firstRow.find('td'))
  const zone = utils.getText(secondRow, 1)
  const power = utils.getText(firstRow, 4)
  const stamina = utils.getText(firstRow, 5)
  const agility = utils.getText(firstRow, 6)
  const update = /\(.*\)/
  const tier = setTier(zone)

  return {
    type,
    avatar,
    name: utils.getText(firstRow, 2).replace('*', ''),
    zone,
    power,
    stamina,
    agility,
    baseStats: Number(power.replace(update, '')) + Number(stamina.replace(update, '')) + Number(agility.replace(update, '')),
    update: updates[type][tier],
    weaponType: utils.getText(firstRow, 3),
    tier,
  }
}

export const urlWiki = 'http://bit-heroes.wikia.com/wiki/Mainhands'

export const scrapping = async (html) => {
  const $ = cheerio.load(html)
  $('noscript').remove()
  const mainhands = []
  const excludeUselessTr = (index, element) => ($(element).children('.common, .rare, .epic, .legendary, .ancient').length ? null : $(element))
  const tr = $('article tr').not(excludeUselessTr)

  for (let index = 0; index < tr.length; index += 2) {
    mainhands.push(setMainhand($(tr[index]), $(tr[index + 1])))
  }

  fs.promises.writeFile('data/mainhands.json', JSON.stringify(await Promise.all(mainhands)), 'utf8')
}

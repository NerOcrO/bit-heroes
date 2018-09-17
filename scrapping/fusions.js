import cheerio from 'cheerio'
import fs from 'fs'
import * as utils from './utils'

const setPassiveAbility = (rowAbilities) => {
  const abilities = rowAbilities.split(',')

  return abilities.map((ability) => {
    const split = ability.trim().match(/^([0-9.]*%) ([\w .%-]*)/)

    return {
      pourcentage: split[1],
      ability: split[2],
    }
  })
}

const createFusion = (familiar) => {
  const split = familiar.trim().match(/^([0-9]*) ([\w. ]*)/)
  let name = familiar.trim()
  let count = 1

  if (split !== null) {
    name = split[2].trim()
    count = split[1]
  }

  return { name, count }
}

const setFamiliar = async (firstRow, secondRow, thirdRow) => {
  const avatar = await utils.getAvatarBase64(firstRow.find('span img').attr('data-src'))

  return {
    type: utils.getType(firstRow.find('td')),
    avatar,
    name: utils.getText(firstRow, 2),
    fusion: utils.getText(thirdRow, 1).split('+').map(createFusion),
    passiveAbility: setPassiveAbility(utils.getText(secondRow, 1)),
    power: utils.getText(firstRow, 4).slice(0, -1),
    stamina: utils.getText(secondRow, 3).slice(0, -1),
    agility: utils.getText(thirdRow, 3).slice(0, -1),
    attack: utils.setSkill(firstRow, secondRow, thirdRow, 5, 'fusion'),
    skills: utils.setSkills([6, 7, 8, 9, 10], firstRow, secondRow, thirdRow, 'fusion'),
  }
}

export const urlWiki = 'http://bit-heroes.wikia.com/wiki/Fusion'

export const scrapping = async (html) => {
  const $ = cheerio.load(html)
  const familiars = []
  const excludeUselessTr = (index, element) => (index < 3 || index > 488 || $(element).children().length === 1 ? $(element) : null)
  const tr = $('article tr').not(excludeUselessTr)

  for (let index = 0; index < tr.length; index += 3) {
    familiars.push(setFamiliar($(tr[index]), $(tr[index + 1]), $(tr[index + 2])))
  }

  fs.promises.writeFile('data/fusions.json', JSON.stringify(await Promise.all(familiars)), 'utf8')
}

import cheerio from 'cheerio'
import fs from 'fs'
import * as utils from './utils'

const setFamiliar = async (firstRow, secondRow, thirdRow) => {
  const avatar = await utils.getAvatarBase64(firstRow.find('span img').attr('data-src'))

  return {
    type: utils.getType(firstRow.find('td')),
    avatar,
    name: utils.getText(firstRow, 2).replace(' ∴', ''),
    zone: utils.getText(thirdRow, 1),
    power: utils.getText(firstRow, 4).slice(0, -1),
    stamina: utils.getText(secondRow, 2).slice(0, -1),
    agility: utils.getText(thirdRow, 3).slice(0, -1),
    attack: utils.setSkill(firstRow, secondRow, thirdRow, 5),
    skills: utils.setSkills([6, 7, 8, 9, 10], firstRow, secondRow, thirdRow),
  }
}

export const urlWiki = 'http://bit-heroes.wikia.com/wiki/Familiar'

export const scrapping = async (html) => {
  const $ = cheerio.load(html)
  const familiars = []
  const uselessTr = (index, element) => (index < 6 || $(element).children().length === 1 ? $(element) : null)
  const tr = $('article tr').not(uselessTr)

  for (let index = 0; index < tr.length; index += 3) {
    familiars.push(setFamiliar($(tr[index]), $(tr[index + 1]), $(tr[index + 2])))
  }

  fs.promises.writeFile('data/familiars.json', JSON.stringify(await Promise.all(familiars)), 'utf8')
}

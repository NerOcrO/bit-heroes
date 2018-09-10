import cheerio from 'cheerio'
import fs from 'fs'
import * as utils from './utils'

export const urlWiki = 'http://bit-heroes.wikia.com/wiki/Familiar'

export const scrapping = async (html) => {
  const $ = cheerio.load(html)
  const familiars = []
  $('table tr.epic').remove()
  $('table tr.legendary').remove()

  const setFamiliars = (tr) => {
    const setFamiliar = async (index) => {
      const firstRow = $(tr[index])
      const secondRow = $(tr[index + 1])
      const thirdRow = $(tr[index + 2])
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
        skills: utils.setSkills([6, 7, 8, 9], firstRow, secondRow, thirdRow),
      }
    }

    for (let index = 1; index < tr.length; index += 3) {
      familiars.push(setFamiliar(index))
    }
  }

  for (let index = 3; index < $('article table').length; index++) {
    setFamiliars($(`article table:nth-of-type(${index}) tr`))
  }

  fs.promises.writeFile('data/familiars.json', JSON.stringify(await Promise.all(familiars)), 'utf8')
}

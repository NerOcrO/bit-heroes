import cheerio from 'cheerio'
import fs from 'fs'
import { getAvatarBase64, getText, setSkill, setSkills } from './utils'

export const urlWiki = 'http://bit-heroes.wikia.com/wiki/Familiar'

export const scrapping = async (html) => {
  const $ = cheerio.load(html)
  const familiars = []
  $('table tr.epic').remove()
  $('table tr.legendary').remove()

  const setFamiliar = async (tr, index) => {
    const firstRow = $(tr[index])
    const secondRow = $(tr[index + 1])
    const thirdRow = $(tr[index + 2])
    const classType = firstRow.find('td').attr('class')
    const type = classType.charAt(0).toUpperCase() + classType.slice(1)
    const avatar = await getAvatarBase64(firstRow.find('span img').attr('data-src'))

    return {
      type,
      avatar,
      name: getText(firstRow, 2),
      zone: getText(thirdRow, 1),
      power: getText(firstRow, 4).slice(0, -1),
      stamina: getText(secondRow, 2).slice(0, -1),
      agility: getText(thirdRow, 3).slice(0, -1),
      attack: setSkill(firstRow, secondRow, thirdRow, 5),
      skills: setSkills([6, 7, 8, 9], firstRow, secondRow, thirdRow),
    }
  }

  const setFamiliars = (tr) => {
    for (let index = 1; index < tr.length; index += 3) {
      familiars.push(setFamiliar(tr, index))
    }
  }

  for (let index = 3; index < $('article table').length; index++) {
    setFamiliars($(`article table:nth-of-type(${index}) tr`))
  }

  fs.promises.writeFile('data/familiars.json', JSON.stringify(await Promise.all(familiars)), 'utf8')
}

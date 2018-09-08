import cheerio from 'cheerio'
import fs from 'fs'
import { getAvatarBase64, getText } from './utils'

export const urlWiki = 'http://bit-heroes.wikia.com/wiki/Familiar'

export const scrapping = async (html) => {
  const $ = cheerio.load(html)
  $('table tr.epic').remove()
  $('table tr.legendary').remove()
  const familiars = []
  const setFamiliars = (tr) => {
    for (let index = 1; index < tr.length; index += 3) {
      const firstRow = $(tr[index])
      const secondRow = $(tr[index + 1])
      const thirdRow = $(tr[index + 2])
      const classType = firstRow.find('td').attr('class')
      const type = classType.charAt(0).toUpperCase() + classType.slice(1)
      const setSkill = (nth) => firstRow.find(`td:nth-child(${nth})`).length ? {
        name: getText(firstRow, nth),
        action: getText(secondRow, nth - 2),
        pourcentage: getText(thirdRow, nth - 1),
      } : {}
      const setObject = async () => {
        const avatar = await getAvatarBase64(firstRow.find('span img').attr('data-src'))

        return {
          type,
          avatar,
          name: getText(firstRow, 2),
          zone: getText(thirdRow, 1),
          power: getText(firstRow, 4).slice(0, -1),
          stamina: getText(secondRow, 2).slice(0, -1),
          agility: getText(thirdRow, 3).slice(0, -1),
          attack: {
            name: getText(firstRow, 5),
            action: getText(secondRow, 3),
            pourcentage: getText(thirdRow, 4),
          },
          skill1: {
            name: getText(firstRow, 6),
            action: getText(secondRow, 4),
            pourcentage: getText(thirdRow, 5),
          },
          skill2: setSkill(7),
          skill3: setSkill(8),
          skill4: setSkill(9),
        }
      }

      familiars.push(setObject())
    }
  }

  for (let index = 3; index < $('article table').length; index++) {
    setFamiliars($(`article table:nth-of-type(${index}) tr`))
  }

  fs.promises.writeFile('data/familiars.json', JSON.stringify(await Promise.all(familiars)), 'utf8')
}

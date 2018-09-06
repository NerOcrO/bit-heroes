import cheerio from 'cheerio'
import fs from 'fs'
import { getAvatarBase64, getText } from './utils'

export const urlWiki = 'http://bit-heroes.wikia.com/wiki/Fusion'

export const scrapping = async (html) => {
  const $ = cheerio.load(html)
  const familiars = []
  const setFamiliars = (table) => {
    for (let index = 1; index < table.length; index += 3) {
      const firstRow = $(table[index])
      const secondRow = $(table[index + 1])
      const thirdRow = $(table[index + 2])
      const classType = firstRow.find('td').attr('class')
      const type = classType.charAt(0).toUpperCase() + classType.slice(1)
      const setSpell = (nth) => firstRow.find(`td:nth-child(${nth})`).length ? {
        name: getText(firstRow, nth),
        action: getText(secondRow, nth - 1),
        pourcentage: getText(thirdRow, nth - 1),
      } : {}
      const setPassiveAbility = (rowAbilities) => {
        const abilities = rowAbilities.split(',')

        return abilities.map((element) => {
          const split = element.trim().match(/^([0-9.]*%) ([\w .%-]*)/)

          return {
            pourcentage: split[1],
            ability: split[2],
          }
        })
      }
      const setObject = async () => {
        const avatar = await getAvatarBase64(firstRow.find('span img').attr('data-src'))
        const createFusion = (familiar) => {
          const split = familiar.trim().match(/^([0-9]*) ([\w ]*)/)
          let name = familiar.trim()
          let count = 1

          if (split !== null) {
            name = split[2].trim()
            count = split[1]
          }
          return { name, count }
        }

        return {
          type,
          avatar,
          name: getText(firstRow, 2),
          fusion: getText(thirdRow, 1).split('+').map(createFusion),
          passiveAbility: setPassiveAbility(getText(secondRow, 1)),
          power: getText(firstRow, 4).slice(0, -1),
          stamina: getText(secondRow, 3).slice(0, -1),
          agility: getText(thirdRow, 3).slice(0, -1),
          attack: {
            name: getText(firstRow, 5),
            action: getText(secondRow, 4),
            pourcentage: getText(thirdRow, 4),
          },
          spell1: {
            name: getText(firstRow, 6),
            action: getText(secondRow, 5),
            pourcentage: getText(thirdRow, 5),
          },
          spell2: setSpell(7),
          spell3: setSpell(8),
          spell4: setSpell(9),
          spell5: setSpell(10),
        }
      }

      familiars.push(setObject())
    }
  }

  for (let index = 2; index < $('article table').length; index++) {
    setFamiliars($(`article table:nth-of-type(${index}) tr`))
  }

  fs.promises.writeFile('data/fusions.json', JSON.stringify(await Promise.all(familiars)), 'utf8')
}

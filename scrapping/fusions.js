import cheerio from 'cheerio'
import fs from 'fs'
import { getAvatarBase64, getText } from './utils'

export const urlWiki = 'http://bit-heroes.wikia.com/wiki/Fusion'

// TODO: rajouter schema + location

export const scrapping = async (html) => {
  const $ = cheerio.load(html)
  $('table tr.epic').remove()
  $('table tr.legendary').remove()
  const common = $('table.common tr')
  const rare = $('table.rare tr')
  const epic = $('table.epic tr')
  const legendary = $('table.legendary tr')
  const mythic = $('table.mythic tr')
  const familiars = []
  const setFamiliars = (table, type) => {
    for (let index = 1; index < table.length; index += 3) {
      const firstRow = $(table[index])
      const secondRow = $(table[index + 1])
      const thirdRow = $(table[index + 2])
      const setSpell = (nth) => firstRow.find(`td:nth-child(${nth})`).length ? {
        name: getText(firstRow, nth),
        action: getText(secondRow, nth - 1),
        pourcentage: getText(thirdRow, nth - 1),
      } : {}
      const setObject = async () => {
        const avatar = await getAvatarBase64(firstRow.find('span img').attr('data-src'))
        // const avatar = ''
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
          passiveAbility: getText(secondRow, 1),
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

  setFamiliars(common, 'Common')
  setFamiliars(rare, 'Rare')
  setFamiliars(epic, 'Epic')
  setFamiliars(legendary, 'Legendary')
  setFamiliars(mythic, 'Mythic')

  // console.log(await Promise.all(familiars))
  fs.promises.writeFile('data/fusions.json', JSON.stringify(await Promise.all(familiars)), 'utf8')
}

import cheerio from 'cheerio'
import fs from 'fs'
import { getAvatarBase64, getText, setSkill, setSkills } from './utils'

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

export const urlWiki = 'http://bit-heroes.wikia.com/wiki/Fusion'

export const scrapping = async (html) => {
  const $ = cheerio.load(html)
  const familiars = []

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
      fusion: getText(thirdRow, 1).split('+').map(createFusion),
      passiveAbility: setPassiveAbility(getText(secondRow, 1)),
      power: getText(firstRow, 4).slice(0, -1),
      stamina: getText(secondRow, 3).slice(0, -1),
      agility: getText(thirdRow, 3).slice(0, -1),
      attack: setSkill(firstRow, secondRow, thirdRow, 5, 'fusion'),
      skills: setSkills([6, 7, 8, 9, 10], firstRow, secondRow, thirdRow, 'fusion'),
    }
  }

  const setFamiliars = (tr) => {
    for (let index = 1; index < tr.length; index += 3) {
      familiars.push(setFamiliar(tr, index))
    }
  }

  for (let index = 2; index < $('article table').length; index++) {
    setFamiliars($(`article table:nth-of-type(${index}) tr`))
  }

  fs.promises.writeFile('data/fusions.json', JSON.stringify(await Promise.all(familiars)), 'utf8')
}

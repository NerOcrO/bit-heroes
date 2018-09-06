import cheerio from 'cheerio'
import fs from 'fs'
import { getText } from './utils'

export const urlWiki = 'http://bit-heroes.wikia.com/wiki/List_of_schematics'

export const scrapping = async (html) => {
  const $ = cheerio.load(html)
  const setSchematic = (index, element) => {
    const row = $(element)
    const createFusion = (row) => {
      const fusion = []
      for (let index = 3; index <= 6; index++) {
        const split = getText(row, index).trim().match(/^([0-9]*) ([\w ]*)/)
        let name = getText(row, index).trim()
        let count = 1

        if (split !== null) {
          name = split[2].trim()
          count = split[1]
        }

        fusion.push({ name, count })
      }

      return fusion
    }

    return {
      name: getText(row, 2).replace(' Schematic', ''),
      requisite: createFusion(row),
    }
  }
  const schematics = $('table tr')
    .map(setSchematic)
    .get()

  const fusions = fs.readFileSync('data/fusions.json', 'utf8')

  const familiars = JSON.parse(fusions).map((familiar) => {
    schematics.forEach((schematic) => {
      if (familiar.name === schematic.name) {
        familiar.fusion = schematic.requisite
      }
    })

    return familiar
  })

  // console.log(familiars)
  fs.promises.writeFile('data/fusions.json', JSON.stringify(await Promise.all(familiars)), 'utf8')
}

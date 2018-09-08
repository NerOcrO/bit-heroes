import cheerio from 'cheerio'
import fs from 'fs'
import { getText, getAvatarBase64 } from './utils'

export const urlWiki = 'http://bit-heroes.wikia.com/wiki/Mounts'

export const scrapping = async (html) => {
  const $ = cheerio.load(html)
  const mounts = []

  const setMounts = (tr) => {
    for (let index = 1; index < tr.length; index++) {
      const classType = $(tr[index]).attr('class')
      const type = classType.charAt(0).toUpperCase() + classType.slice(1)

      const setMount = async () => {
        const avatar = await getAvatarBase64($(tr[index]).find('span img').attr('data-src'))

        return {
          type,
          avatar,
          name: getText($(tr[index]), 2).replace(/\[[0-9]\]/, ''),
          moveSpeed: getText($(tr[index]), 3).slice(1, -1),
          bonus: getText($(tr[index]), 4).replace(/\[[0-9]\]/, ''),
          skill: getText($(tr[index]), 5),
        }
      }

      mounts.push(setMount())
    }
  }
  setMounts($('article table:nth-of-type(3) tr'))

  fs.promises.writeFile('data/mounts.json', JSON.stringify(await Promise.all(mounts)), 'utf8')
}

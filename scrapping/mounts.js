import cheerio from 'cheerio'
import fs from 'fs'
import * as utils from './utils'

export const urlWiki = 'http://bit-heroes.wikia.com/wiki/Mounts'

export const scrapping = async (html) => {
  const $ = cheerio.load(html)
  const mounts = []

  const setMounts = (tr) => {
    const setMount = async (row) => {
      const avatar = await utils.getAvatarBase64(row.find('span img').attr('data-src'))

      return {
        type: utils.getType(row),
        avatar,
        name: utils.getText(row, 2).replace(/\[[0-9]\]/, ''),
        moveSpeed: utils.getText(row, 3).slice(1, -1),
        bonus: utils.getText(row, 4).replace(/\[[0-9]\]/, ''),
        skill: utils.getText(row, 5),
      }
    }

    for (let index = 1; index < tr.length; index++) {
      mounts.push(setMount($(tr[index])))
    }
  }
  setMounts($('article table:nth-of-type(3) tr'))

  fs.promises.writeFile('data/mounts.json', JSON.stringify(await Promise.all(mounts)), 'utf8')
}

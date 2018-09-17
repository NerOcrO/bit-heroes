import cheerio from 'cheerio'
import fs from 'fs'
import * as utils from './utils'

export const urlWiki = 'http://bit-heroes.wikia.com/wiki/Mounts'

export const scrapping = async (html) => {
  const $ = cheerio.load(html)

  const tr = $('article table:nth-of-type(3) tr')
    .not((index, element) => (index === 0 ? $(element) : null))

  const getInformations = (type, information = 'upgrade') => {
    const informations = []
    const map = {
      Common: {
        rowId: 2,
        material: 'Common material',
        each: 1,
      },
      Rare: {
        rowId: 4,
        material: 'Rare material',
        each: 2,
      },
      Epic: {
        rowId: 6,
        material: 'Epic material',
        each: 3,
      },
      Legendary: {
        rowId: 8,
        material: 'Epic material',
        each: 4,
      },
    }
    let tableId = 4
    let tdId = 3
    let { each } = map[type]

    if (information === 'purchase') {
      each = 1
      tdId -= 1
    }
    else if (information === 'exchange') {
      tableId += 1
      each += 1
      tdId -= 1
    }

    for (let index = 0; index < each; index++) {
      const info = [{
        count: $(`article table:nth-of-type(${tableId}) tr:nth-of-type(${map[type].rowId}) td:nth-of-type(${tdId + index})`).text().trim(),
        material: 'Mount guts',
      },
      {
        count: $(`article table:nth-of-type(${tableId}) tr:nth-of-type(${map[type].rowId + 1}) td:nth-of-type(${tdId - 1 + index})`).text().trim(),
        material: map[type].material,
      }]

      if (information === 'purchase') {
        let gold = '10000'

        if (type === 'Rare') {
          gold = '25000'
        }
        else if (type === 'Epic') {
          gold = '100000'
        }
        else if (type === 'Legendary') {
          gold = '500000'
        }

        info.unshift({
          count: gold,
          material: 'Gold',
        })
      }

      informations.push(info)
    }

    return informations
  }

  const setMount = async (row) => {
    const avatar = await utils.getAvatarBase64(row.find('span img').attr('data-src'))
    const type = utils.getType(row)

    return {
      type,
      avatar,
      name: utils.getText(row, 2).replace(/\[[0-9]\]/, ''),
      moveSpeed: utils.getText(row, 3).slice(1, -1),
      bonus: utils.getText(row, 4).replace(/\[[0-9]\]/, ''),
      skill: utils.getText(row, 5),
      purchase: getInformations(type, 'purchase'),
      upgrades: getInformations(type),
      exchanges: getInformations(type, 'exchange'),
    }
  }

  $('noscript').remove()

  const mounts = await Promise.all(
    [...Array(tr.length)]
      .map((element, index) => setMount($(tr[index])))
  )

  fs.promises.writeFile('data/mounts.json', JSON.stringify(mounts), 'utf8')
}

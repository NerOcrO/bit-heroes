import { equipmentScrapping } from './utils'

export const urlWiki = 'http://bit-heroes.wikia.com/wiki/Heads'

export const scrapping = (html) => {
  equipmentScrapping(html, 'heads')
}

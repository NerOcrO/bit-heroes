import { equipmentScrapping } from './utils'

export const urlWiki = 'http://bit-heroes.wikia.com/wiki/Mainhands'

export const scrapping = (html) => {
  equipmentScrapping(html, 'mainhands')
}

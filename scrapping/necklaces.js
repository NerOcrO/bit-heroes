import { equipmentScrapping } from './utils'

export const urlWiki = 'http://bit-heroes.wikia.com/wiki/Necklaces'

export const scrapping = (html) => {
  equipmentScrapping(html, 'necklaces')
}

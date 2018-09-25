import { equipmentScrapping } from './utils'

export const urlWiki = 'http://bit-heroes.wikia.com/wiki/Rings'

export const scrapping = (html) => {
  equipmentScrapping(html, 'rings')
}

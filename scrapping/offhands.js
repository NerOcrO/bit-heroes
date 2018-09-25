import { equipmentScrapping } from './utils'

export const urlWiki = 'http://bit-heroes.wikia.com/wiki/Offhands'

export const scrapping = (html) => {
  equipmentScrapping(html, 'offhands')
}

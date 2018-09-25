import { equipmentScrapping } from './utils'

export const urlWiki = 'http://bit-heroes.wikia.com/wiki/Bodies'

export const scrapping = (html) => {
  equipmentScrapping(html, 'bodies')
}

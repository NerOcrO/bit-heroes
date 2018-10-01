'use strict'

import fetch from 'node-fetch'

for (let index = 2; index < process.argv.length; index++) {
  const { urlWiki, scrapping } = require(`./${process.argv[index]}`)

  fetch(urlWiki)
    .then(response => response.text())
    .then(scrapping)
    .catch(error => console.error(error))
}

import express from 'express'
import fs from 'fs'

const router = express.Router()

const select = (data, index) => data.reduce((accumulator, element) => {
  const text = element[index].replace(/[0-9.]*% /g, '')

  if (accumulator.every(type => type !== text)) {
    accumulator.push(text)
  }

  return accumulator
}, [])

const selectpassiveAbility = data => data.reduce((accumulator, element) => {
  element.passiveAbility.forEach((passiveAbility) => {
    const text = passiveAbility.ability.replace(/[0-9.%]*/, '')

    if (accumulator.every(type => type !== text)) {
      accumulator.push(text)
    }
  })

  return accumulator
}, [])

const selectSpells = data => data.reduce((accumulator, element) => {
  if (accumulator.every(type => type !== element.spell1.action)) {
    accumulator.push(element.spell1.action)
  }
  if (element.spell2.action !== undefined && accumulator.every(type => type !== element.spell2.action)) {
    accumulator.push(element.spell2.action)
  }
  if (element.spell3.action !== undefined && accumulator.every(type => type !== element.spell3.action)) {
    accumulator.push(element.spell3.action)
  }
  if (element.spell4.action !== undefined && accumulator.every(type => type !== element.spell4.action)) {
    accumulator.push(element.spell4.action)
  }
  if (element.spell5 && element.spell5.action !== undefined && accumulator.every(type => type !== element.spell5.action)) {
    accumulator.push(element.spell5.action)
  }

  return accumulator
}, [])

const selectFusions = data => data.reduce((accumulator, element) => {
  const materials = [
    'Common Material',
    'Rare Material',
    'Epic Material',
    'Jumbo Syrum',
    'Mini Syrum',
    'Robot Sprocket',
    "Hobbit's Foot",
    'Demon Juice',
    'Wet Brainz',
    'Ninja Powah',
    'Ginger Snaps',
    'Jelly Donut',
    'Ectoplasm',
    'Demon Hide',
    'Bacon',
    'Gold',
  ]

  element.fusion.forEach((fusion) => {
    if (accumulator.every(type => type !== fusion.name && materials.every(element => element !== fusion.name))) {
      accumulator.push(fusion.name)
    }
  })

  return accumulator
}, [])

const displayFamiliars = async (request, response, page) => {
  await fs.promises.readFile(`data/${page}.json`, 'utf8')
    .then((rawData) => {
      const data = JSON.parse(rawData)

      response.locals.selectType = select(data, 'type')

      if (page === 'fusions') {
        response.locals.selectPassiveAbility = selectpassiveAbility(data).sort()
        response.locals.selectFusion = selectFusions(data).sort()
      }

      response.locals.selectSpell = selectSpells(data).sort()

      response.render('layout', {
        view: page,
        title: page,
        data,
        csrfToken: request.csrfToken(),
        count: data.length,
      })
    })
    .catch(error => console.log(error))
}

const displaySoon = (request, response, page) => {
  response.render('layout', {
    view: page,
    title: page,
    csrfToken: request.csrfToken(),
  })
}

router.get('/', (request, response) => {
  displayFamiliars(request, response, 'familiars')
})

router.get('/familiars', (request, response) => {
  displayFamiliars(request, response, 'familiars')
})

router.get('/fusions', (request, response) => {
  displayFamiliars(request, response, 'fusions')
})

router.get('/equipments', (request, response) => {
  displaySoon(request, response, 'equipments')
})

router.get('/mounts', (request, response) => {
  displaySoon(request, response, 'mounts')
})

export default router

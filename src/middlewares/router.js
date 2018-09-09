import express from 'express'
import fs from 'fs'

const router = express.Router()

const selectType = (data, index) => data.reduce((accumulator, familiar) => {
  const text = familiar[index].replace(/[0-9.]*% /g, '')

  if (accumulator.every(type => type !== text)) {
    accumulator.push(text)
  }

  return accumulator
}, [])

const selectpassiveAbility = data => data.reduce((accumulator, familiar) => {
  familiar.passiveAbility.forEach((passiveAbility) => {
    const text = passiveAbility.ability.replace(/[0-9.%]*/, '')

    if (accumulator.every(type => type !== text)) {
      accumulator.push(text)
    }
  })

  return accumulator
}, [])

const selectSkills = data => data.reduce((accumulator, familiar) => {
  if (accumulator.every(type => type !== familiar.skill1.action)) {
    accumulator.push(familiar.skill1.action)
  }
  if (familiar.skill2.action !== undefined && accumulator.every(type => type !== familiar.skill2.action)) {
    accumulator.push(familiar.skill2.action)
  }
  if (familiar.skill3.action !== undefined && accumulator.every(type => type !== familiar.skill3.action)) {
    accumulator.push(familiar.skill3.action)
  }
  if (familiar.skill4.action !== undefined && accumulator.every(type => type !== familiar.skill4.action)) {
    accumulator.push(familiar.skill4.action)
  }
  if (familiar.skill5 && familiar.skill5.action !== undefined && accumulator.every(type => type !== familiar.skill5.action)) {
    accumulator.push(familiar.skill5.action)
  }

  return accumulator
}, [])

const selectFusions = data => data.reduce((accumulator, familiar) => {
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

  familiar.fusion.forEach((fusion) => {
    if (accumulator.every(type => type !== fusion.name && materials.every(material => material !== fusion.name))) {
      accumulator.push(fusion.name)
    }
  })

  return accumulator
}, [])

const displayFamiliars = async (request, response, page) => {
  await fs.promises.readFile(`data/${page}.json`, 'utf8')
    .then((rawData) => {
      let data = JSON.parse(rawData)

      response.locals.selectType = selectType(data, 'type')
      response.locals.selectSkill = selectSkills(data).sort()

      if (page === 'fusions') {
        response.locals.selectPassiveAbility = selectpassiveAbility(data).sort()
        response.locals.selectFusion = selectFusions(data).sort()
      }

      data = data.map((familiar) => {
        if (familiar.passiveAbility) {
          familiar.rawPassiveAbilities = familiar.passiveAbility.map(passiveAbility => passiveAbility.ability)
        }
        if (familiar.skill5) {
          familiar.rawSkills = `${familiar.skill1.action},${familiar.skill2.action},${familiar.skill3.action},${familiar.skill4.action},${familiar.skill5.action}`
        }
        else {
          familiar.rawSkills = `${familiar.skill1.action},${familiar.skill2.action},${familiar.skill3.action},${familiar.skill4.action}`
        }
        if (familiar.fusion) {
          familiar.rawFusion = familiar.fusion.map(requisite => requisite.name)
        }
        return familiar
      })

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

const displayMounts = async (request, response, page) => {
  await fs.promises.readFile(`data/${page}.json`, 'utf8')
    .then((rawData) => {
      const data = JSON.parse(rawData)

      response.locals.selectType = selectType(data, 'type')

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
  displayMounts(request, response, 'mounts')
})

export default router

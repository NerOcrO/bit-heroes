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
  familiar.skills.forEach((skill) => {
    if (skill.action) {
      if (accumulator.every(type => type !== skill.action)) {
        accumulator.push(skill.action)
      }
    }
  })

  return accumulator
}, [])

const selectZones = (data, index) => data.reduce((accumulator, familiar) => {
  const text = familiar[index]

  if (accumulator.every(zone => zone !== text)) {
    accumulator.push(text)
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
    .then(async (rawData) => {
      let data = JSON.parse(rawData)

      response.locals.selectType = selectType(data, 'type')
      response.locals.selectSkill = selectSkills(data).sort()

      if (page === 'fusions') {
        response.locals.selectPassiveAbility = selectpassiveAbility(data).sort()
        response.locals.selectFusion = selectFusions(data).sort()
      }
      else {
        response.locals.selectZone = selectZones(data, 'zone').sort()
      }

      if (page === 'fusions') {
        // It's crappy but...
        var dataFamiliars = JSON.parse(fs.readFileSync('data/familiars.json', 'utf8'))
      }

      data = data.map((familiar) => {
        familiar.rawSkills = familiar.skills.map(skill => `${skill.skillPoint}|${skill.action}`)

        if (page === 'fusions') {
          familiar.rawPassiveAbilities = familiar.passiveAbility.map(passiveAbility => passiveAbility.ability)
          familiar.rawFusion = familiar.fusion.map(requisite => requisite.name)

          familiar.fusion.map((requisite) => {
            const familiar = dataFamiliars.find(element => element.name === requisite.name)

            if (familiar) {
              requisite.zone = ` (${familiar.zone})`
            }

            return requisite
          })
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

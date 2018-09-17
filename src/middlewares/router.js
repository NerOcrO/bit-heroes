import express from 'express'
import fs from 'fs'

const router = express.Router()
const wikiUrl = 'http://bit-heroes.wikia.com/wiki/'

const setSimpleSelect = (data, index) => data.reduce((accumulator, familiar) => {
  let text = ''

  if (index === 'type') {
    text = familiar[index].replace(/[0-9.]*% /g, '')
  }
  else if (index === 'zone') {
    text = familiar[index]
  }

  if (accumulator.every(type => type !== text)) {
    accumulator.push(text)
  }

  return accumulator
}, [])

const setComplexSelect = (data, index) => data.reduce((accumulator, familiar) => {
  familiar[index].forEach((element) => {
    let text = ''
    let validation = type => type !== text

    if (index === 'passiveAbility') {
      text = element.ability.replace(/[0-9.%]*/, '')
    }
    else if (index === 'skills') {
      text = element.action
    }
    else if (index === 'fusion') {
      const materials = [
        'Common Material',
        'Rare Material',
        'Epic Material',
        'Jumbo Syrum',
        'Mini Syrum',
        'Robot Sprocket',
        'Hobbit Foot',
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

      text = element.name
      validation = type => type !== text && materials.every(material => material !== text)
    }

    if (accumulator.every(validation)) {
      accumulator.push(text)
    }
  })

  return accumulator
}, [])

const displayFamiliars = async (request, response, page) => {
  await fs.promises.readFile(`data/${page}.json`, 'utf8')
    .then(async (rawData) => {
      let data = JSON.parse(rawData)

      response.locals.selectType = setSimpleSelect(data, 'type')
      response.locals.selectSkill = setComplexSelect(data, 'skills').sort()

      if (page === 'fusions') {
        response.locals.selectPassiveAbility = setComplexSelect(data, 'passiveAbility').sort()
        response.locals.selectFusion = setComplexSelect(data, 'fusion').sort()
      }
      else {
        response.locals.selectZone = setSimpleSelect(data, 'zone').sort()
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
            requisite.url = 'fusions'

            if (familiar) {
              requisite.zone = ` (${familiar.zone})`
              requisite.class = familiar.type.toLowerCase()
              requisite.url = 'familiars'
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
        wikiUrl: `${wikiUrl + page}`,
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

      response.locals.selectType = setSimpleSelect(data, 'type')

      response.render('layout', {
        view: page,
        title: page,
        data,
        csrfToken: request.csrfToken(),
        count: data.length,
        wikiUrl: `${wikiUrl + page}`,
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

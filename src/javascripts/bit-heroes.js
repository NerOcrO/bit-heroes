'use strict'

const $ = selector => document.querySelector(selector)
const $$ = selector => document.querySelectorAll(selector)

const setStrongestAndWeakestFamiliar = () => {
  const tr = Array.from($$('.familiars tbody tr:not(.invisible), .fusions tbody tr:not(.invisible)'))

  if (tr.length === 0) {
    return
  }

  $$('.strongest').forEach(element => element.classList.remove('strongest'))
  $$('.weakest').forEach(element => element.classList.remove('weakest'))

  for (let index = 3; index < 6; index++) {
    const stats = tr.sort((a, b) => b.children[index].textContent - a.children[index].textContent)

    stats[0].children[index].classList.add('strongest')
    stats[[stats.length - 1]].children[index].classList.add('weakest')
  }
}

function cleanTableHead(th) {
  th.classList.remove('focus')

  if (this === th.id) {
    if (th.classList.contains('asc')) {
      th.classList.replace('asc', 'desc')
    }
    else {
      th.classList.replace('desc', 'asc')
    }

    th.classList.add('focus')
  }
}

const sortTableRow = (event) => {
  const element = event.currentTarget
  const { id } = element
  let rows = []

  if (element.classList.contains('number')) {
    rows = Array.from($$('tbody tr'))
      .sort((a, b) => b.children[element.cellIndex].textContent - a.children[element.cellIndex].textContent)
  }
  else {
    rows = Array.from($$('tbody tr'))
      .sort((a, b) => {
        const a1 = a.children[element.cellIndex].textContent.normalize('NFD').replace(/[\u0300-\u036f| |']/g, '')
        const b1 = b.children[element.cellIndex].textContent.normalize('NFD').replace(/[\u0300-\u036f| |']/g, '')
        if (a1 < b1) return -1
        if (a1 > b1) return 1
        return 0
      })
  }
  if (element.classList.contains('desc')) {
    rows.reverse()
  }

  for (let i = 0; i < rows.length; i++) {
    $('tbody').appendChild(rows[i])
  }

  $$('th').forEach(cleanTableHead, id)
}

const selectRows = () => {
  const selectValues = {}

  $$('select').forEach((select) => {
    selectValues[select.name] = { content: select.value }
  })

  $$('tbody tr').forEach((tr) => {
    let flagType = true
    let flagSkill = true
    let flagZone = true
    let flagPassiveAbility = true
    let flagSchematicPlace = true
    let flagFusion = true
    let flagTier = true
    let flagWeaponType = true

    if (
      selectValues.selectType
      && selectValues.selectType.content !== 'all'
      && tr.classList[0] !== selectValues.selectType.content
    ) {
      flagType = false
    }

    if (
      selectValues.selectSkill
      && (
        selectValues.selectSkill.content !== 'all'
        && !tr.dataset.rawSkills.split(',').some(skill => skill.slice(2) === selectValues.selectSkill.content)
        || selectValues.selectSkill.content !== 'all'
        && selectValues.selectSkillPoint.content !== 'all'
        && !tr.dataset.rawSkills.split(',').some(skill => skill.slice(2) === selectValues.selectSkill.content && skill.slice(0, 1) === selectValues.selectSkillPoint.content)
        ||selectValues.selectSkillPoint.content !== 'all'
        && !tr.dataset.rawSkills.split(',').some(skill => skill.slice(0, 1) === selectValues.selectSkillPoint.content)
      )
    ) {
      flagSkill = false
    }

    if (
      selectValues.selectZone
      && selectValues.selectZone.content !== 'all'
      && tr.dataset.rawZone !== selectValues.selectZone.content
    ) {
      flagZone = false
    }

    if (
      selectValues.selectTier
      && selectValues.selectTier.content !== 'all'
      && tr.dataset.rawTier !== selectValues.selectTier.content
    ) {
      flagTier = false
    }

    if (
      selectValues.selectWeaponType
      && selectValues.selectWeaponType.content !== 'all'
      && tr.dataset.rawWeaponType !== selectValues.selectWeaponType.content
    ) {
      flagWeaponType = false
    }

    if (
      selectValues.selectPassiveAbility
      && selectValues.selectPassiveAbility.content !== 'all'
      && !tr.dataset.rawPassiveAbilities.split(',').some(passiveAbility => passiveAbility === selectValues.selectPassiveAbility.content)
    ) {
      flagPassiveAbility = false
    }

    if (
      selectValues.selectSchematicPlace
      && selectValues.selectSchematicPlace.content !== 'all'
      && tr.dataset.rawSchematicPlace !== selectValues.selectSchematicPlace.content
    ) {
      flagSchematicPlace = false
    }

    if (
      selectValues.selectFusion
      && selectValues.selectFusion.content !== 'all'
    ) {
      flagType = true
      flagSkill = true
      flagZone = true
      flagPassiveAbility = true
      flagSchematicPlace = true
      flagTier = true
      flagWeaponType = true

      if (!tr.dataset.rawFusion.split(',').some(requisite => requisite === selectValues.selectFusion.content)) {
        flagFusion = false
      }
    }

    if (
      flagType
      && flagSkill
      && flagZone
      && flagPassiveAbility
      && flagSchematicPlace
      && flagFusion
      && flagTier
      && flagWeaponType
    ) {
      tr.classList.remove('invisible')
    }
    else {
      tr.classList.add('invisible')
    }
  })

  $$('tbody span').forEach((span) => {
    span.classList.remove('highlight')

    if (
      selectValues.selectSkill && span.textContent === selectValues.selectSkill.content
      || selectValues.selectPassiveAbility && span.textContent === selectValues.selectPassiveAbility.content
      || selectValues.selectZone && span.textContent === selectValues.selectZone.content
      || selectValues.selectSchematicPlace && span.textContent === selectValues.selectSchematicPlace.content
      || selectValues.selectTier && span.textContent === selectValues.selectTier.content
      || selectValues.selectWeaponType && span.textContent === selectValues.selectWeaponType.content
    ) {
      span.classList.add('highlight')
    }
  })

  $$('#count').forEach((element) => {
    element.innerHTML = $$('tbody tr').length - $$('tr.invisible').length
  })

  setStrongestAndWeakestFamiliar()
}

const reset = () => {
  $$('select').forEach((select) => {
    const event = new Event('change')
    select.value = 'all'
    select.dispatchEvent(event)
  })
  if ($('.reroll-formula')) {
    $('.reroll-formula').innerHTML = ''
  }
}

const showRerollFormula = (event) => {
  let mountGguts = 2
  let material = '100 <img src="/common-material.png" alt="Common material">'

  if (event.currentTarget.value === 'rare') {
    mountGguts = 8
    material = '50 <img src="/rare-material.png" alt="Rare material">'
  }
  else if (event.currentTarget.value === 'epic') {
    mountGguts = 40
    material = '4 <img src="/epic-material.png" alt="Epic material">'
  }
  else if (event.currentTarget.value === 'legendary') {
    mountGguts = 200
    material = '10 <img src="/epic-material.png" alt="Epic material">'
  }

  $('.reroll-formula').innerHTML = `Reroll's formula: [nth-reroll] * <b>${mountGguts}</b> <img src="/mount-guts.png" alt="Mount guts"> + [nth-reroll] * <b>${material}</b>`
}

$('.submit').classList.add('invisible')
$('.reset').addEventListener('click', reset)
$$('select').forEach(option => option.addEventListener('change', selectRows))
$$('.mounts select').forEach(option => option.addEventListener('change', showRerollFormula))
$$('th.asc, th.desc').forEach(th => th.addEventListener('click', sortTableRow))

// For responsive.
const labels = Array.from($$('thead th')).map(th => th.innerText)
$$('.table td').forEach((td, index) => {
  td.setAttribute('data-label', labels[index % labels.length])
})
setStrongestAndWeakestFamiliar()

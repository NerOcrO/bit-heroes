'use strict'

const $ = selector => document.querySelector(selector)
const $$ = selector => document.querySelectorAll(selector)

const setStrongestAndWeakest = () => {
  if ($('.mounts')) {
    return
  }

  const tr = Array.from($$('tbody tr:not(.invisible)'))

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
  const { id } = event.currentTarget
  let rows = []

  if (id === 'power' || id === 'stamina' || id === 'agility') {
    rows = Array.from($$('tbody tr'))
      .sort((a, b) => b.children[event.currentTarget.cellIndex].textContent - a.children[event.currentTarget.cellIndex].textContent)
  }
  else {
    rows = Array.from($$('tbody tr'))
      .sort((a, b) => {
        const a1 = a.children[event.currentTarget.cellIndex].textContent.normalize('NFD').replace(/[\u0300-\u036f| |']/g, '')
        const b1 = b.children[event.currentTarget.cellIndex].textContent.normalize('NFD').replace(/[\u0300-\u036f| |']/g, '')
        if (a1 < b1) return -1
        if (a1 > b1) return 1
        return 0
      })
  }
  if (event.currentTarget.classList.contains('desc')) {
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
    let flagFusion = true

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
      selectValues.selectPassiveAbility
      && selectValues.selectPassiveAbility.content !== 'all'
      && !tr.dataset.rawPassiveAbilities.split(',').some(passiveAbility => passiveAbility === selectValues.selectPassiveAbility.content)
    ) {
      flagPassiveAbility = false
    }

    if (
      selectValues.selectFusion
      && selectValues.selectFusion.content !== 'all'
    ) {
      flagType = true
      flagSkill = true
      flagZone = true
      flagPassiveAbility = true

      if (!tr.dataset.rawFusion.split(',').some(requisite => requisite === selectValues.selectFusion.content)) {
        flagFusion = false
      }
    }

    if (
      flagType
      && flagSkill
      && flagZone
      && flagPassiveAbility
      && flagFusion
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
      span.textContent === selectValues.selectSkill.content
      || selectValues.selectPassiveAbility && span.textContent === selectValues.selectPassiveAbility.content
      || selectValues.selectZone && span.textContent === selectValues.selectZone.content
    ) {
      span.classList.add('highlight')
    }
  })

  $$('#count').forEach((element) => {
    element.innerHTML = $$('tbody tr').length - $$('tr.invisible').length
  })

  setStrongestAndWeakest()
}

const reset = () => {
  $$('select').forEach((select) => {
    const event = new Event('change')
    select.value = 'all'
    select.dispatchEvent(event)
  })
}

$('.submit').classList.add('invisible')
$('.reset').addEventListener('click', reset)
$$('select').forEach(option => option.addEventListener('change', selectRows))
$$('th').forEach(th => th.addEventListener('click', sortTableRow))

// For responsive.
const labels = Array.from($$('thead th')).map(th => th.innerText)
$$('.table td').forEach((td, index) => {
  td.setAttribute('data-label', labels[index % labels.length])
})
setStrongestAndWeakest()

'use strict'

const $ = selector => document.querySelector(selector)
const $$ = selector => document.querySelectorAll(selector)

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
  const selectValue = []

  $$('select').forEach((select) => {
    selectValue.push({ content: select.value, columnId: select.dataset.columnid })
  })

  $$('tbody tr').forEach((tr) => {
    let flagType = true
    let flagSkill = true
    let flagPassiveAbility = true
    let flagFusion = true

    if (
      selectValue[0]
      && selectValue[0].content !== 'all'
      && tr.classList[0] !== selectValue[0].content
    ) {
      flagType = false
    }

    if (
      selectValue[1]
      && selectValue[1].content !== 'all'
      && !tr.dataset.rawSkills.split(',').some(skill => skill === selectValue[1].content)
    ) {
      flagSkill = false
    }

    if (
      selectValue[2]
      && selectValue[2].content !== 'all'
      && !tr.dataset.rawPassiveAbilities.split(',').some(passiveAbility => passiveAbility === selectValue[2].content)
    ) {
      flagPassiveAbility = false
    }

    if (
      selectValue[3]
      && selectValue[3].content !== 'all'
    ) {
      flagType = true
      flagSkill = true
      flagPassiveAbility = true

      if (!tr.dataset.rawFusion.split(',').some(requisite => requisite === selectValue[3].content)) {

        flagFusion = false
      }
    }

    if (
      flagType
      && flagSkill
      && flagPassiveAbility
      && flagFusion
    ) {
      tr.classList.remove('invisible')
    }
    else {
      tr.classList.add('invisible')
    }
  })
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

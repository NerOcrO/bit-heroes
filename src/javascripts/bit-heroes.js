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

const selectRows = (event) => {
  $$('tbody tr').forEach((tr) => {
    const columnId = event.currentTarget.dataset.column
    let content = tr.children[columnId].textContent
    let selectValue = event.currentTarget.value

    // Concat all Skills.
    if (columnId === '6') {
      content += tr.children[7].textContent
      content += tr.children[8].textContent
      content += tr.children[9].textContent
      content += tr.children[10].textContent
    }

    if (columnId === '11') {
      selectValue = `% ${event.currentTarget.value}`
    }
    else if (columnId === '12') {
      selectValue = ` ${event.currentTarget.value}\\W`
    }

    if (content.trim().match(new RegExp(selectValue, 'g')) || event.currentTarget.value === 'all') {
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
$$('th').forEach(th => th.addEventListener('click', sortTableRow))
$('.reset').addEventListener('click', reset)
$$('#typeSelect').forEach(option => option.addEventListener('change', selectRows))
$$('#skill').forEach(option => option.addEventListener('change', selectRows))
$$('#selectPassiveAbility').forEach(option => option.addEventListener('change', selectRows))
$$('#selectFusion').forEach(option => option.addEventListener('change', selectRows))
const labels = Array.from($$('thead th')).map(th => th.innerText)
$$('.table td').forEach((td, index) => {
  td.setAttribute('data-label', labels[index % labels.length])
})

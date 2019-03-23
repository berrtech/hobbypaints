export const searchPaint = query => {
  return fetch('/api/paints/search?query=' + query).then(res => res.json())
}

export const getClosestPaints = hex => {
  return fetch('/api/closestPaints/' + hex)
    .then(res => res.json())
}

export const getPaintById = id => {
  return fetch('/api/paints/' + id)
    .then(res => res.json())
}

export const getIsAuthenticated = ({ login, password }) => {
  const authorization = 'Basic ' + btoa(login + ':' + password)

  return fetch('/api/admin/isauthenticated', {
    headers: {
      authorization
    }
  }).then(res => res.json())
}

export const getPaints = () => {
  return fetch('/api/paints')
    .then(res => res.json())
}

export const updatePaint = ({ __v, _id, ...paint }) => {
  const { login, password } = JSON.parse(localStorage.getItem('credentials'))

  const authorization = 'Basic ' + btoa(login + ':' + password)

  return fetch('/api/admin/paints/' + _id, {
    method: 'POST',
    body: JSON.stringify(paint),
    headers: {
      authorization,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  }).then(res => res.json())
}

export const createPaint = (paint) => {
  const { login, password } = JSON.parse(localStorage.getItem('credentials'))

  const authorization = 'Basic ' + btoa(login + ':' + password)

  return fetch('/api/admin/paints', {
    method: 'POST',
    body: JSON.stringify(paint),
    headers: {
      authorization,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  }).then(res => res.json())
}

export const deletePaint = id => {
  const { login, password } = JSON.parse(localStorage.getItem('credentials'))

  const authorization = 'Basic ' + btoa(login + ':' + password)

  return fetch('/api/admin/paints/' + id, {
    method: 'DELETE',
    headers: {
      authorization,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  }).then(res => res.json())
}
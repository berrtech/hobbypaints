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
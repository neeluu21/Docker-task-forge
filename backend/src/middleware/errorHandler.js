export function notFound(_req, res) {
  res.status(404).json({ message: 'Route not found' })
}

export function errorHandler(error, _req, res, _next) {
  console.error(error)
  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: 'Validation failed', details: error.message })
  }
  return res.status(500).json({ message: 'Internal server error' })
}

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import mongoose from 'mongoose'
import tasksRouter from './routes/tasks.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

const app = express()
const PORT = Number(process.env.PORT || 5000)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/taskforge'

app.disable('x-powered-by')
app.set('trust proxy', 1)
app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-site' } }))
app.use(cors())
app.use(express.json({ limit: '32kb' }))
app.use(morgan('combined'))
app.use(rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: true, legacyHeaders: false }))

app.get('/api/health', async (_req, res) => {
  const dbReady = mongoose.connection.readyState === 1
  res.status(dbReady ? 200 : 503).json({
    status: dbReady ? 'ok' : 'degraded',
    service: 'taskforge-api',
    database: dbReady ? 'connected' : 'disconnected'
  })
})

app.use('/api/tasks', tasksRouter)
app.use(notFound)
app.use(errorHandler)

async function start() {
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TaskForge API listening on :${PORT}`)
  })
}

start().catch((error) => {
  console.error('Failed to start TaskForge API:', error.message)
  process.exit(1)
})

process.on('SIGTERM', async () => {
  await mongoose.connection.close()
  process.exit(0)
})

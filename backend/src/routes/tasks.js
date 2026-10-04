import { Router } from 'express'
import mongoose from 'mongoose'
import Task from '../models/Task.js'

const router = Router()

router.get('/', async (_req, res, next) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 }).lean()
    res.json(tasks)
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { title, description = '', priority = 'low' } = req.body
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' })
    }
    const task = await Task.create({ title: title.trim(), description, priority })
    res.status(201).json(task)
  } catch (error) {
    next(error)
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid task id' })
    }
    const allowed = ['title', 'description', 'priority', 'status']
    const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)))
    const task = await Task.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
    if (!task) return res.status(404).json({ message: 'Task not found' })
    res.json(task)
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid task id' })
    }
    const task = await Task.findByIdAndDelete(req.params.id)
    if (!task) return res.status(404).json({ message: 'Task not found' })
    res.json({ message: 'Task deleted' })
  } catch (error) {
    next(error)
  }
})

export default router

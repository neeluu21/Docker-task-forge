import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 500, default: '' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    status: { type: String, enum: ['todo', 'in-progress', 'completed'], default: 'todo' }
  },
  { timestamps: true }
)

taskSchema.index({ status: 1, createdAt: -1 })

taskSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id
    delete ret.__v
    return ret
  }
})

export default mongoose.model('Task', taskSchema)

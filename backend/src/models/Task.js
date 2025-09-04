const mongoose = require('mongoose');

// Task model for user-owned tasks with RBAC support
// - owner references User._id
// - status/priority are enums for consistent API
// - dueDate is stored as Date, API returns epoch ms
const taskSchema = new mongoose.Schema({
  title:    { type: String, required: true, trim: true },
  content:  { type: String, required: true, trim: true },
  dueDate:  { type: Date,   required: true },
  priority: { type: String, enum: ['LOW', 'MID', 'HIGH'], default: 'LOW' },
  status:   { type: String, enum: ['PENDING', 'LATE', 'DONE'], required: true },
  owner:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Indexes for common queries
taskSchema.index({ owner: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ dueDate: 1 });

// Optional: enforce global unique title (if desired)
// taskSchema.index({ title: 1 }, { unique: true });

module.exports = mongoose.model('Task', taskSchema);

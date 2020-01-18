const express = require('express')
const Task = require('../models/task')
const TaskController = require('../controllers/task')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/tasks', auth, TaskController.postTask)

// GET /tasks?completed=true
// GET /tasks?limit=10&skip=20
// GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, TaskController.getTasks)

router.get('/tasks/:id', auth, TaskController.getTask)

router.patch('/tasks/:id', auth, TaskController.patchTask)

router.delete('/tasks/:id', auth, TaskController.deleteTask)

module.exports = router
const express = require('express');
const router = express.Router();
const { 
  getTasks, 
  createTask, 
  updateTask, 
  deleteTask,
  assignTask 
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getTasks)
  .post(protect, createTask);

router.route('/:id')
  .put(protect, updateTask)
  .delete(protect, deleteTask);

router.post('/:id/assign', protect, assignTask);

module.exports = router;
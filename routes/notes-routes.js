const express = require('express');
const router = express.Router();

const checkAuth = require('../middleware/check-auth');
const {
  createNote,
  updateNote,
  deleteNote,
  publishNote,
  getNote,
  getNotes,
} = require('../controllers/notes-controller');

router.put('/create', checkAuth, createNote);
router.get('/getNotes', checkAuth, getNotes);
router.patch('/update', checkAuth, updateNote);
router.delete('/delete/:noteId', checkAuth, deleteNote);
router.post('/publish/:noteId', checkAuth, publishNote);
router.get('/note/:noteId/:userId?', getNote);

module.exports = router;

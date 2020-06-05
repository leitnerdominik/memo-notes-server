const express = require('express');
const router = express.Router();

const checkAuth = require('../middleware/check-auth');
const {
  createNote,
  updateNote,
  deleteNote,
} = require('../controllers/notes-controller');

router.put('/create', checkAuth, createNote);
// router.get('/getNotes', getNotes);
router.patch('/update', checkAuth, updateNote);
router.delete('/delete/:noteId', checkAuth, deleteNote);
// router.get('/note/:noteId', getNote);

module.exports = router;

const mongoose = require('mongoose');
const HttpError = require('../models/http-error');
const User = require('../models/user');
const Note = require('../models/note');

const createNote = async (req, res, next) => {
  const { title, content, userId } = req.body;

  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    console.log(err);
    return next(new HttpError('Unable to create note. Please try again.'));
  }

  if (!user) {
    return next(
      new HttpError('Could not find user with the provided id.'),
      404
    );
  }

  const newNote = new Note({
    title,
    content,
    creator: userId,
  });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await newNote.save({ session: sess });
    user.notes.push(newNote);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    return next(new HttpError('Creating note failed. Please try again.'));
  }

  res.status(201).json({ message: 'Note created!', note: newNote });
};

const updateNote = async (req, res, next) => {
  const { title, content, noteId } = req.body;

  let changedNote;
  try {
    changedNote = await Note.findById(noteId);
  } catch (err) {
    console.log(err);
    return next(new HttpError('Updating note failed. Please try again.'));
  }

  if (!changedNote) {
    return next(
      new HttpError('Could not find any note with the provided id.'),
      404
    );
  }

  // TODO: uebrpeufen ob creator ungleich der authentifizierte nutzer ist
  // mittels middleware
  if(changedNote.creator.toString() !== req.userData.userId) {
    return next(new HttpError('You are not allowed to change this note.', 403));
  }

  changedNote.title = title;
  changedNote.content = content;

  try {
    await changedNote.save();
  } catch (err) {
    return next(new HttpError('Updating note failed. Please try again.'));
  }

  res.json({ message: 'Note updated!', note: changedNote });
};

const deleteNote = async (req, res, next) => {
  const { noteId } = req.params;

  let note;
  let user;

  try {
    note = await Note.findById(noteId).populate('creator');
  } catch (err) {
    console.log(err);
    return next(new HttpError('Deleting note failed. Please try again.'));
  }

  if (!note) {
    return next(
      new HttpError('Could not find note with the provided id.', 404)
    );
  }

  if (note.creator.id.toString() !== req.userData.userId) {
    console.log(note.creator.toString(), req.userData.userId);
    return next(new HttpError('You are not allowed to delete this note.', 403));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await note.remove({session: sess});
    note.creator.notes.pull(note);
    await note.creator.save({session: sess});
    await sess.commitTransaction();
  } catch (err) {}

  // TODO: response anpassen, zuviele unnoetige daten werden uebergebn
  res.json({ message: 'Note deleted!', note: note });
};

exports.createNote = createNote;
exports.updateNote = updateNote;
exports.deleteNote = deleteNote;

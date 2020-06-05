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
    title: title || '',
    content: content || '',
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

  const createdNote = {
    title: newNote.title,
    content: newNote.content,
    public: newNote.public,
    id: newNote._id,
    
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

  if (changedNote.creator.toString() !== req.userData.userId) {
    return next(new HttpError('You are not allowed to change this note.', 403));
  }

  changedNote.title = title || '';
  changedNote.content = content || '';

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
    await note.remove({ session: sess });
    note.creator.notes.pull(note);
    await note.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {}

  res.json({ message: 'Note deleted!' });
};

const publishNote = async (req, res, next) => {
  const { noteId } = req.params;

  let note;
  try {
    note = await Note.findById(noteId);
  } catch (err) {
    return next(new HttpError('Publishing failed. Please try again.'));
  }

  if (!note) {
    return next(
      new HttpError('Could not find note with the provided id.', 404)
    );
  }

  if(note.creator.toString() !== req.userData.userId) {
    return next(new HttpError('You are not allowed to publish this note.', 403))
  }

  note.public = true;

  try {
    await note.save();
  } catch(err) {
    return next(new HttpError('Publishing failed. Please try again.'))
  }

  res.json({message: 'Note published!'})
};

const getNote = async (req, res, next) => {
  // userId ist optional, falls das Note nicht public ist
  // und der Benutzer der Besitzer sollte er das Note dennoch sehen.
  const { noteId, userId } = req.params;
  console.log(noteId, userId);


  let note;
  try {
    note = await Note.findById(noteId).populate('creator');
  } catch(err) {
    return next(new HttpError('Getting note failed. Please try again.'));
  }

  if(!note) {
    return next(new HttpError('Could not fetch note with the provided id.'), 404);
  }

  if(note.creator._id.toString() !== userId && !note.public) {
    return next(new HttpError('You are not allowed to fetch this note.', 403))
  }

  const fetchedNote = {
    title: note.title,
    content: note.content,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  }

  res.json({message: 'Note fetched!', note: fetchedNote});
}

const getNotes = async (req, res, next) => {

  let notes;
  try {
    notes = await Note.find({creator: req.userData.userId}, '-creator -__v');
  } catch(err) {
    return next(new HttpError('Getting notes failed. Please try again.'))
  }

  if(!notes) {
    return next(new HttpError('Could not find any note for this user.', 404));
  }

  res.json({message: 'Notes fetched!', notes: notes})
}

exports.createNote = createNote;
exports.updateNote = updateNote;
exports.deleteNote = deleteNote;
exports.publishNote = publishNote;
exports.getNote = getNote;
exports.getNotes = getNotes;
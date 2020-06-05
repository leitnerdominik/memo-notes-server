const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const noteSchema = new Schema({
  title: String,
  content: String,
  creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
}, { timestamps: { createdAt: true, updatedAt: true}});

module.exports = mongoose.model('Note', noteSchema);

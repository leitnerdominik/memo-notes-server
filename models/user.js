const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: String,
  email: String,
  password: String,
  notes: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Note' }],
});

module.exports = mongoose.model('User', userSchema);

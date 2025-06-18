const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  description: { type: String },
  year: { type: Number },
  genre: { type: String },
  imageUrl: { type: String },
  ratings: [{ userId: String, grade: Number }],
  averageRating: { type: Number }
});

module.exports = mongoose.model('Book', bookSchema);
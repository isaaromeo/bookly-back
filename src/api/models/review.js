const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema(
  {
    book: { type: mongoose.Types.ObjectId, ref: 'books', required: true},//La propiedad required hace que el campo sea obligatorio
    user: { type: mongoose.Types.ObjectId, ref: 'users', required: true},
    rating: { type: Number, required: true},
    comments: { type: String, trim: true },
    recommend: { type: Boolean }

  },
  {
    timestamps: true,
  }
);

const Review = mongoose.model('reviews', reviewSchema, 'reviews');
module.exports = Review;
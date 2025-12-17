const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: { type: String, trim: true, required: true },
    profilePic: { type: String, trim: true },
    password: {
      type: String,
      trim: true,
      required: true,
      minlength: [8, "Password needs 8 characters minimum"],
    },
    email: {
      type: String,
      trim: true,
      required: true,
    },
    library: [{ type: mongoose.Types.ObjectId, ref: "books" }], //libros leidos
    tbr: [{ type: mongoose.Types.ObjectId, ref: "books" }], //libros pendientes de leer(to be read)
    reviews: [{ type: mongoose.Types.ObjectId, ref: "reviews" }],
    rol: { type: String, trim: true, required: true, default: "user" },
    following: [{ type: mongoose.Types.ObjectId, ref: "users" }], 
    followers: [{ type: mongoose.Types.ObjectId, ref: "users" }], 
  },
  {
    timestamps: true,
  }
);

//encriptamos la psw antes de guardar la psw en nuestro modelo

userSchema.pre('save', function (next) {
    this.password = bcrypt.hashSync(this.password, 10)
    next()
})

const User = mongoose.model('users', userSchema, 'users');
module.exports = User;
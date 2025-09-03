const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        username: { type: String, trim: true, required: true},
        profilePic: { type: String, trim: true},
        password: {
            type: String,
            trim: true,
            required: true,
            minlength: [8, "Password needs 8 characters minimum"]
        },
        email: {
            type: String,
            trim: true,
            required: true
        },
        library: [{ type: mongoose.Types.ObjectId, ref: 'books'}],
        reviews: [{type: mongoose.Types.ObjectId, ref: 'reviews'}],
        rol: {type: String, trim: true, required: true, default: "user" }


    },
    {
        timestamps: true
    }

)

//encriptamos la psw antes(pre) de guardar(save) la psw en nuestro modelo
//como parametro se usa una funcion normal(no arrow) porque es un this
userSchema.pre('save', function (next) {
    this.password = bcrypt.hashSync(this.password, 10)
    next()
})

// Creamos y exportamos el modelo User
const User = mongoose.model('users', userSchema, 'users');
module.exports = User;
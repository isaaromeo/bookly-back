const { generateToken } = require("../../utils/token");
const { deleteImgCloudinary } = require("../../utils/deleteImgDB")
const User = require("../models/user")
const bcrypt = require('bcrypt');


//al registrar un usuario solo se puede hacer con rol "user"
//Para obtener rol admin tendra que hacerlo un user admin desde updateUser
const registerUser = async (req, res, next) => {
    try {
      const user = new User(req.body);
      //rol user por defecto
      user.rol = "user";
      //La libreria/tbr/following/followers se inicializa vacio
      user.library = [];
      user.tbr = [];
      user.following = [];
      user.followers = [];

      if (req.file) {
        console.log(3);
        user.profilePic = req.file.path;
      }

      const userExists = await User.findOne({ email: req.body.email }).exec();
      if (userExists) {
        console.log(4);
        return res.status(400).json("Usuario existente");
      } // else {
      const userDB = await user.save();
      return res.status(201).json({
        message: "User created successfully!",
        element: userDB,
      });
      //}
    } catch (error) {
        res.status(400).json({ 
            "message": "error registrando al usuario",
            "element": error
    })
    }
}


 const login = async (req, res, next) => {
     try {
         const { email, password} = req.body;
         const user = await User.findOne({ email: req.body.email});

         if(!user) {
             return res.status(400).json("contraseña o usuario incorrectos");
         }
         if(bcrypt.compareSync(req.body.password, user.password)) {
             const token = generateToken(user._id, user.email);
             return res.status(200).json({ token, user})
         } else {
             return res.status(400).json("contraseña incorrecta");
         }
    
     } catch (error) {
         return res.status(400).json("Error en el login")
     }
 }


const updateUserRol = async(req, res, next) => {
    try {
        const { id } = req.params;

        if(req.body.rol === "user" || req.body.rol === "admin"){
            const newUser = new User(req.body);
            newUser._id = id;

            const updatedUser = await User.findByIdAndUpdate(id, newUser, {
              new: true,
            });
            
            return res.status(200).json(updatedUser);
        }
        else {
            res.status(400).json("Invalid user rol")
        }

      } catch (error) {
        return res.status(400).json(error);
      }
}

const updateUser = async(req, res, next) => {
    try {
        const { id } = req.params;

        if (req.user._id.toString() !== id) {
            return res.status(403).json({ message: "You can only update your own user" });
        }
        
        const newUser = new User(req.body);
        newUser._id = id;

        //Para que los usuarios con rol "user" no puedan actualizarse a rol "admin"
        if(req.user.rol === "user"){
            newUser.rol = "user"
        }
        if (req.file) {
        newUser.profilePic = req.file.path;
       }
        const updatedUser = await User.findByIdAndUpdate(id, newUser, {new: true});
        return res.status(200).json({ 
            message: "User updated successfully!",
            element: updatedUser
    });

      } catch (error) {
        return res.status(400).json(error);
      }
}

const deleteUser = async(req, res, next) => {
    try {
        const { id } = req.params;

        // Verificar si el usuario que realiza la solicitud es un admin o el propio usuario
        if (req.user.rol !== "admin" && req.user._id.toString() !== id) {
            return res.status(403).json({ message: "You are not authorized to delete this user" });
        }
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found." });
        }
        //borramos imagen cloudinary
        deleteImgCloudinary(deletedUser.profilePic);

        return res.status(200).json({
            message: "User deleted successfully!",
            element: deletedUser
        });

      } catch (error) {
        return res.status(400).json(error);
      }
}

const getUserInfo = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).populate("library");

        if(!user){
            res.status(404).json("User not found");
        }
        
        return res.status(200).json(user)
    } catch (error) {
        return res.status(400).json(error);
    }

}
module.exports = {
    registerUser,
    login,
    updateUserRol,
    updateUser,
    deleteUser, 
    getUserInfo
}


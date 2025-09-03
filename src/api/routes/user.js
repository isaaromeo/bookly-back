const { registerUser, login, updateUserRol, updateUser, deleteUser, getUserInfo} = require("../controllers/user");
const { isAuth, isAuthAdmin} = require("../../middlewares/user");
const  { uploadUser } = require("../../middlewares/file");
const usersRouter =  require("express").Router();

usersRouter.post('/register', isAuth, uploadUser.single("profilePic"), registerUser);
usersRouter.post('/login', login);
usersRouter.put("/update_rol/:id", isAuthAdmin, updateUserRol);
usersRouter.put("/:id", isAuth, uploadUser.single("profilePic"), updateUser);
usersRouter.delete("/:id", isAuth, deleteUser);
usersRouter.get("/:id", isAuth, getUserInfo);

module.exports = usersRouter;


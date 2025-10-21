const { registerUser, 
    login, 
    updateUserRol, 
    updateUser, 
    deleteUser, 
    getUserInfo, 
    addToLibrary,
    removeFromLibrary,
    addToTBR,
    removeFromTBR,
    followUser,
    getUserFollowData
} = require("../controllers/user");
const { isAuth, isAuthAdmin} = require("../../middlewares/user");
const  { uploadUser } = require("../../middlewares/file");
const usersRouter =  require("express").Router();

usersRouter.post('/register', uploadUser.single("profilePic"), registerUser);
usersRouter.post('/login', login);
usersRouter.put("/update_rol/:id", isAuthAdmin, updateUserRol);
usersRouter.put("/:id", isAuth, uploadUser.single("profilePic"), updateUser);
usersRouter.delete("/:id", isAuth, deleteUser);
usersRouter.get("/:id", isAuth, getUserInfo);
usersRouter.post("/:userId/library/:bookId", isAuth, addToLibrary);
usersRouter.delete("/:userId/library/:bookId", isAuth, removeFromLibrary);
usersRouter.post("/:userId/tbr/:bookId", isAuth, addToTBR);
usersRouter.delete("/:userId/tbr/:bookId", isAuth, removeFromTBR);
usersRouter.post("/follow/:followedUserId", isAuth, followUser);
usersRouter.get("/:userId/followData", getUserFollowData);

module.exports = usersRouter;


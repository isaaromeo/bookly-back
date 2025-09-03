const {getReviews, postReview, updateReview, deleteReview, getBookReviews } = require("../controllers/review");
const { isAuth, isAuthAdmin} = require("../../middlewares/user");

const reviewsRouter =  require("express").Router();

reviewsRouter.get("/", getReviews);
reviewsRouter.post("/", isAuth, postReview);
reviewsRouter.put("/:id/:userId", isAuth, updateReview);
reviewsRouter.delete("/:id/:userId", isAuth, deleteReview);
reviewsRouter.get("/:bookId", getBookReviews); 


module.exports = reviewsRouter;
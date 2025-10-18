const {getReviews, postReview, updateReview, deleteReview, getBookReviews, likeReview, getReviewLikes } = require("../controllers/review");
const { isAuth, isAuthAdmin} = require("../../middlewares/user");

const reviewsRouter =  require("express").Router();

reviewsRouter.get("/", getReviews);
reviewsRouter.post("/", isAuth, postReview);
reviewsRouter.put("/:id/:userId", isAuth, updateReview);
reviewsRouter.delete("/:id/:userId", isAuth, deleteReview);
reviewsRouter.get("/:bookId", getBookReviews); 
reviewsRouter.post("/:reviewId/like", isAuth, likeReview);
reviewsRouter.get("/:reviewId/likes", getReviewLikes);


module.exports = reviewsRouter;
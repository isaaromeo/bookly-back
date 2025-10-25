const Review = require("../models/review");
const Book = require("../models/book");
const User = require("../models/user");
const { calculateBookRating } = require("./book")

const getReviews = async (req, res, next) =>{
    try {
        const reviews = await Review.find()
          .populate("book", "title cover author")
          .populate("user", "username profilePic"); 
        return res.status(200).json(reviews)
    } catch (error) {
        return res.status(400).json(error);
    }
}


const getBookReviews = async (req, res, next) => {
    try {
      const { bookId } = req.params;

      const book = await Book.findById(bookId);
       if (!book) {
         return res.status(404).json("Book not found");
       }
      const reviews = await Review.find({ book: bookId }).populate(
        "user",
        "username profilePic"
      )
    
      return res.status(200).json(reviews);
    } catch (error) {
        return res.status(400).json(error);
    }
    
}

const postReview = async (req, res, next) =>{
    try {
      console.log("=== POST REVIEW START ===");
      console.log("req body: ", req.body);
      const newReview = new Review(req.body);
      const id = req.body.book;

      console.log("Finding book with id:", id);
      const book = await Book.findById(id);
      if (!book) {
        console.log("Book not found");
        return res.status(404).json({ message: "Book not found" });
      }

      //comprobamos que el usuario no ha dejado una review anteriormente
      const reviewsIds = book.reviews;
      console.log("Existing reviews count:", reviewsIds.length);

      for (const id of reviewsIds) {
        console.log("review id:", id);
        let review = await Review.findById(id);
        console.log("review:", review)
        if (review.user.equals(newReview.user)) {
          return res.status(400).json({
            message: "User already reviewed this book!",
            user: newReview.user,
            book: id,
            existingReview: review._id,
          });
        }
      }

      newReview.likes = [];
      console.log("Saving new review...");
      const savedReview = await newReview.save();
      console.log("Review saved:", savedReview._id);

      reviewsIds.push(savedReview._id);
      console.log("Updating book reviews...");
      const updatedBook = await Book.findByIdAndUpdate(
        id,
        { reviews: reviewsIds },
        { new: true }
      );

      //recalculamos rating
      console.log("Calculating new rating...");
      const newRating = await calculateBookRating(id);
      console.log("New rating:", newRating);

      //añadimos el libro a la libreria del usuario y la reseña a la lista de reseñas
      console.log("Updating user...");
      const updateOperation = {
        $addToSet: {
          library: id, 
          reviews: savedReview._id, 
        },
      };

      const user = await User.findById(newReview.user);
      //si el usuario tiene el libro en su TBR lo borramos
      if (user.tbr.includes(id)) {
        console.log("borrando libro");
        updateOperation.$pull = { tbr: id };

      }

      const updatedUser = await User.findByIdAndUpdate(user._id, updateOperation,{ new: true })
      .populate("library")
      .populate("tbr")
      .populate("reviews");

      console.log("=== POST REVIEW SUCCESS ===");

      return res.status(201).json({ savedReview, updatedBook, rating: newRating });
    } catch (error) {
      console.log("=== POST REVIEW ERROR ===");
      console.error("Error details:", error);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      return res.status(400).json({
        message: "Error creating review",
        error: error.message,
        details: error.toString(),
      });

    }
}

const deleteReview = async (req, res, next) =>{
    try {
        const { reviewId, userId } = req.params;
        //Checkeamos que el usuario que quiere borrar la review es el mismo que la creo
        //o en su defecto un admin  
        const user = await User.findById(userId);
        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        const isOwner = review.user.toString() === userId;
        const isAdmin = user.rol === "admin";

        if (!isOwner && !isAdmin) {
          return res
            .status(403)
            .json({ message: "Not authorized to delete this review" });
        }

        const deletedReview = await Review.findByIdAndDelete(reviewId);
        console.log("review borrado")
        //actualizar libro
        await Book.findByIdAndUpdate(review.book, { $pull: { reviews: reviewId } });
        console.log("libro actualizado");
        //recalcular rating
        try {
          await calculateBookRating(review.book);
        } catch (error) {
          console.warn("Rating recalculation failed:", error.message);
        }

        //actualiza ruser
        User.findByIdAndUpdate(review.user, { $pull: { reviews: reviewId } });
        console.log("user actualizado");
        return res.status(200).json({
          message: "Review deleted successfully",
          review: deletedReview,
        });

        } catch (error) {
        console.error("Error in deleteReview:", error);
        return res.status(400).json({
            message: "Error deleting review",
            error: error.message
        });
    }

}

const updateReview = async (req, res, next) =>{
    try {
        const { id, userId } = req.params;
        //Checkeamos que el usuario que quiere actualizar la review es el mismo que la creo
        const review = await Review.findById(id);

        if(userId == review.user.toString()){

            const newReview = new Review(req.body);
            newReview._id = id;
            const updatedReview = await Review.findByIdAndUpdate(id, newReview, { new: true})
            //si se actualiza el rating se recalcula
            if (req.body.rating !== undefined) {
              await calculateBookRating(review.book);
            }
            return res.status(200).json({message: "Review updated sucessfully", element: updatedReview})
        }
        else{
            res.status(403).json("Forbidden")
        }
    } catch (error) {
        return res.status(400).json(error);
    }
}

// Like a una review
const likeReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    const alreadyLiked = review.likes.includes(userId);
    
    if (alreadyLiked) {
      //si ya tiene like se quita 
      review.likes = review.likes.filter(id => id.toString() !== userId.toString());
      await review.save();
      
    } else {
      review.likes.push(userId);

    }
    await review.save();

    const populatedReview = await Review.findById(reviewId)
      .populate("user", "username profilePic")
      .populate("book", "title cover author");

    return res.status(200).json({
      message: alreadyLiked ? "Like removed" : "Review liked",
      review: populatedReview,
      liked: !alreadyLiked,
    });

  } catch (error) {
    console.error("Error in likeReview:", error);
    return res.status(400).json({ 
      message: "Error liking review",
      error: error.message 
    });
  }
};

const getReviewLikes = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    return res.status(200).json({
      likesCount: review.likes.length,
      likes: review.likes
    });

  } catch (error) {
    return res.status(400).json({ 
      message: "Error getting review likes",
      error: error.message 
    });
  }
};

module.exports = {
    getReviews,
    getBookReviews,
    postReview,
    deleteReview,
    updateReview,
    likeReview,
    getReviewLikes
}
const Review = require("../models/review");
const Book = require("../models/book");
const User = require("../models/user");
const mongoose = require("mongoose");

const getReviews = async (req, res, next) =>{
    try {
        const reviews = await Review.find().populate("book");
        return res.status(200).json(reviews)
    } catch (error) {
        return res.status(400).json(error);
    }
}


const getBookReviews = async (req, res, next) => {
    try {
        const { bookId } = req.params;
        const book = await Book.findById(bookId).populate("reviews");
        if(!book) {
            res.status(404).json("Book not found")
        }
        const reviews = book.reviews;
        return res.status(200).json(reviews)
    } catch (error) {
        return res.status(400).json(error);
    }
    
}

const postReview = async (req, res, next) =>{
    try {
        //creamos review
        const newReview = new Review(req.body);
        
        //buscamos el libro al que pertenece
        const id = req.body.book;
        const book = await Book.findById(id);
        
        //recogemos array de reviews y comprobamos que el usuario no ha dejado una review anteriormente
        const reviewsIds = book.reviews;

        for(const id of reviewsIds){
            let review = await Review.findById(id);
    
            if(review.user.equals(newReview.user)){
                return res.status(400).json("User already reviewed this book!")
            }

        }
        //Inicializamos likes a 0(users)
        newReview.likes = [];
        //guardamos review
        const savedReview = await newReview.save();

        //actualizamos array reviews del libro
        reviewsIds.push(savedReview._id)
        const updatedBook = await Book.findByIdAndUpdate(id, {"reviews": reviewsIds}, {new: true});
        
        //añadimos el libro a la libreria del usuario
        const user = await User.findById(newReview.user)
        userLibrary = user.library;
        userLibrary.push(book._id)

        //añadimos la review a la lista de reviews del usuario
        userReviews = user.reviews;
        userReviews.push(savedReview._id)
        const updateUser = await User.findByIdAndUpdate(newReview.user, 
            {"library": userLibrary,
             "reviews": userReviews
            }, 
            {new: true})
        return res.status(201).json({savedReview, updatedBook})
    } catch (error) {
        return res.status(400).json(error);

    }
}

const deleteReview = async (req, res, next) =>{
    try {
        const { id, userId } = req.params;
        //Checkeamos que el usuario que quiere borrar la review es el mismo que la creo
        //o en su defecto un admin  
        const user = await User.findById(userId);
        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        if(user._id.toString() === review.user.toString() || user.rol === "admin"){
            const deletedReview = await Review.findByIdAndDelete(id);
            //borrar la review del array de reviews del libro al que pertenece
            const book = await Book.findById(review.book);

            if(!book){
                return res.status(404).json({ message: "Book not found" });
            }

            //creamos array con ids en formato string
            const bookReviewsToString = book.reviews.map(e => e.toString());

            //Buscamos el index del que queremos eliminar
            const deleteIndex = bookReviewsToString.indexOf(id);

            if (deleteIndex === -1) {
                return res.status(404).json({ message: "Review not found in the book" });
            }
            //Eliminamos el review del array
            book.reviews.splice(deleteIndex, 1);
            const updatedBook = await Book.findByIdAndUpdate(
                review.book, 
                { reviews: book.reviews}, 
                { new: true});

            
            //borrar la review del array de reviews del user al que pertenece
            const user = await User.findById(review.user);

            if(!user){
                return res.status(404).json({ message: "User not found" });
            }

            //creamos array con ids en formato string
            const userReviewsToString = user.reviews.map(e => e.toString());

            //Buscamos el index del que queremos eliminar
            const deleteIndexUser = userReviewsToString.indexOf(id);

            if (deleteIndex === -1) {
                return res.status(404).json({ message: "Review not found in the user" });
            }
            //Eliminamos el review del array
            user.reviews.splice(deleteIndexUser, 1);
            const updatedUser = await User.findByIdAndUpdate(
                review.user, 
                { reviews: user.reviews}, 
                { new: true});

            return res.status(200).json({
                message: "Review deleted sucessfully", 
                element: deletedReview,
                book: updatedBook
            });
        }
        else{
            res.status(403).json("Forbidden");
        }
    } catch (error) {
        return res.status(400).json(error);
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
            return res.status(200).json({message: "Review updated sucessfully", element: updatedReview})
        }
        else{
            res.status(403).json("Forbidden")
        }
    } catch (error) {
        return res.status(400).json(error);
    }
}

module.exports = {
    getReviews,
    getBookReviews,
    postReview,
    deleteReview,
    updateReview
}
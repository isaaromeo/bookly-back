const Book = require("../models/book")
const { deleteImgCloudinary } = require("../../utils/deleteImgDB")

const getBooks = async (req, res, next) =>{
    try {
        const books = await Book.find().populate("reviews");
        return res.status(200).json(books)
    } catch (error) {
        return res.status(400).json(error);
    }
}

const getBookByid = async (req, res, next) =>{
    try {
        const { id } = req.params;
        const book = await Book.findById(id).populate("reviews");;
        return res.status(200).json(book)
    } catch (error) {
        return res.status(400).json(error);
    }
}

const getBooksByGenre = async (req, res, next) =>{
    const { categories } = req.params;
    try {
      
      const books = await Book.find({ categories: { $in: [categories] } }).populate("reviews");;
      if(books.length === 0){
        return res.status(400).json("No books in this category");

      } else{
        return res.status(200).json(books);
      }
      
    } catch (error) {
      return res.status(400).json(error);
    }
  }

  const getBooksByAuthor = async (req, res, next) => {
    const { author } = req.params;
    try {
      const books = await Book.find({
        author: { $eq: author },
      }).populate("reviews");
      if (books.length === 0) {
        return res.status(400).json("No books by this Author");
      } else {
        return res.status(200).json(books);
      }
    } catch (error) {
      return res.status(400).json(error);
    }
  };


const postBook = async (req, res, next) =>{ //solo lo puede hacer un admin
    try {
        const newBook = new Book(req.body);
        //comprobamos con el isbn que ese libro no exista ya en la bbdd
        isbn = Book.find({ isbn: newBook.isbn});
        if(isbn){
            return res.status(400).json("Book already created");
        }
        if (req.file) {
            newBook.cover = req.file.path;
           }
        const savedBook = await newBook.save()
        return res.status(201).json(newBook)
    } catch (error) {
        return res.status(400).json(error);
    }
}

const deleteBook = async (req, res, next) =>{ //solo lo puede hacer un admin
    try {
        const { id } = req.params;
        const deletedBook = await Book.findByIdAndDelete(id);
        //borramos imagen cloudinary
        deleteImgCloudinary(deletedBook.cover);
        return res.status(200).json({message: "Book deleted sucessfully", element: deletedBook})
    } catch (error) {
        return res.status(400).json(error);
    }
}

const updateBook = async (req, res, next) =>{ //solo lo puede hacer un admin
    try {
        const { id } = req.params;
        const newBook = new Book(req.body);
        newBook._id = id;

        if (req.file) {
            newBook.cover = req.file.path;
           }

        const updatedBook = await Book.findByIdAndUpdate(id, newBook, { new: true});
        return res.status(200).json({message: "Book updated sucessfully", element: updatedBook})
    } catch (error) {
        return res.status(400).json(error);
    }
}

module.exports = {
  getBooks,
  getBookByid,
  getBooksByGenre,
  getBooksByAuthor,
  postBook,
  deleteBook,
  updateBook,
};
const {
  getBooks,
  postBook,
  updateBook,
  deleteBook,
  getBookByid,
  getBooksByGenre,
  getBooksByAuthor,
} = require("../controllers/book");

const  { uploadBook } = require("../../middlewares/file");
const { isAuth, isAuthAdmin} = require("../../middlewares/user");
const booksRouter =  require("express").Router();

booksRouter.get("/", getBooks); 
booksRouter.get("/:id", getBookByid);
booksRouter.get("/genre/:genres", getBooksByGenre);
booksRouter.get("/author/:auhor", getBooksByAuthor);
booksRouter.post("/", isAuthAdmin, uploadBook.single("cover"), postBook); 
booksRouter.put("/:id", isAuthAdmin, uploadBook.single("cover"), updateBook); 
booksRouter.delete("/delete/:id", isAuthAdmin, deleteBook);

module.exports = booksRouter;
const {
  getBooks,
  postBook,
  updateBook,
  deleteBook,
  getBookByid,
  getBooksByGenre,
  getBooksByAuthor,
  uploadBooksCSV
} = require("../controllers/book");

const { isAuthAdmin } = require("../../middlewares/user");
const { uploadCSV, uploadBook } = require("../../middlewares/file");
const booksRouter =  require("express").Router();

booksRouter.get("/", getBooks); 
booksRouter.get("/:id", getBookByid);
booksRouter.get("/genre/:genres", getBooksByGenre);
booksRouter.get("/author/:auhor", getBooksByAuthor);
booksRouter.post("/", isAuthAdmin, uploadBook.single("cover"), postBook); 
booksRouter.put("/:id", isAuthAdmin, uploadBook.single("cover"), updateBook); 
booksRouter.delete("/delete/:id", isAuthAdmin, deleteBook);
booksRouter.post("/uploadCSV", isAuthAdmin, uploadCSV.single("csvFile"), uploadBooksCSV);

module.exports = booksRouter;
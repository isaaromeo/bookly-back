const Book = require("../models/book")
const { deleteImgCloudinary } = require("../../utils/deleteImgDB")
// const { seedFromCSV } = require("../../utils/seeds/csvBooks");
const csv = require("csv-parser");
const Review = require("../models/review");

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

const getBooksByGenre = async (req, res, next) => {
  try {
    const { genres } = req.params;
    
    const books = await Book.find({ 
      genres: { $in: [genres.toLowerCase()] } 
    });
    
    
    res.status(200).json(books);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ 
      message: "Error retrieving books", 
      error: error.message 
    });
  }
};

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


const postBook = async (req, res, next) =>{
  //solo lo puede hacer un admin
  try {
    const newBook = new Book(req.body);

    //verificar si el libro ya existe
    const existingBook = await Book.findOne({ isbn: newBook.isbn });
    if (existingBook) {
      return res.status(400).json("Book already exists");
    }

    if (req.file) {
      newBook.cover = req.file.path;
    }

    const savedBook = await newBook.save();
    return res.status(201).json(savedBook);
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

const processCSVFromBuffer = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const results = {
      added: 0,
      skipped: 0,
      errors: [],
    };

    const books = [];

    //buffer-->string-->crear stream
    const fileContent = fileBuffer.toString("utf8");
    const { Readable } = require("stream");
    const stream = Readable.from(fileContent);

    stream
      .pipe(csv())//cvs-->obj js
      .on("data", (row) => {//por cada fila un obj
        try {
          books.push({
            title: row.title,
            author: row.author,
            sinopsis: row.sinopsis,
            pages: parseInt(row.pages),
            genres: row.genres.split(","),
            cover: row.cover,
            isbn: row.isbn,
            rating: parseFloat(row.rating),
            reviews: [],
            savedBy: [],
            readBy: [],
          });
        } catch (error) {
          results.errors.push(`Error parsing row: ${error.message}`);
        }
      })
      .on("end", async () => {
        //una vez leido se mirar si existe
        for (const bookData of books) {
          try {
            const existingBook = await Book.findOne({ isbn: bookData.isbn });

            if (existingBook) {
              results.skipped++;
              continue;
            }
            //si no existe guardar en bbdd
            const newBook = new Book(bookData);
            await newBook.save();
            results.added++;
          } catch (error) {
            results.errors.push(
              `Error with "${bookData.title}": ${error.message}`
            );
          }
        }
        resolve(results);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
};

const uploadBooksCSV = async (req, res, next) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        message: "No CSV file uploaded",
      });
    }

    // const filePath = req.file.path;

    //con memoryStorage archivo se guarda en req.file.buffer
    const fileBuffer = req.file.buffer;
    const fileContent = fileBuffer.toString("utf8");

    // Procesar el CSV usando la misma función de la semilla
    // const results = await seedFromCSV(file);
    const results = await processCSVFromBuffer(fileContent);

    return res.status(200).json({
      message: "CSV processing completed",
      results: results,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Error processing CSV file",
      error: error.message,
    });
  }
};

const calculateBookRating = async (bookId) => {
  try {
  
    const reviews = await Review.find({ book: bookId });

     if (reviews.length === 0) {
       await Book.findByIdAndUpdate(bookId, {
         rating: 0,
         totalRatings: 0,
       });
       return 0;
     }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    const roundedRating = Math.round(averageRating * 10) / 10;

    await Book.findByIdAndUpdate(bookId, {
      rating: roundedRating,
      totalRatings: reviews.length,
    });

    return roundedRating;
  } catch (error) {
    console.error("Error calculating book rating:", error);
    throw error;
  }
};
module.exports = {
  getBooks,
  getBookByid,
  getBooksByGenre,
  getBooksByAuthor,
  postBook,
  deleteBook,
  updateBook,
  uploadBooksCSV,
  calculateBookRating
};
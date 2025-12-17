const books = require("../../data/books");
const Book = require("../../api/models/book")
const mongoose = require("mongoose")

//nos conectamos para cargar los libros y nos volvemos a desconectar

mongoose
  .connect(
    "mongodb+srv://isa:9LDQo7ZjZ18hsBqA@cluster0.75ble.mongodb.net/Bookly?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(async () => {
    console.log("Starting smart book seeding...");

    let addedCount = 0;
    let skippedCount = 0;

    for (const bookData of books) {
      try {
        //verificar si el libro ya existe por ISBN
        const existingBook = await Book.findOne({ isbn: bookData.isbn });

        if (existingBook) {
          console.log(
            `Book already exists: "${bookData.title}" by ${bookData.author}`
          );
          skippedCount++;
          continue;
        }

        //si no existe lo creamos
        const newBook = new Book(bookData);
        await newBook.save();
        console.log(`Book added: "${bookData.title}" by ${bookData.author}`);
        addedCount++;
      } catch (error) {
        console.error(
          `Error processing book "${bookData.title}":`,
          error.message
        );
      }
    }
    console.log(
      `Seeding completed! Added: ${addedCount}, Skipped: ${skippedCount}`
    );
  })
  .catch((err) => {
    console.log(`Error during seeding: ${err}`);
  })
  .finally(() => {
    mongoose.disconnect();
    console.log("Database connection closed.");
  });
  
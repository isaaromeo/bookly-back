const fs = require("fs");
const csv = require("csv-parser");
const Book = require("../../api/models/book");
const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://isa:9LDQo7ZjZ18hsBqA@cluster0.75ble.mongodb.net/Bookly?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(async () => {
    console.log("Starting CSV book seeding...");

    //ruta
    const csvFilePath = process.argv[2];

    if (!csvFilePath) {
      console.log(
        "Filepath not found"
      );
      process.exit(1);
    }

    const books = [];

    //procesar csv
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on("data", (row) => {
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
        })
        .on("end", resolve)
        .on("error", reject);
    });

    console.log(`Found ${books.length} books in CSV`);

    let addedCount = 0;
    let skippedCount = 0;

    //verificar si existen ya en bbdd
    for (const bookData of books) {
      try {
        const existingBook = await Book.findOne({ isbn: bookData.isbn });

        if (existingBook) {
          console.log(
            `Book already exists: "${bookData.title}" by ${bookData.author}`
          );
          skippedCount++;
          continue;
        }

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
    console.log(`Error: ${err}`);
  })
  .finally(() => {
    mongoose.disconnect();
    console.log("Database connection closed.");
  });


  //si se quiere subir csv desde el front(adminTools)

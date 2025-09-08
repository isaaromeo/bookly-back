const books = require("../../data/books");
const Book = require("../../api/models/book")
const mongoose = require("mongoose")

//nos conectamos para cargar los libros y nos volvemos a desconectar

mongoose
  .connect(
    "mongodb+srv://isa:0j9FyWeOAfYcpNtx@cluster0.75ble.mongodb.net/Bookly?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(async () => {
    //buscamos TODOS los libros de nuestra coleccion
    const allBooks = await Book.find();

    //si existen libros borramos la coleccion
    if (allBooks.length) {
      await Book.collection.drop();
    }
  })
  .catch((err) => {
    console.log(`Error removing collection: ${err}`);
  })
  .then(async () => {
    //rellenamos de nuevo con nuestro array de libros
    await Book.insertMany(books);
    console.log("Books added successfully!");
  })
  .catch((err) => {
    console.log(`Error adding new books: ${err}`);
  })
  .finally(() => mongoose.disconnect());
//Creamos el servidor
const express = require("express");
const cors = require("cors");
const app = express();
const port = 3001;

//Consfiguramos el dotenv
require("dotenv").config()

//Config CORs
app.use(cors());

//Configuramos Cloudinary
const { connectCloudinary } = require("./src/config/cloudinary")
connectCloudinary();


//traemos enrutador movies
const booksRouter = require("./src/api/routes/book");
const reviewsRouter = require("./src/api/routes/review");
const usersRoutes = require('./src/api/routes/user');

//conectamos bbdd
const { connectDB } = require("./src/config/db")
connectDB();

//recoger datos en json
app.use(express.json());

//rutas servidor
app.use("/api/books", booksRouter);

app.use("/api/reviews", reviewsRouter);

app.use("/api/user", usersRoutes);
//rutas sin respuesta
app.use("*", (req, res, next) => {
    return res.status(404).json("Route not found")
})
//si no se recoge anteriormente el error
app.use((error, req, res, next) => {
    console.log(error)
    return res.status(error.status || 500).json(error.message || 'Unexpected error')
  })
//servidor escuchando puerto
app.listen(port, () => {
    console.log("http://localhost:3001");
})
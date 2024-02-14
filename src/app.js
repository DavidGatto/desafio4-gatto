const express = require("express");
const app = express();
const exphbs = require("express-handlebars");
const socket = require("socket.io");
const PUERTO = 8080;
require("./database.js");

const productsRouter = require("./routes/products.router.js");
const cartsRouter = require("./routes/carts.router.js");
const viewsRouter = require("./routes/views.router.js");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("./src/public"));

//Routes
app.use("/api", productsRouter);
app.use("/api", cartsRouter);
app.use("/", viewsRouter);

// Handlebars
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");

exphbs.create({
  allowProtoMethodsByDefault: true,
  allowProtoPropertiesByDefault: true,
});

const httpServer = app.listen(PUERTO, () => {
  console.log(`Servidor escuchando en el puerto ${PUERTO}`);
});

const MessageModel = require("./dao/models/message.model.js");

const io = new socket.Server(httpServer);

io.on("connection", (socket) => {
  console.log("Nuevo usuario conectado");

  socket.on("message", async (data) => {
    await MessageModel.create(data);

    const messages = await MessageModel.find();
    console.log(messages);
    io.sockets.emit("message", messages);
  });
});

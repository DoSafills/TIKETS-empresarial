const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// 🔌 rutas
const ticketsRoutes = require("./routes/tickets");
app.use("/tickets", ticketsRoutes);

// test
app.get("/", (req, res) => {
  res.send("API funcionando");
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Servidor disponible en red");
});
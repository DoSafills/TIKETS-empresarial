const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "tickets_db"
});

db.connect(err => {
  if (err) {
    console.error("Error conexión:", err);
  } else {
    console.log("MySQL conectado");
  }
});

module.exports = db;
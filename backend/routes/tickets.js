const express = require("express");
const router = express.Router();
const db = require("../db");

// 📄 Obtener tickets
router.get("/", (req, res) => {
  db.query("SELECT * FROM tickets", (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// ➕ Crear ticket
router.post("/", (req, res) => {
  const { titulo, descripcion, estado, prioridad, categoria } = req.body;

  const sql = `
    INSERT INTO tickets (titulo, descripcion, estado, prioridad, categoria)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [titulo, descripcion, estado, prioridad, categoria], (err) => {
    if (err) return res.status(500).send(err);
    res.send("Ticket creado");
  });
});

// 🔄 Actualizar estado
// 🔄 Actualizar estado + técnico + descripción
router.put("/:id", (req, res) => {
  const { estado, tecnico, descripcion } = req.body;
  const { id } = req.params;

  const sql = `
    UPDATE tickets 
    SET estado = ?, 
        tecnico = ?, 
        descripcion_resolucion = ?
    WHERE id = ?
  `;

  db.query(sql, [estado, tecnico, descripcion, id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error al actualizar");
    }
    res.send("Ticket actualizado");
  });
});



module.exports = router;
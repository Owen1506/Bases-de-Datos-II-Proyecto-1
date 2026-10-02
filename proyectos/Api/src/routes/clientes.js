const express = require('express');
const { ejecutarSP } = require('../db');
const { esEntero } = require('../validar');

const router = express.Router();

// GET /api/clientes?nombre=&categoriaId=&metodoEntregaId=
router.get('/', async (req, res) => {
  // si un filtro no viene se manda null y el SP no lo toma en cuenta
  let nombre = req.query.nombre || null;
  let categoriaId = req.query.categoriaId || null;
  let metodoEntregaId = req.query.metodoEntregaId || null;

  if (categoriaId !== null) {
    if (!esEntero(categoriaId)) {
      return res.status(400).json({ mensaje: 'La categoría debe ser un número entero.' });
    }
    categoriaId = Number(categoriaId);
  }

  if (metodoEntregaId !== null) {
    if (!esEntero(metodoEntregaId)) {
      return res.status(400).json({ mensaje: 'El método de entrega debe ser un número entero.' });
    }
    metodoEntregaId = Number(metodoEntregaId);
  }

  const filas = await ejecutarSP('dbo.usp_Clientes_Listar', {
    Nombre: nombre,
    CategoriaID: categoriaId,
    MetodoEntregaID: metodoEntregaId
  });

  res.json(filas);
});

// GET /api/clientes/5
router.get('/:id', async (req, res) => {
  if (!esEntero(req.params.id)) {
    return res.status(400).json({ mensaje: 'El código del cliente debe ser un número entero.' });
  }

  const filas = await ejecutarSP('dbo.usp_Clientes_Detalle', {
    ClienteID: Number(req.params.id)
  });

  if (filas.length === 0) {
    return res.status(404).json({ mensaje: 'No existe un cliente con ese código.' });
  }

  res.json(filas[0]);
});

module.exports = router;

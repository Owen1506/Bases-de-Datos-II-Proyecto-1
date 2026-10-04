const express = require('express');
const { ejecutarSP } = require('../db');
const { esEntero } = require('../validar');

const router = express.Router();

// GET /api/proveedores?nombre=&categoriaId=&pagina=
router.get('/', async (req, res) => {
  // si un filtro no viene se manda null y el SP no lo toma en cuenta
  let nombre = req.query.nombre || null;
  let categoriaId = req.query.categoriaId || null;
  let pagina = req.query.pagina || 1;

  if (!esEntero(pagina) || Number(pagina) < 1) {
    return res.status(400).json({ mensaje: 'La página debe ser un número entero mayor que cero.' });
  }

  if (categoriaId !== null) {
    if (!esEntero(categoriaId)) {
      return res.status(400).json({ mensaje: 'La categoría debe ser un número entero.' });
    }
    categoriaId = Number(categoriaId);
  }

  const filas = await ejecutarSP('dbo.usp_Proveedores_Listar', {
    Nombre: nombre,
    CategoriaID: categoriaId,
    Pagina: Number(pagina)
  });

  res.json(filas);
});

// GET /api/proveedores/5
router.get('/:id', async (req, res) => {
  if (!esEntero(req.params.id)) {
    return res.status(400).json({ mensaje: 'El código del proveedor debe ser un número entero.' });
  }

  const filas = await ejecutarSP('dbo.usp_Proveedores_Detalle', {
    ProveedorID: Number(req.params.id)
  });

  if (filas.length === 0) {
    return res.status(404).json({ mensaje: 'No existe un proveedor con ese código.' });
  }

  res.json(filas[0]);
});

module.exports = router;

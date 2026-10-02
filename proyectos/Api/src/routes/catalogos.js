const express = require('express');
const { ejecutarSP } = require('../db');

const router = express.Router();

// Catalogos para llenar los selects de los filtros

router.get('/categorias-cliente', async (req, res) => {
  res.json(await ejecutarSP('dbo.usp_Catalogo_CategoriasCliente'));
});

router.get('/metodos-entrega', async (req, res) => {
  res.json(await ejecutarSP('dbo.usp_Catalogo_MetodosEntrega'));
});

module.exports = router;

const express = require('express');
const { ejecutarSP } = require('../db');

const router = express.Router();

// Catalogos para llenar los selects de los filtros y formularios

router.get('/categorias-cliente', async (req, res) => {
  res.json(await ejecutarSP('dbo.usp_Catalogo_CategoriasCliente'));
});

router.get('/metodos-entrega', async (req, res) => {
  res.json(await ejecutarSP('dbo.usp_Catalogo_MetodosEntrega'));
});

router.get('/grupos-compra', async (req, res) => {
  res.json(await ejecutarSP('dbo.usp_Catalogo_GruposCompra'));
});

router.get('/categorias-proveedor', async (req, res) => {
  res.json(await ejecutarSP('dbo.usp_Catalogo_CategoriasProveedor'));
});

// Buscadores: reciben ?texto= y devuelven las primeras 20 coincidencias.
// Si el texto tiene menos de 2 letras no se consulta la base.

router.get('/ciudades', async (req, res) => {
  const texto = req.query.texto || '';
  if (texto.length < 2) {
    return res.json([]);
  }
  res.json(await ejecutarSP('dbo.usp_Catalogo_BuscarCiudades', { Texto: texto }));
});

router.get('/personas', async (req, res) => {
  const texto = req.query.texto || '';
  if (texto.length < 2) {
    return res.json([]);
  }
  res.json(await ejecutarSP('dbo.usp_Catalogo_BuscarPersonas', { Texto: texto }));
});

router.get('/clientes', async (req, res) => {
  const texto = req.query.texto || '';
  if (texto.length < 2) {
    return res.json([]);
  }
  res.json(await ejecutarSP('dbo.usp_Catalogo_BuscarClientes', { Texto: texto }));
});

module.exports = router;

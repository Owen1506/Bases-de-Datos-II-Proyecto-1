// Se usa el mismo .env de la raiz del repo (el que usa docker compose)
require('dotenv').config({ path: __dirname + '/../../../.env' });

const express = require('express');
const cors = require('cors');

const clientes = require('./routes/clientes');
const catalogos = require('./routes/catalogos');

const app = express();
const PUERTO = 3000;

app.use(cors());

app.use('/api/clientes', clientes);
app.use('/api/catalogos', catalogos);

// Si la ruta no existe
app.use((req, res) => {
  res.status(404).json({ mensaje: 'Ruta no encontrada.' });
});

// Si algo falla en una ruta (por ejemplo la base no responde) cae aqui
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ mensaje: 'Ocurrió un error al consultar la base de datos.' });
});

app.listen(PUERTO, () => {
  console.log('API escuchando en http://localhost:' + PUERTO);
});

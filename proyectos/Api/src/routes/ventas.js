const express = require('express');
const { ejecutarSP } = require('../db');
const { esEntero } = require('../validar');

const router = express.Router();

// Revisa que una fecha venga como AAAA-MM-DD y sea una fecha real
function fechaValida(texto) {
  return texto.length === 10 && !isNaN(new Date(texto).getTime());
}

// Revisa que un monto sea un numero mayor o igual a cero
function montoValido(texto) {
  return !isNaN(Number(texto)) && Number(texto) >= 0;
}

// GET /api/ventas?cliente=&fechaInicio=&fechaFin=&montoMin=&montoMax=&pagina=
router.get('/', async (req, res) => {
  // si un filtro no viene se manda null y el SP no lo toma en cuenta
  const cliente = req.query.cliente || null;
  const fechaInicio = req.query.fechaInicio || null;
  const fechaFin = req.query.fechaFin || null;
  let montoMin = req.query.montoMin || null;
  let montoMax = req.query.montoMax || null;
  const pagina = req.query.pagina || 1;

  if (!esEntero(pagina) || Number(pagina) < 1) {
    return res.status(400).json({ mensaje: 'La página debe ser un número entero mayor que cero.' });
  }

  if (fechaInicio !== null && !fechaValida(fechaInicio)) {
    return res.status(400).json({ mensaje: 'La fecha inicial no es válida.' });
  }
  if (fechaFin !== null && !fechaValida(fechaFin)) {
    return res.status(400).json({ mensaje: 'La fecha final no es válida.' });
  }

  if (montoMin !== null) {
    if (!montoValido(montoMin)) {
      return res.status(400).json({ mensaje: 'El monto mínimo debe ser un número mayor o igual a cero.' });
    }
    montoMin = Number(montoMin);
  }
  if (montoMax !== null) {
    if (!montoValido(montoMax)) {
      return res.status(400).json({ mensaje: 'El monto máximo debe ser un número mayor o igual a cero.' });
    }
    montoMax = Number(montoMax);
  }

  // los rangos (fecha inicial <= final, monto minimo <= maximo) los revisa el SP
  const filas = await ejecutarSP('dbo.usp_Ventas_Listar', {
    NombreCliente: cliente,
    FechaInicio: fechaInicio,
    FechaFin: fechaFin,
    MontoMin: montoMin,
    MontoMax: montoMax,
    Pagina: Number(pagina)
  });

  res.json(filas);
});

// GET /api/ventas/5  (devuelve el encabezado y las lineas de la factura)
router.get('/:id', async (req, res) => {
  if (!esEntero(req.params.id)) {
    return res.status(400).json({ mensaje: 'El número de factura debe ser un número entero.' });
  }

  const encabezado = await ejecutarSP('dbo.usp_Ventas_Detalle', { FacturaID: Number(req.params.id) });

  if (encabezado.length === 0) {
    return res.status(404).json({ mensaje: 'No existe una factura con ese número.' });
  }

  const lineas = await ejecutarSP('dbo.usp_Ventas_DetalleLineas', { FacturaID: Number(req.params.id) });

  res.json({ encabezado: encabezado[0], lineas: lineas });
});

module.exports = router;

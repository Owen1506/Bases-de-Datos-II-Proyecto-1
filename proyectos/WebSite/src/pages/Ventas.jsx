import { useEffect, useState } from 'react';
import { consultar } from '../api';
import { formatoFecha, formatoMonto } from '../formato';
import Buscador from '../components/Buscador';
import DetalleVenta from '../components/DetalleVenta';
import Paginacion from '../components/Paginacion';

// Cantidad de facturas por pagina. Debe ser igual al @TamanoPagina del SP.
const TAMANO_PAGINA = 10;

const FILTROS_VACIOS = { cliente: '', fechaInicio: '', fechaFin: '', montoMin: '', montoMax: '' };

function Ventas() {
  // lo que el usuario va escribiendo en los filtros
  const [cliente, setCliente] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [montoMin, setMontoMin] = useState('');
  const [montoMax, setMontoMax] = useState('');

  // filtros de la ultima busqueda, se usan al cambiar de pagina
  const [filtrosAplicados, setFiltrosAplicados] = useState(FILTROS_VACIOS);

  const [ventas, setVentas] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  // factura seleccionada en la tabla (null = ventana de detalle cerrada)
  const [facturaId, setFacturaId] = useState(null);

  // cambia cada vez que se restauran los filtros, para vaciar el buscador de cliente
  const [reinicios, setReinicios] = useState(0);

  // Le pide a la API una pagina de facturas con los filtros indicados.
  // El filtrado, el orden y la paginacion los hace el stored procedure.
  async function buscar(filtros, numeroPagina) {
    let ruta = '/ventas?pagina=' + numeroPagina;
    if (filtros.cliente.trim() !== '') {
      ruta += '&cliente=' + encodeURIComponent(filtros.cliente.trim());
    }
    if (filtros.fechaInicio !== '') ruta += '&fechaInicio=' + filtros.fechaInicio;
    if (filtros.fechaFin !== '') ruta += '&fechaFin=' + filtros.fechaFin;
    if (filtros.montoMin !== '') ruta += '&montoMin=' + filtros.montoMin;
    if (filtros.montoMax !== '') ruta += '&montoMax=' + filtros.montoMax;

    setCargando(true);
    setError('');
    try {
      const datos = await consultar(ruta);
      setVentas(datos);
      // el total viene repetido en cada fila; si no hay filas es 0
      if (datos.length > 0) {
        setTotal(datos[0].TotalRegistros);
      } else {
        setTotal(0);
      }
      setFiltrosAplicados(filtros);
      setPagina(numeroPagina);
    } catch (e) {
      setVentas([]);
      setTotal(0);
      setError(e.message);
    }
    setCargando(false);
  }

  // Al abrir la pagina se carga la primera pagina de facturas
  useEffect(() => {
    buscar(FILTROS_VACIOS, 1);
  }, []);

  // Revisa los rangos antes de buscar. Devuelve el mensaje de error o '' si todo esta bien.
  function validarFiltros() {
    if (fechaInicio !== '' && fechaFin !== '' && fechaInicio > fechaFin) {
      return 'La fecha inicial no puede ser mayor que la fecha final.';
    }
    if (montoMin !== '' && Number(montoMin) < 0) return 'El monto mínimo no puede ser negativo.';
    if (montoMax !== '' && Number(montoMax) < 0) return 'El monto máximo no puede ser negativo.';
    if (montoMin !== '' && montoMax !== '' && Number(montoMin) > Number(montoMax)) {
      return 'El monto mínimo no puede ser mayor que el monto máximo.';
    }
    return '';
  }

  // Una busqueda nueva siempre empieza en la pagina 1
  function alBuscar(evento) {
    evento.preventDefault(); // evita que el formulario recargue la pagina

    const mensajeError = validarFiltros();
    if (mensajeError !== '') {
      setError(mensajeError);
      return;
    }

    buscar({ cliente, fechaInicio, fechaFin, montoMin, montoMax }, 1);
  }

  function restaurar() {
    setCliente('');
    setFechaInicio('');
    setFechaFin('');
    setMontoMin('');
    setMontoMax('');
    setReinicios(reinicios + 1);
    buscar(FILTROS_VACIOS, 1);
  }

  // Cambiar de pagina mantiene los filtros de la ultima busqueda
  function cambiarPagina(numero) {
    buscar(filtrosAplicados, numero);
  }

  return (
    <>
      <h2>Ventas</h2>
      <p className="descripcion">Busque facturas y haga clic en una para ver su detalle.</p>

      <div className="modulo-columnas">
        {/* Panel izquierdo: filtros */}
        <form className="panel panel-filtros" onSubmit={alBuscar}>
          <h3>Filtros</h3>

          {/* Texto libre con sugerencias: no hace falta elegir una, se busca con lo escrito.
              El key cambia al restaurar los filtros y eso vacia el campo */}
          <Buscador
            key={reinicios}
            etiqueta="Nombre del cliente"
            ruta="/catalogos/clientes"
            campoId="ClienteID"
            campoTexto="Cliente"
            textoInicial=""
            placeholder="Escriba parte del nombre"
            alElegir={(id, texto) => setCliente(texto)}
          />

          {/* Rango de fechas */}
          <div className="rango">
            <label>
              Fecha desde
              <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
            </label>
            <label>
              Fecha hasta
              <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
            </label>
          </div>

          {/* Rango de montos */}
          <div className="rango">
            <label>
              Monto mínimo
              <input type="number" min="0" step="0.01" value={montoMin} onChange={(e) => setMontoMin(e.target.value)} />
            </label>
            <label>
              Monto máximo
              <input type="number" min="0" step="0.01" value={montoMax} onChange={(e) => setMontoMax(e.target.value)} />
            </label>
          </div>

          <button type="submit" className="boton">Buscar</button>
          <button type="button" className="boton secundario" onClick={restaurar}>
            Restaurar filtros
          </button>
        </form>

        {/* Area principal: tabla y paginacion */}
        <div className="panel panel-resultados">
          {error !== '' && <div className="mensaje error">{error}</div>}

          {cargando && <div className="mensaje">Cargando...</div>}

          {!cargando && error === '' && ventas.length === 0 && (
            <div className="mensaje info">No se encontraron facturas con esos filtros.</div>
          )}

          {!cargando && ventas.length > 0 && (
            <>
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Factura</th>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Método de entrega</th>
                    <th className="numero">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {ventas.map((v) => (
                    <tr key={v.FacturaID} onClick={() => setFacturaId(v.FacturaID)}>
                      <td>#{v.FacturaID}</td>
                      <td>{formatoFecha(v.Fecha)}</td>
                      <td>{v.Cliente}</td>
                      <td>{v.MetodoEntrega}</td>
                      <td className="numero">{formatoMonto(v.Monto)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <Paginacion
                pagina={pagina}
                total={total}
                tamano={TAMANO_PAGINA}
                cantidadFilas={ventas.length}
                elementos="facturas"
                alCambiar={cambiarPagina}
              />
            </>
          )}
        </div>
      </div>

      {facturaId !== null && (
        <DetalleVenta facturaId={facturaId} alCerrar={() => setFacturaId(null)} />
      )}
    </>
  );
}

export default Ventas;

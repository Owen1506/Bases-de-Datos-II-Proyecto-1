import { useEffect, useState } from 'react';
import { consultar, enviar } from '../api';
import DetalleCliente from '../components/DetalleCliente';
import FormularioCliente from '../components/FormularioCliente';
import Paginacion from '../components/Paginacion';

// Cantidad de clientes por pagina. Debe ser igual al @TamanoPagina por defecto del SP.
const TAMANO_PAGINA = 10;

const FILTROS_VACIOS = { nombre: '', categoriaId: '', metodoEntregaId: '' };

// Iconos de los botones de editar y eliminar (dibujados con SVG)
const ICONO_LAPIZ = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);
const ICONO_BASURERO = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

function Clientes() {
  // lo que el usuario va escribiendo en los filtros
  const [nombre, setNombre] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [metodoEntregaId, setMetodoEntregaId] = useState('');

  // filtros de la ultima busqueda, se usan al cambiar de pagina
  const [filtrosAplicados, setFiltrosAplicados] = useState(FILTROS_VACIOS);

  const [categorias, setCategorias] = useState([]);
  const [metodos, setMetodos] = useState([]);

  const [clientes, setClientes] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  // cliente seleccionado en la tabla (null = ventana de detalle cerrada)
  const [clienteId, setClienteId] = useState(null);

  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [clienteEditarId, setClienteEditarId] = useState(null); // null = cliente nuevo

  const [exito, setExito] = useState('');

  async function cargarCatalogos() {
    try {
      setCategorias(await consultar('/catalogos/categorias-cliente'));
      setMetodos(await consultar('/catalogos/metodos-entrega'));
    } catch (e) {
      setError(e.message);
    }
  }

  // Le pide a la API una pagina de clientes con los filtros indicados.
  // El filtrado, el orden y la paginacion los hace el stored procedure.
  async function buscar(filtros, numeroPagina) {
    let ruta = '/clientes?pagina=' + numeroPagina;
    if (filtros.nombre.trim() !== '') {
      ruta += '&nombre=' + encodeURIComponent(filtros.nombre.trim());
    }
    if (filtros.categoriaId !== '') {
      ruta += '&categoriaId=' + filtros.categoriaId;
    }
    if (filtros.metodoEntregaId !== '') {
      ruta += '&metodoEntregaId=' + filtros.metodoEntregaId;
    }

    setCargando(true);
    setError('');
    try {
      const datos = await consultar(ruta);
      setClientes(datos);
      // el total viene repetido en cada fila; si no hay filas es 0
      if (datos.length > 0) {
        setTotal(datos[0].TotalRegistros);
      } else {
        setTotal(0);
      }
      setFiltrosAplicados(filtros);
      setPagina(numeroPagina);
    } catch (e) {
      setClientes([]);
      setTotal(0);
      setError(e.message);
    }
    setCargando(false);
  }

  // Al abrir la pagina se cargan los selects y la primera pagina de clientes
  useEffect(() => {
    cargarCatalogos();
    buscar(FILTROS_VACIOS, 1);
  }, []);

  // Una busqueda nueva siempre empieza en la pagina 1
  function alBuscar(evento) {
    evento.preventDefault(); // evita que el formulario recargue la pagina
    setExito('');
    buscar({ nombre: nombre, categoriaId: categoriaId, metodoEntregaId: metodoEntregaId }, 1);
  }

  function restaurar() {
    setNombre('');
    setCategoriaId('');
    setMetodoEntregaId('');
    setExito('');
    buscar(FILTROS_VACIOS, 1);
  }

  // Cambiar de pagina mantiene los filtros de la ultima busqueda
  function cambiarPagina(numero) {
    buscar(filtrosAplicados, numero);
  }

  function abrirNuevo() {
    setClienteEditarId(null);
    setFormularioAbierto(true);
  }

  function abrirEditar(evento, id) {
    evento.stopPropagation(); // evita que el clic tambien abra el detalle
    setClienteEditarId(id);
    setFormularioAbierto(true);
  }

  // Cuando el formulario guarda bien: se cierra, se muestra el mensaje y se recarga la tabla
  function alGuardar(mensaje) {
    setFormularioAbierto(false);
    setExito(mensaje);
    buscar(filtrosAplicados, pagina);
  }

  async function eliminar(evento, cliente) {
    evento.stopPropagation(); // evita que el clic tambien abra el detalle

    if (!window.confirm('¿Seguro que desea eliminar a "' + cliente.Nombre + '"?')) {
      return;
    }

    setExito('');
    try {
      const respuesta = await enviar('/clientes/' + cliente.ClienteID, 'DELETE', {});
      setExito(respuesta.mensaje);
      buscar(filtrosAplicados, pagina);
    } catch (e) {
      // por ejemplo: "No se puede eliminar el cliente porque tiene registros asociados."
      setError(e.message);
    }
  }

  return (
    <>
      <div className="titulo-modulo">
        <div>
          <h2>Clientes</h2>
          <p className="descripcion">Busque clientes y haga clic en uno para ver su detalle.</p>
        </div>
        <button className="boton" onClick={abrirNuevo}>+ Nuevo cliente</button>
      </div>

      <div className="modulo-columnas">
        {/* Panel izquierdo: filtros */}
        <form className="panel panel-filtros" onSubmit={alBuscar}>
          <h3>Filtros</h3>

          <label>
            Nombre del cliente
            <input
              type="text"
              value={nombre}
              maxLength={100}
              placeholder="Escriba parte del nombre"
              onChange={(e) => setNombre(e.target.value)}
            />
          </label>

          <label>
            Categoría
            <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
              <option value="">Todas</option>
              {categorias.map((c) => (
                <option key={c.CategoriaID} value={c.CategoriaID}>
                  {c.Categoria}
                </option>
              ))}
            </select>
          </label>

          <label>
            Método de entrega
            <select value={metodoEntregaId} onChange={(e) => setMetodoEntregaId(e.target.value)}>
              <option value="">Todos</option>
              {metodos.map((m) => (
                <option key={m.MetodoEntregaID} value={m.MetodoEntregaID}>
                  {m.MetodoEntrega}
                </option>
              ))}
            </select>
          </label>

          <button type="submit" className="boton">Buscar</button>
          <button type="button" className="boton secundario" onClick={restaurar}>
            Restaurar filtros
          </button>
        </form>

        {/* Area principal: tabla y paginacion */}
        <div className="panel panel-resultados">
          {exito !== '' && <div className="mensaje exito">{exito}</div>}

          {error !== '' && <div className="mensaje error">{error}</div>}

          {cargando && <div className="mensaje">Cargando...</div>}

          {!cargando && error === '' && clientes.length === 0 && (
            <div className="mensaje info">No se encontraron clientes con esos filtros.</div>
          )}

          {!cargando && clientes.length > 0 && (
            <>
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>Método de entrega</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((c) => (
                    <tr key={c.ClienteID} onClick={() => setClienteId(c.ClienteID)}>
                      <td>{c.Nombre}</td>
                      <td>
                        <span className="badge">
                          {c.Categoria}
                        </span>
                      </td>
                      <td>{c.MetodoEntrega}</td>
                      {/* estos botones solo se ven al pasar el mouse por la fila (ver styles/tabla.css) */}
                      <td className="acciones">
                        <button className="boton-icono" title="Editar" onClick={(e) => abrirEditar(e, c.ClienteID)}>
                          {ICONO_LAPIZ}
                        </button>
                        <button className="boton-icono peligro" title="Eliminar" onClick={(e) => eliminar(e, c)}>
                          {ICONO_BASURERO}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <Paginacion
                pagina={pagina}
                total={total}
                tamano={TAMANO_PAGINA}
                cantidadFilas={clientes.length}
                elementos="clientes"
                alCambiar={cambiarPagina}
              />
            </>
          )}
        </div>
      </div>

      {clienteId !== null && (
        <DetalleCliente clienteId={clienteId} alCerrar={() => setClienteId(null)} />
      )}

      {formularioAbierto && (
        <FormularioCliente
          clienteId={clienteEditarId}
          alCerrar={() => setFormularioAbierto(false)}
          alGuardar={alGuardar}
        />
      )}
    </>
  );
}

export default Clientes;

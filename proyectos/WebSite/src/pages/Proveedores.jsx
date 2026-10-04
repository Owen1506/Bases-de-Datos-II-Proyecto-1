import { useEffect, useState } from 'react';
import { consultar } from '../api';
import DetalleProveedor from '../components/DetalleProveedor';
import Paginacion from '../components/Paginacion';

// Cantidad de proveedores por pagina. Debe ser igual al @TamanoPagina del SP.
const TAMANO_PAGINA = 10;

const FILTROS_VACIOS = { nombre: '', categoriaId: '' };

function Proveedores() {
  // lo que el usuario va escribiendo en los filtros
  const [nombre, setNombre] = useState('');
  const [categoriaId, setCategoriaId] = useState('');

  // filtros de la ultima busqueda, se usan al cambiar de pagina
  const [filtrosAplicados, setFiltrosAplicados] = useState(FILTROS_VACIOS);

  const [categorias, setCategorias] = useState([]);

  const [proveedores, setProveedores] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  // proveedor seleccionado en la tabla (null = ventana de detalle cerrada)
  const [proveedorId, setProveedorId] = useState(null);

  async function cargarCategorias() {
    try {
      setCategorias(await consultar('/catalogos/categorias-proveedor'));
    } catch (e) {
      setError(e.message);
    }
  }

  // Le pide a la API una pagina de proveedores con los filtros indicados.
  // El filtrado, el orden y la paginacion los hace el stored procedure.
  async function buscar(filtros, numeroPagina) {
    let ruta = '/proveedores?pagina=' + numeroPagina;
    if (filtros.nombre.trim() !== '') {
      ruta += '&nombre=' + encodeURIComponent(filtros.nombre.trim());
    }
    if (filtros.categoriaId !== '') {
      ruta += '&categoriaId=' + filtros.categoriaId;
    }

    setCargando(true);
    setError('');
    try {
      const datos = await consultar(ruta);
      setProveedores(datos);
      // el total viene repetido en cada fila; si no hay filas es 0
      if (datos.length > 0) {
        setTotal(datos[0].TotalRegistros);
      } else {
        setTotal(0);
      }
      setFiltrosAplicados(filtros);
      setPagina(numeroPagina);
    } catch (e) {
      setProveedores([]);
      setTotal(0);
      setError(e.message);
    }
    setCargando(false);
  }

  // Al abrir la pagina se carga el select y la primera pagina de proveedores
  useEffect(() => {
    cargarCategorias();
    buscar(FILTROS_VACIOS, 1);
  }, []);

  // Una busqueda nueva siempre empieza en la pagina 1
  function alBuscar(evento) {
    evento.preventDefault(); // evita que el formulario recargue la pagina
    buscar({ nombre: nombre, categoriaId: categoriaId }, 1);
  }

  function restaurar() {
    setNombre('');
    setCategoriaId('');
    buscar(FILTROS_VACIOS, 1);
  }

  // Cambiar de pagina mantiene los filtros de la ultima busqueda
  function cambiarPagina(numero) {
    buscar(filtrosAplicados, numero);
  }

  return (
    <>
      <h2>Proveedores</h2>
      <p className="descripcion">Busque proveedores y haga clic en uno para ver su detalle.</p>

      <div className="modulo-columnas">
        {/* Panel izquierdo: filtros */}
        <form className="panel panel-filtros" onSubmit={alBuscar}>
          <h3>Filtros</h3>

          <label>
            Nombre del proveedor
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

          <button type="submit" className="boton">Buscar</button>
          <button type="button" className="boton secundario" onClick={restaurar}>
            Restaurar filtros
          </button>
        </form>

        {/* Area principal: tabla y paginacion */}
        <div className="panel panel-resultados">
          {error !== '' && <div className="mensaje error">{error}</div>}

          {cargando && <div className="mensaje">Cargando...</div>}

          {!cargando && error === '' && proveedores.length === 0 && (
            <div className="mensaje info">No se encontraron proveedores con esos filtros.</div>
          )}

          {!cargando && proveedores.length > 0 && (
            <>
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>Método de entrega</th>
                  </tr>
                </thead>
                <tbody>
                  {proveedores.map((p) => (
                    <tr key={p.ProveedorID} onClick={() => setProveedorId(p.ProveedorID)}>
                      <td>{p.Nombre}</td>
                      <td>
                        <span className="badge">{p.Categoria}</span>
                      </td>
                      <td>{p.MetodoEntrega ? p.MetodoEntrega : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <Paginacion
                pagina={pagina}
                total={total}
                tamano={TAMANO_PAGINA}
                cantidadFilas={proveedores.length}
                elementos="proveedores"
                alCambiar={cambiarPagina}
              />
            </>
          )}
        </div>
      </div>

      {proveedorId !== null && (
        <DetalleProveedor proveedorId={proveedorId} alCerrar={() => setProveedorId(null)} />
      )}
    </>
  );
}

export default Proveedores;

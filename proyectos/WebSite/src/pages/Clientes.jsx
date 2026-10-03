import { useEffect, useState } from 'react';
import { consultar } from '../api';
import DetalleCliente from '../components/DetalleCliente';

function Clientes() {
  // filtros
  const [nombre, setNombre] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [metodoEntregaId, setMetodoEntregaId] = useState('');

  // opciones de los selects
  const [categorias, setCategorias] = useState([]);
  const [metodos, setMetodos] = useState([]);

  // resultados
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  // cliente seleccionado en la tabla (null = ventana de detalle cerrada)
  const [clienteId, setClienteId] = useState(null);

  async function cargarCatalogos() {
    try {
      setCategorias(await consultar('/catalogos/categorias-cliente'));
      setMetodos(await consultar('/catalogos/metodos-entrega'));
    } catch (e) {
      setError(e.message);
    }
  }

  // Le pide los clientes a la API con los filtros que se le pasan.
  // El filtrado lo hace el stored procedure, aqui solo se mandan los parametros.
  async function buscar(filtroNombre, filtroCategoria, filtroMetodo) {
    let ruta = '/clientes?';
    if (filtroNombre.trim() !== '') {
      ruta += 'nombre=' + encodeURIComponent(filtroNombre.trim()) + '&';
    }
    if (filtroCategoria !== '') {
      ruta += 'categoriaId=' + filtroCategoria + '&';
    }
    if (filtroMetodo !== '') {
      ruta += 'metodoEntregaId=' + filtroMetodo;
    }

    setCargando(true);
    setError('');
    try {
      setClientes(await consultar(ruta));
    } catch (e) {
      setClientes([]);
      setError(e.message);
    }
    setCargando(false);
  }

  // Al abrir la pagina se cargan los selects y todos los clientes
  useEffect(() => {
    cargarCatalogos();
    buscar('', '', '');
  }, []);

  function alBuscar(evento) {
    evento.preventDefault(); // evita que el formulario recargue la pagina
    buscar(nombre, categoriaId, metodoEntregaId);
  }

  function restaurar() {
    setNombre('');
    setCategoriaId('');
    setMetodoEntregaId('');
    buscar('', '', '');
  }

  return (
    <>
      <h2>Clientes</h2>
      <p className="descripcion">Busque clientes por nombre, categoría o método de entrega.</p>

      <form className="filtros" onSubmit={alBuscar}>
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

        <div className="botones">
          <button type="submit" className="boton">Buscar</button>
          <button type="button" className="boton secundario" onClick={restaurar}>
            Restaurar filtros
          </button>
        </div>
      </form>

      {error !== '' && <div className="mensaje error">{error}</div>}

      {cargando && <div className="mensaje">Cargando...</div>}

      {!cargando && error === '' && clientes.length === 0 && (
        <div className="mensaje info">No se encontraron clientes con esos filtros.</div>
      )}

      {!cargando && clientes.length > 0 && (
        <>
          <p className="total">
            {clientes.length} clientes encontrados. Haga clic en uno para ver su detalle.
          </p>

          <div className="tabla-contenedor">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Método de entrega</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((c) => (
                  <tr key={c.ClienteID} onClick={() => setClienteId(c.ClienteID)}>
                    <td>{c.Nombre}</td>
                    <td>{c.Categoria}</td>
                    <td>{c.MetodoEntrega}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {clienteId !== null && (
        <DetalleCliente clienteId={clienteId} alCerrar={() => setClienteId(null)} />
      )}
    </>
  );
}

export default Clientes;

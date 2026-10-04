import { useEffect, useState } from 'react';
import { consultar, enviar } from '../api';
import Buscador from './Buscador';

// Valores de un formulario vacio (cliente nuevo)
const DATOS_VACIOS = {
  Nombre: '',
  CategoriaID: '',
  GrupoCompraID: '',
  ClienteFacturarID: null,
  MetodoEntregaID: '',
  DiasPago: '',
  ContactoPrimarioID: null,
  ContactoAlternativoID: null,
  Telefono: '',
  Fax: '',
  SitioWeb: '',
  DireccionEntrega1: '',
  DireccionEntrega2: '',
  CiudadEntregaID: null,
  CodigoPostalEntrega: '',
  DireccionPostal1: '',
  DireccionPostal2: '',
  CiudadPostalID: null,
  CodigoPostalPostal: '',
  Latitud: '',
  Longitud: ''
};

// Ventana con el formulario de cliente.
// Si clienteId es null se crea un cliente nuevo; si tiene valor se edita ese cliente.
function FormularioCliente({ clienteId, alCerrar, alGuardar }) {
  const esNuevo = clienteId === null;

  const [datos, setDatos] = useState(DATOS_VACIOS);
  // textos que se muestran en los buscadores al editar (nombre de la ciudad, persona...)
  const [textos, setTextos] = useState({});

  const [categorias, setCategorias] = useState([]);
  const [metodos, setMetodos] = useState([]);
  const [grupos, setGrupos] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  // Carga los selects y, si se esta editando, los datos actuales del cliente
  async function cargar() {
    try {
      setCategorias(await consultar('/catalogos/categorias-cliente'));
      setMetodos(await consultar('/catalogos/metodos-entrega'));
      setGrupos(await consultar('/catalogos/grupos-compra'));

      if (!esNuevo) {
        const c = await consultar('/clientes/' + clienteId);
        setDatos({
          Nombre: c.Nombre,
          CategoriaID: c.CategoriaID,
          GrupoCompraID: c.GrupoCompraID === null ? '' : c.GrupoCompraID,
          // si se factura a si mismo el campo queda vacio
          ClienteFacturarID: c.ClienteFacturarID === c.ClienteID ? null : c.ClienteFacturarID,
          MetodoEntregaID: c.MetodoEntregaID,
          DiasPago: c.DiasPago,
          ContactoPrimarioID: c.ContactoPrimarioID,
          ContactoAlternativoID: c.ContactoAlternativoID,
          Telefono: c.Telefono,
          Fax: c.Fax,
          SitioWeb: c.SitioWeb,
          DireccionEntrega1: c.DireccionEntrega1,
          DireccionEntrega2: c.DireccionEntrega2 === null ? '' : c.DireccionEntrega2,
          CiudadEntregaID: c.CiudadEntregaID,
          CodigoPostalEntrega: c.CodigoPostalEntrega,
          DireccionPostal1: c.DireccionPostal1,
          DireccionPostal2: c.DireccionPostal2 === null ? '' : c.DireccionPostal2,
          CiudadPostalID: c.CiudadPostalID,
          CodigoPostalPostal: c.CodigoPostalPostal,
          Latitud: c.Latitud === null ? '' : c.Latitud,
          Longitud: c.Longitud === null ? '' : c.Longitud
        });
        setTextos({
          ClienteFacturar: c.ClienteFacturarID === c.ClienteID ? '' : c.ClienteFacturar,
          ContactoPrimario: c.ContactoPrimario,
          ContactoAlternativo: c.ContactoAlternativo === null ? '' : c.ContactoAlternativo,
          CiudadEntrega: c.CiudadEntrega + ', ' + c.ProvinciaEntrega,
          CiudadPostal: c.CiudadPostal + ', ' + c.ProvinciaPostal
        });
      }
    } catch (e) {
      setError(e.message);
    }
    setCargando(false);
  }

  useEffect(() => {
    cargar();
  }, []);

  // Cambia un solo campo del formulario y deja los demas igual
  function cambiar(campo, valor) {
    setDatos({ ...datos, [campo]: valor });
  }

  // Revisa los datos antes de enviarlos. Devuelve el mensaje de error o '' si todo esta bien.
  function validar() {
    if (datos.Nombre.trim() === '') return 'Escriba el nombre del cliente.';
    if (datos.CategoriaID === '') return 'Seleccione una categoría.';
    if (datos.MetodoEntregaID === '') return 'Seleccione un método de entrega.';
    if (datos.DiasPago === '' || Number(datos.DiasPago) < 0) return 'Los días de gracia deben ser 0 o más.';
    if (datos.ContactoPrimarioID === null) return 'Elija de la lista el contacto primario.';
    if (datos.Telefono.trim() === '') return 'Escriba el teléfono.';
    if (datos.Fax.trim() === '') return 'Escriba el fax.';
    if (datos.SitioWeb.trim() === '') return 'Escriba el sitio web.';
    if (datos.DireccionEntrega1.trim() === '') return 'Escriba la dirección de entrega.';
    if (datos.CiudadEntregaID === null) return 'Elija de la lista la ciudad de entrega.';
    if (datos.CodigoPostalEntrega.trim() === '') return 'Escriba el código postal de entrega.';
    if (datos.DireccionPostal1.trim() === '') return 'Escriba la dirección postal.';
    if (datos.CiudadPostalID === null) return 'Elija de la lista la ciudad postal.';
    if (datos.CodigoPostalPostal.trim() === '') return 'Escriba el código postal de la dirección postal.';
    if ((datos.Latitud === '') !== (datos.Longitud === '')) return 'Escriba la latitud y la longitud, o deje ambas vacías.';
    return '';
  }

  async function guardar(evento) {
    evento.preventDefault();

    const mensajeError = validar();
    if (mensajeError !== '') {
      setError(mensajeError);
      return;
    }

    setGuardando(true);
    setError('');
    try {
      let respuesta;
      if (esNuevo) {
        respuesta = await enviar('/clientes', 'POST', datos);
      } else {
        respuesta = await enviar('/clientes/' + clienteId, 'PUT', datos);
      }
      alGuardar(respuesta.mensaje);
    } catch (e) {
      // errores de la API o del SP, por ejemplo "Ya existe un cliente con ese nombre."
      setError(e.message);
    }
    setGuardando(false);
  }

  return (
    <div className="fondo-ventana">
      <form className="ventana ventana-formulario" onSubmit={guardar}>
        <div className="ventana-titulo">
          <h3>{esNuevo ? 'Nuevo cliente' : 'Editar cliente'}</h3>
          <button type="button" className="boton-cerrar" onClick={alCerrar}>✕</button>
        </div>

        <div className="ventana-contenido">
          {error !== '' && <div className="mensaje error">{error}</div>}

          {cargando && <div className="mensaje">Cargando...</div>}

          {!cargando && (
            <>
              <h4>Datos generales</h4>
              <div className="campos">
                <label className="campo-ancho">
                  Nombre *
                  <input type="text" maxLength={100} value={datos.Nombre}
                    onChange={(e) => cambiar('Nombre', e.target.value)} />
                </label>

                <label>
                  Categoría *
                  <select value={datos.CategoriaID} onChange={(e) => cambiar('CategoriaID', e.target.value)}>
                    <option value="">Seleccione...</option>
                    {categorias.map((c) => (
                      <option key={c.CategoriaID} value={c.CategoriaID}>{c.Categoria}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Grupo de compra
                  <select value={datos.GrupoCompraID} onChange={(e) => cambiar('GrupoCompraID', e.target.value)}>
                    <option value="">Ninguno</option>
                    {grupos.map((g) => (
                      <option key={g.GrupoCompraID} value={g.GrupoCompraID}>{g.GrupoCompra}</option>
                    ))}
                  </select>
                </label>

                <Buscador
                  etiqueta="Cliente por facturar"
                  ruta="/catalogos/clientes"
                  campoId="ClienteID"
                  campoTexto="Cliente"
                  textoInicial={textos.ClienteFacturar || ''}
                  alElegir={(id) => cambiar('ClienteFacturarID', id)}
                  ayuda="Déjelo vacío si se factura a sí mismo. Si elige otro, debe ser del mismo grupo de compra."
                />

                <label>
                  Método de entrega *
                  <select value={datos.MetodoEntregaID} onChange={(e) => cambiar('MetodoEntregaID', e.target.value)}>
                    <option value="">Seleccione...</option>
                    {metodos.map((m) => (
                      <option key={m.MetodoEntregaID} value={m.MetodoEntregaID}>{m.MetodoEntrega}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Días de gracia para pagar *
                  <input type="number" min="0" value={datos.DiasPago}
                    onChange={(e) => cambiar('DiasPago', e.target.value)} />
                </label>
              </div>

              <h4>Contacto</h4>
              <div className="campos">
                <Buscador
                  etiqueta="Contacto primario *"
                  ruta="/catalogos/personas"
                  campoId="PersonaID"
                  campoTexto="Persona"
                  textoInicial={textos.ContactoPrimario || ''}
                  alElegir={(id) => cambiar('ContactoPrimarioID', id)}
                />

                <Buscador
                  etiqueta="Contacto alternativo"
                  ruta="/catalogos/personas"
                  campoId="PersonaID"
                  campoTexto="Persona"
                  textoInicial={textos.ContactoAlternativo || ''}
                  alElegir={(id) => cambiar('ContactoAlternativoID', id)}
                />

                <label>
                  Teléfono *
                  <input type="text" maxLength={20} value={datos.Telefono}
                    onChange={(e) => cambiar('Telefono', e.target.value)} />
                </label>

                <label>
                  Fax *
                  <input type="text" maxLength={20} value={datos.Fax}
                    onChange={(e) => cambiar('Fax', e.target.value)} />
                </label>

                <label className="campo-ancho">
                  Sitio web *
                  <input type="text" maxLength={256} placeholder="http://" value={datos.SitioWeb}
                    onChange={(e) => cambiar('SitioWeb', e.target.value)} />
                </label>
              </div>

              <h4>Dirección de entrega</h4>
              <div className="campos">
                <label>
                  Dirección *
                  <input type="text" maxLength={60} value={datos.DireccionEntrega1}
                    onChange={(e) => cambiar('DireccionEntrega1', e.target.value)} />
                </label>

                <label>
                  Dirección (línea 2)
                  <input type="text" maxLength={60} value={datos.DireccionEntrega2}
                    onChange={(e) => cambiar('DireccionEntrega2', e.target.value)} />
                </label>

                <Buscador
                  etiqueta="Ciudad *"
                  ruta="/catalogos/ciudades"
                  campoId="CiudadID"
                  campoTexto="Ciudad"
                  textoInicial={textos.CiudadEntrega || ''}
                  alElegir={(id) => cambiar('CiudadEntregaID', id)}
                />

                <label>
                  Código postal *
                  <input type="text" maxLength={10} value={datos.CodigoPostalEntrega}
                    onChange={(e) => cambiar('CodigoPostalEntrega', e.target.value)} />
                </label>
              </div>

              <h4>Dirección postal</h4>
              <div className="campos">
                <label>
                  Dirección *
                  <input type="text" maxLength={60} value={datos.DireccionPostal1}
                    onChange={(e) => cambiar('DireccionPostal1', e.target.value)} />
                </label>

                <label>
                  Dirección (línea 2)
                  <input type="text" maxLength={60} value={datos.DireccionPostal2}
                    onChange={(e) => cambiar('DireccionPostal2', e.target.value)} />
                </label>

                <Buscador
                  etiqueta="Ciudad *"
                  ruta="/catalogos/ciudades"
                  campoId="CiudadID"
                  campoTexto="Ciudad"
                  textoInicial={textos.CiudadPostal || ''}
                  alElegir={(id) => cambiar('CiudadPostalID', id)}
                />

                <label>
                  Código postal *
                  <input type="text" maxLength={10} value={datos.CodigoPostalPostal}
                    onChange={(e) => cambiar('CodigoPostalPostal', e.target.value)} />
                </label>
              </div>

              <h4>Localización (opcional)</h4>
              <div className="campos">
                <label>
                  Latitud
                  <input type="number" step="any" min="-90" max="90" value={datos.Latitud}
                    onChange={(e) => cambiar('Latitud', e.target.value)} />
                </label>

                <label>
                  Longitud
                  <input type="number" step="any" min="-180" max="180" value={datos.Longitud}
                    onChange={(e) => cambiar('Longitud', e.target.value)} />
                </label>
              </div>
            </>
          )}
        </div>

        <div className="ventana-pie">
          <span className="nota">* Campos obligatorios</span>
          <button type="button" className="boton secundario" onClick={alCerrar}>Cancelar</button>
          <button type="submit" className="boton" disabled={cargando || guardando}>
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default FormularioCliente;

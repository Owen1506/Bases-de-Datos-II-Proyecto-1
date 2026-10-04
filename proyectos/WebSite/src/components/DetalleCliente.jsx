import { useEffect, useState } from 'react';
import { consultar } from '../api';
import Dato from './Dato';
import Mapa from './Mapa';

// Ventana con el detalle de un cliente
function DetalleCliente({ clienteId, alCerrar }) {
  const [cliente, setCliente] = useState(null);
  const [error, setError] = useState('');

  async function cargar() {
    try {
      setCliente(await consultar('/clientes/' + clienteId));
    } catch (e) {
      setError(e.message);
    }
  }

  // Cuando se abre la ventana se piden los datos del cliente
  useEffect(() => {
    cargar();
  }, []);

  return (
    // al hacer clic en el fondo oscuro se cierra la ventana
    <div className="fondo-ventana" onClick={alCerrar}>
      {/* stopPropagation evita que un clic dentro de la ventana la cierre */}
      <div className="ventana" onClick={(e) => e.stopPropagation()}>
        <div className="ventana-titulo">
          <div>
            <h3>{cliente ? cliente.Nombre : 'Detalle del cliente'}</h3>
            {cliente !== null && (
              <span className="ventana-subtitulo">
                {cliente.Categoria}
                {cliente.GrupoCompra && ' · ' + cliente.GrupoCompra}
              </span>
            )}
          </div>
          <button className="boton-cerrar" onClick={alCerrar}>✕</button>
        </div>

        <div className="ventana-contenido">
          {error !== '' && <div className="mensaje error">{error}</div>}

          {cliente === null && error === '' && <div className="mensaje">Cargando...</div>}

          {cliente !== null && (
            <>
              <h4>General</h4>
              <Dato etiqueta="Grupo de compra" valor={cliente.GrupoCompra} />
              <Dato etiqueta="Cliente por facturar" valor={cliente.ClienteFacturar} />
              <Dato etiqueta="Método de entrega" valor={cliente.MetodoEntrega} />
              <Dato etiqueta="Días de gracia para pagar" valor={cliente.DiasPago} />
              <Dato etiqueta="Teléfono" valor={cliente.Telefono} />
              <Dato etiqueta="Fax" valor={cliente.Fax} />
              <Dato
                etiqueta="Sitio web"
                valor={
                  <a href={cliente.SitioWeb} target="_blank" rel="noreferrer">
                    {cliente.SitioWeb}
                  </a>
                }
              />

              <h4>Contactos</h4>
              <Dato
                etiqueta="Primario"
                valor={
                  <>
                    {cliente.ContactoPrimario}
                    <span className="dato-extra">
                      {cliente.ContactoPrimarioTelefono} · {cliente.ContactoPrimarioCorreo}
                    </span>
                  </>
                }
              />
              <Dato
                etiqueta="Alternativo"
                valor={
                  cliente.ContactoAlternativo && (
                    <>
                      {cliente.ContactoAlternativo}
                      <span className="dato-extra">
                        {cliente.ContactoAlternativoTelefono} · {cliente.ContactoAlternativoCorreo}
                      </span>
                    </>
                  )
                }
              />

              <h4>Direcciones</h4>
              <Dato
                etiqueta="Entrega"
                valor={
                  <>
                    {cliente.DireccionEntrega1}
                    {cliente.DireccionEntrega2 && ', ' + cliente.DireccionEntrega2}
                    <span className="dato-extra">
                      {cliente.CiudadEntrega}, {cliente.ProvinciaEntrega} · CP {cliente.CodigoPostalEntrega}
                    </span>
                  </>
                }
              />
              <Dato
                etiqueta="Postal"
                valor={
                  <>
                    {cliente.DireccionPostal1}
                    {cliente.DireccionPostal2 && ', ' + cliente.DireccionPostal2}
                    <span className="dato-extra">
                      {cliente.CiudadPostal} · CP {cliente.CodigoPostalPostal}
                    </span>
                  </>
                }
              />

              <h4>Localización</h4>
              <Mapa latitud={cliente.Latitud} longitud={cliente.Longitud} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default DetalleCliente;

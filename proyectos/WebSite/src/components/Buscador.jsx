import { useState } from 'react';
import { consultar } from '../api';

// Campo de texto con sugerencias, para elegir entre muchas opciones (ciudades, personas...).
// Mientras el usuario escribe se piden a la API las coincidencias y se muestran en una lista.
// Al hacer clic en una opcion se avisa su ID con alElegir.
//
// ruta: ruta del buscador en la API, por ejemplo '/catalogos/ciudades'
// campoId y campoTexto: nombres de las columnas que devuelve el SP
// ayuda: texto pequeño opcional debajo del campo
// obligatorio: si es true se muestra el asterisco rojo junto a la etiqueta
function Buscador({ etiqueta, ruta, campoId, campoTexto, textoInicial, alElegir, ayuda, obligatorio }) {
  const [texto, setTexto] = useState(textoInicial);
  const [opciones, setOpciones] = useState([]);

  async function alEscribir(valor) {
    setTexto(valor);
    // si cambia el texto, la opcion elegida antes ya no vale;
    // tambien se avisa el texto, para saber si quedo algo escrito sin elegir
    alElegir(null, valor);

    // con menos de 2 letras no se busca
    if (valor.trim().length < 2) {
      setOpciones([]);
      return;
    }

    try {
      setOpciones(await consultar(ruta + '?texto=' + encodeURIComponent(valor.trim())));
    } catch (e) {
      setOpciones([]);
    }
  }

  function elegir(opcion) {
    setTexto(opcion[campoTexto]);
    setOpciones([]);
    alElegir(opcion[campoId], opcion[campoTexto]);
  }

  return (
    <label className="buscador">
      <span>
        {etiqueta} {obligatorio && <span className="obligatorio">*</span>}
      </span>
      <input
        type="text"
        value={texto}
        placeholder="Escriba al menos 2 letras"
        onChange={(e) => alEscribir(e.target.value)}
      />

      {ayuda && <span className="ayuda">{ayuda}</span>}

      {opciones.length > 0 && (
        <ul className="buscador-opciones">
          {opciones.map((o) => (
            <li key={o[campoId]} onClick={() => elegir(o)}>
              {o[campoTexto]}
            </li>
          ))}
        </ul>
      )}
    </label>
  );
}

export default Buscador;

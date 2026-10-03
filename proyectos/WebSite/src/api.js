const URL_API = 'http://localhost:3000/api';

// Hace una consulta a la API y devuelve los datos.
// Si algo sale mal lanza un error con el mensaje para mostrarlo en pantalla.
export async function consultar(ruta) {
  let respuesta;

  try {
    respuesta = await fetch(URL_API + ruta);
  } catch (error) {
    throw new Error('No se pudo conectar con el servidor. Verifique que la API esté encendida.');
  }

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.mensaje);
  }

  return datos;
}

// Revisa que un parametro de la URL sea un numero entero
function esEntero(valor) {
  return Number.isInteger(Number(valor));
}

module.exports = { esEntero };

/**
 * Función para pausar la ejecución durante un tiempo determinado
 * @param {number} ms Tiempo en milisegundos
 * @returns {Promise}
 */
export const sleep = (ms) => {
   return new Promise((resolve) => {
      setTimeout(resolve, ms);
   });
};

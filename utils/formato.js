export const MOMENTOS = ['Desayuno', 'Almuerzo', 'Cena'];
export const RELACIONES = ['Antes', 'Después'];
const ARTICULOS = { Desayuno: 'del', Almuerzo: 'del', Cena: 'de la' };

export const construirMomento = (relacion, comida) => `${relacion} ${ARTICULOS[comida]} ${comida}`;

export const parsearMomento = (momentoTexto) => {
  const relacion = RELACIONES.find((r) => momentoTexto.startsWith(r)) || 'Antes';
  const comida = MOMENTOS.find((c) => momentoTexto.includes(c)) || 'Desayuno';
  return { relacion, comida };
};

export const obtenerColorAzucar = (valor) => {
  if (valor < 80) return '#f0ad4e';
  if (valor > 130) return '#d9534f';
  return '#5cb85c';
};

export const formatearFecha = (isoString) => {
  const fecha = new Date(isoString);
  return fecha.toLocaleString('es-ES', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });
};

export const formatearHora = (isoString) => {
  const fecha = new Date(isoString);
  return fecha.toLocaleString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
};
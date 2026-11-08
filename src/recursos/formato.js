export function formatearPrecio(valor, moneda = '') {
  const numero = Number(valor);

  if (!Number.isFinite(numero)) return '—';

  if (moneda) {
    try {
      return new Intl.NumberFormat('es-VE', {
        style: 'currency',
        currency: moneda,
      }).format(numero);
    } catch {
      // Si la moneda configurada no es válida, se muestra el número sin símbolo.
    }
  }

  return new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numero);
}

export function formatearDuracion(minutos) {
  const numero = Number(minutos);

  if (!Number.isFinite(numero)) return '—';

  return `${numero} min`;
}

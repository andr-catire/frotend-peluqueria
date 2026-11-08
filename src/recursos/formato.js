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

/** Convierte minutos de retraso a horas legibles: 336 → "5,6 horas". */
export function formatearHoras(minutos) {
  const numero = Number(minutos);

  if (!Number.isFinite(numero) || numero <= 0) return '0 horas';

  const horas = numero / 60;
  const opciones = horas < 0.1
    ? { minimumFractionDigits: 2, maximumFractionDigits: 2 }
    : { maximumFractionDigits: 1 };
  const texto = new Intl.NumberFormat('es-VE', opciones).format(horas);
  const cantidad = Number(texto.replace(',', '.'));

  return `${texto} ${cantidad === 1 ? 'hora' : 'horas'}`;
}

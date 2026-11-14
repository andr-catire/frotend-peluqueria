/** Zona horaria del salón. El backend decide "hoy" y las horas en esta zona. */
export const ZONA_HORARIA = 'America/Caracas';

/**
 * Fecha YYYY-MM-DD de un Date que ya representa un día de calendario.
 * Usa los getters locales a propósito: no convierte entre zonas.
 */
export function fechaIso(fecha = new Date()) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

/**
 * Fecha YYYY-MM-DD de "hoy" según la hora del salón (America/Caracas).
 * Evita que un navegador en otra zona vea un día distinto al del backend.
 */
export function fechaHoyCaracas() {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA_HORARIA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const valor = (tipo) => partes.find((parte) => parte.type === tipo)?.value ?? '';
  return `${valor('year')}-${valor('month')}-${valor('day')}`;
}

/** "Hoy" en el salón como Date local a medianoche, listo para sumar o restar días. */
export function hoyEnCaracas() {
  return new Date(`${fechaHoyCaracas()}T00:00:00`);
}

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

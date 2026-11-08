const CLAVE_HORA = 'peluqueria.asistencia.hora';
const APERTURA = '08:00:00';
const CIERRE = '18:00:00';
const TOLERANCIA_MINUTOS = 0;
const APERTURA_SEGUNDOS = 8 * 3600;
const CIERRE_SEGUNDOS = 18 * 3600;

let estado = null;
let ultimoTextoHora = null;
let anclaHora = null;
let arranque = 0;

function dosDigitos(numero) {
  return String(numero).padStart(2, '0');
}

function horaTexto(fecha) {
  return `${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}:${dosDigitos(fecha.getSeconds())}`;
}

function fechaTexto(fecha) {
  return `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}`;
}

function aSegundos(texto) {
  if (!texto) return null;
  const [horas, minutos, segundos = '0'] = String(texto).split(':');
  return Number(horas) * 3600 + Number(minutos) * 60 + Number(String(segundos).split('.')[0]);
}

function leerHoraSimulada() {
  const desdeEntorno = import.meta.env.VITE_MOCK_HORA ?? '';
  if (typeof window === 'undefined') return desdeEntorno;
  return window.localStorage.getItem(CLAVE_HORA) || desdeEntorno;
}

function analizarHora(texto) {
  const coincidencia = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(String(texto ?? '').trim());
  if (!coincidencia) return null;

  const fecha = new Date();
  fecha.setHours(
    Number(coincidencia[1]),
    Number(coincidencia[2]),
    Number(coincidencia[3] ?? 0),
    0
  );
  return fecha;
}

/** Hora simulada que avanza en tiempo real desde el valor configurado. */
function ahora() {
  const texto = leerHoraSimulada();

  if (texto !== ultimoTextoHora) {
    ultimoTextoHora = texto;
    anclaHora = analizarHora(texto);
    arranque = Date.now();
  }

  if (!anclaHora) return new Date();
  return new Date(anclaHora.getTime() + (Date.now() - arranque));
}

function error(codigo, mensaje) {
  return {
    response: {
      data: { error: codigo, message: mensaje },
    },
  };
}

function reiniciarSiCambioElDia(fecha) {
  if (!estado || estado.fecha !== fecha) {
    estado = {
      fecha,
      horaEntrada: null,
      minutosTarde: 0,
      horaSalida: null,
      salidaAnticipada: false,
      motivoSalida: null,
    };
  }
}

function calcularMinutosTarde(fecha) {
  const segundos = fecha.getHours() * 3600 + fecha.getMinutes() * 60 + fecha.getSeconds();
  const limite = APERTURA_SEGUNDOS + TOLERANCIA_MINUTOS * 60;

  if (segundos <= limite) return 0;
  return Math.floor((segundos - APERTURA_SEGUNDOS) / 60);
}

function respuesta() {
  const actual = ahora();
  const fecha = fechaTexto(actual);
  reiniciarSiCambioElDia(fecha);

  const segundos = aSegundos(horaTexto(actual));
  const conEntrada = Boolean(estado.horaEntrada);
  const conSalida = Boolean(estado.horaSalida);

  return {
    fecha,
    horaActual: horaTexto(actual),
    horaApertura: APERTURA,
    horaCierre: CIERRE,
    horaEntrada: estado.horaEntrada,
    horaSalida: estado.horaSalida,
    llegoTarde: estado.minutosTarde > 0,
    minutosTarde: estado.minutosTarde,
    salidaAnticipada: estado.salidaAnticipada,
    puedeRegistrarEntrada: !conEntrada && segundos <= CIERRE_SEGUNDOS,
    puedeRegistrarSalida: conEntrada && !conSalida && segundos >= CIERRE_SEGUNDOS,
    salidaHabilitadaDesde: `${fecha}T${CIERRE}`,
  };
}

export async function obtenerHoyMock() {
  return respuesta();
}

export async function registrarEntradaMock() {
  const actual = ahora();
  const fecha = fechaTexto(actual);
  reiniciarSiCambioElDia(fecha);

  if (estado.horaEntrada) {
    throw error('ENTRADA_YA_REGISTRADA', 'Ya registraste tu entrada de hoy.');
  }

  if (aSegundos(horaTexto(actual)) > CIERRE_SEGUNDOS) {
    throw error(
      'ENTRADA_FUERA_DE_HORARIO',
      'Ya pasó la hora de cierre del local. No se puede registrar la entrada.'
    );
  }

  estado.horaEntrada = horaTexto(actual);
  estado.minutosTarde = calcularMinutosTarde(actual);
  return respuesta();
}

export async function registrarSalidaMock(motivo) {
  const actual = ahora();
  const fecha = fechaTexto(actual);
  reiniciarSiCambioElDia(fecha);

  if (!estado.horaEntrada) {
    throw error('SIN_ENTRADA', 'Primero debes registrar tu entrada.');
  }

  if (estado.horaSalida) {
    throw error('SALIDA_YA_REGISTRADA', 'Ya registraste tu salida de hoy.');
  }

  const anticipada = aSegundos(horaTexto(actual)) < CIERRE_SEGUNDOS;
  const motivoLimpio = String(motivo ?? '').trim();

  if (anticipada && motivoLimpio.length < 5) {
    throw error(
      'MOTIVO_REQUERIDO',
      'Para salir antes del cierre debes indicar un motivo de al menos 5 caracteres.'
    );
  }

  estado.horaSalida = horaTexto(actual);
  estado.salidaAnticipada = anticipada;
  estado.motivoSalida = anticipada ? motivoLimpio : null;
  return respuesta();
}

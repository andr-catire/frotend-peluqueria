const CLAVE_HORA = 'peluqueria.asistencia.hora';

let horarioMock = {
  zona: 'America/Caracas',
  apertura: '08:00:00',
  cierre: '18:00:00',
  toleranciaMinutos: 0,
};
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

function normalizarHora(texto) {
  const coincidencia = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(String(texto ?? '').trim());
  if (!coincidencia) return null;
  return `${dosDigitos(coincidencia[1])}:${coincidencia[2]}:${coincidencia[3] ?? '00'}`;
}

function calcularMinutosTarde(fecha) {
  const apertura = aSegundos(horarioMock.apertura);
  const segundos = fecha.getHours() * 3600 + fecha.getMinutes() * 60 + fecha.getSeconds();
  const limite = apertura + horarioMock.toleranciaMinutos * 60;

  if (segundos <= limite) return 0;
  return Math.floor((segundos - apertura) / 60);
}

function respuesta() {
  const actual = ahora();
  const fecha = fechaTexto(actual);
  reiniciarSiCambioElDia(fecha);

  const segundos = aSegundos(horaTexto(actual));
  const cierre = aSegundos(horarioMock.cierre);
  const conEntrada = Boolean(estado.horaEntrada);
  const conSalida = Boolean(estado.horaSalida);

  return {
    fecha,
    horaActual: horaTexto(actual),
    horaApertura: horarioMock.apertura,
    horaCierre: horarioMock.cierre,
    horaEntrada: estado.horaEntrada,
    horaSalida: estado.horaSalida,
    llegoTarde: estado.minutosTarde > 0,
    minutosTarde: estado.minutosTarde,
    salidaAnticipada: estado.salidaAnticipada,
    puedeRegistrarEntrada: !conEntrada && segundos <= cierre,
    puedeRegistrarSalida: conEntrada && !conSalida && segundos >= cierre,
    salidaHabilitadaDesde: `${fecha}T${horarioMock.cierre}`,
  };
}

export async function obtenerHoyMock() {
  return respuesta();
}

export async function obtenerHorarioMock() {
  return { ...horarioMock };
}

export async function actualizarHorarioMock(datos) {
  const apertura = normalizarHora(datos?.apertura);
  const cierre = normalizarHora(datos?.cierre);

  if (!apertura || !cierre) {
    throw error('VALIDATION_ERROR', 'Indica la hora de apertura y la de cierre.');
  }

  if (aSegundos(apertura) >= aSegundos(cierre)) {
    throw error(
      'HORARIO_INVALIDO',
      'La hora de apertura debe ser anterior a la hora de cierre.'
    );
  }

  horarioMock = { ...horarioMock, apertura, cierre };
  return { ...horarioMock };
}

export async function listarAsistenciasMock(fecha) {
  const dia = fecha || fechaTexto(ahora());
  const hoy = fechaTexto(new Date());
  const base = [
    { personalId: 5, nombre: 'Marta Ríos', email: 'marta@correo.com' },
    { personalId: 6, nombre: 'Luis Pérez', email: 'luis@correo.com' },
    { personalId: 7, nombre: 'Valeria Morales', email: 'valeria@correo.com' },
  ];

  if (dia !== hoy) {
    return base.map((persona) => ({
      ...persona,
      horaEntrada: null,
      horaSalida: null,
      llegoTarde: false,
      minutosTarde: 0,
      salidaAnticipada: false,
      motivoSalida: null,
      trabajo: false,
    }));
  }

  return [
    {
      ...base[0],
      horaEntrada: '08:00:00',
      horaSalida: '18:00:00',
      llegoTarde: false,
      minutosTarde: 0,
      salidaAnticipada: false,
      motivoSalida: null,
      trabajo: true,
    },
    {
      ...base[1],
      horaEntrada: '08:18:00',
      horaSalida: '17:10:00',
      llegoTarde: true,
      minutosTarde: 18,
      salidaAnticipada: true,
      motivoSalida: 'Cita médica programada',
      trabajo: true,
    },
    {
      ...base[2],
      horaEntrada: null,
      horaSalida: null,
      llegoTarde: false,
      minutosTarde: 0,
      salidaAnticipada: false,
      motivoSalida: null,
      trabajo: false,
    },
  ];
}

export async function registrarEntradaMock() {
  const actual = ahora();
  const fecha = fechaTexto(actual);
  reiniciarSiCambioElDia(fecha);

  if (estado.horaEntrada) {
    throw error('ENTRADA_YA_REGISTRADA', 'Ya registraste tu entrada de hoy.');
  }

  if (aSegundos(horaTexto(actual)) > aSegundos(horarioMock.cierre)) {
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

  const anticipada = aSegundos(horaTexto(actual)) < aSegundos(horarioMock.cierre);
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

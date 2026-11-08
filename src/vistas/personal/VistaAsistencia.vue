<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { Icon } from '@iconify/vue';
import EncabezadoPagina from '../../componentes/EncabezadoPagina.vue';
import ModalFormulario from '../../componentes/ModalFormulario.vue';
import DialogoConfirmacion from '../../componentes/DialogoConfirmacion.vue';
import { formatearHoras } from '../../recursos/formato.js';
import {
  obtenerHoy,
  registrarEntrada,
  registrarSalida,
} from '../../servicios/servicioAsistencia.js';

const estado = ref(null);
const cargando = ref(true);
const error = ref('');
const mensaje = ref('');
const errorAccion = ref('');
const enviandoEntrada = ref(false);
const enviandoSalida = ref(false);
const modalMotivo = ref(false);
const dialogoSalida = ref(false);
const motivo = ref('');
const errorMotivo = ref('');

let temporizador = null;
let solicitando = false;

const horaCierre = computed(() => horaCorta(estado.value?.horaCierre));

const horaEntrada = computed(() => horaCorta(estado.value?.horaEntrada));

const horaSalida = computed(() => horaCorta(estado.value?.horaSalida));

const yaTermino = computed(() => Boolean(estado.value?.horaSalida));

const puedeSalir = computed(() => Boolean(estado.value?.puedeRegistrarSalida));

const fechaLegible = computed(() => {
  const fecha = estado.value?.fecha;
  if (!fecha) return '';

  const [anio, mes, dia] = fecha.split('-').map(Number);
  const texto = new Intl.DateTimeFormat('es-VE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(anio, mes - 1, dia));

  return texto.charAt(0).toUpperCase() + texto.slice(1);
});

function horaCorta(valor) {
  return valor ? String(valor).slice(0, 5) : '—';
}

function aSegundos(valor) {
  if (!valor) return null;
  const [horas, minutos, segundos = '0'] = String(valor).split(':');
  return Number(horas) * 3600 + Number(minutos) * 60 + Number(String(segundos).split('.')[0]);
}

function mensajeDe(excepcion, defecto) {
  return excepcion?.response?.data?.message || defecto;
}

function limpiarTemporizador() {
  if (temporizador) {
    window.clearTimeout(temporizador);
    temporizador = null;
  }
}

/** Programa una nueva consulta al servidor justo cuando termina el horario. */
function programarDesbloqueo() {
  limpiarTemporizador();

  const valor = estado.value;
  if (!valor || valor.puedeRegistrarSalida || valor.horaSalida || !valor.horaEntrada) return;

  const actual = aSegundos(valor.horaActual);
  const cierre = aSegundos(valor.horaCierre);
  if (actual === null || cierre === null) return;

  const faltan = cierre - actual;
  if (faltan <= 0) return;

  temporizador = window.setTimeout(
    () => cargar({ silencioso: true }),
    (faltan + 1) * 1000
  );
}

async function cargar({ silencioso = false } = {}) {
  if (solicitando) return;
  solicitando = true;

  if (!silencioso) cargando.value = true;
  error.value = '';

  try {
    estado.value = await obtenerHoy();
    programarDesbloqueo();
  } catch (excepcion) {
    error.value = mensajeDe(excepcion, 'No se pudo cargar tu asistencia.');
  } finally {
    solicitando = false;
    cargando.value = false;
  }
}

function alRecuperarFoco() {
  if (document.visibilityState === 'visible' && !enviandoEntrada.value && !enviandoSalida.value) {
    cargar({ silencioso: true });
  }
}

onMounted(() => {
  cargar();
  window.addEventListener('focus', alRecuperarFoco);
  document.addEventListener('visibilitychange', alRecuperarFoco);
});

onBeforeUnmount(() => {
  limpiarTemporizador();
  window.removeEventListener('focus', alRecuperarFoco);
  document.removeEventListener('visibilitychange', alRecuperarFoco);
});

async function marcarEntrada() {
  if (enviandoEntrada.value) return;

  enviandoEntrada.value = true;
  errorAccion.value = '';
  mensaje.value = '';

  try {
    estado.value = await registrarEntrada();
    mensaje.value = 'Entrada registrada correctamente.';
    programarDesbloqueo();
  } catch (excepcion) {
    errorAccion.value = mensajeDe(excepcion, 'No se pudo registrar la entrada.');
  } finally {
    enviandoEntrada.value = false;
  }
}

async function marcarSalida() {
  if (enviandoSalida.value) return;

  enviandoSalida.value = true;
  errorAccion.value = '';
  mensaje.value = '';

  try {
    estado.value = await registrarSalida(null);
    mensaje.value = 'Salida registrada correctamente.';
  } catch (excepcion) {
    errorAccion.value = mensajeDe(excepcion, 'No se pudo registrar la salida.');
  } finally {
    enviandoSalida.value = false;
  }
}

function abrirMotivo() {
  motivo.value = '';
  errorMotivo.value = '';
  modalMotivo.value = true;
}

function cerrarMotivo() {
  if (enviandoSalida.value) return;
  modalMotivo.value = false;
  errorMotivo.value = '';
}

function continuarSalida() {
  const limpio = motivo.value.trim();

  if (limpio.length < 5) {
    errorMotivo.value = 'Escribe un motivo de al menos 5 caracteres.';
    return;
  }

  if (limpio.length > 200) {
    errorMotivo.value = 'El motivo no puede superar los 200 caracteres.';
    return;
  }

  errorMotivo.value = '';
  modalMotivo.value = false;
  dialogoSalida.value = true;
}

async function confirmarSalida() {
  if (enviandoSalida.value) return;

  enviandoSalida.value = true;
  errorAccion.value = '';

  try {
    estado.value = await registrarSalida(motivo.value.trim());
    mensaje.value = 'Salida registrada correctamente.';
    dialogoSalida.value = false;
    modalMotivo.value = false;
    motivo.value = '';
    programarDesbloqueo();
  } catch (excepcion) {
    dialogoSalida.value = false;
    const codigo = excepcion?.response?.data?.error;

    if (codigo === 'MOTIVO_REQUERIDO' || codigo === 'VALIDATION_ERROR') {
      errorMotivo.value = mensajeDe(excepcion, 'Revisa el motivo indicado.');
      modalMotivo.value = true;
    } else {
      errorAccion.value = mensajeDe(excepcion, 'No se pudo registrar la salida.');
    }
  } finally {
    enviandoSalida.value = false;
  }
}
</script>

<template>
  <div class="asistencia">
    <EncabezadoPagina
      label="Mi jornada"
      title="Mi asistencia"
      accent="asistencia"
      subtitle="Registra tu entrada y tu salida. La hora la marca el servidor."
    />

    <div class="container page">
      <p v-if="mensaje" class="success-message" role="status">{{ mensaje }}</p>
      <p v-if="errorAccion" class="form-error" role="alert">{{ errorAccion }}</p>

      <div v-if="cargando" class="state-card" aria-busy="true">
        Cargando tu jornada…
      </div>

      <div v-else-if="error && !estado" class="state-card" role="alert">
        <p>{{ error }}</p>
        <button class="btn btn--ghost btn--small" type="button" @click="cargar()">
          Reintentar
        </button>
      </div>

      <template v-else-if="estado">
        <p class="fecha">{{ fechaLegible }}</p>

        <div class="jornada">
          <section class="card" aria-labelledby="entrada-titulo">
            <header class="card__header">
              <span class="card__icon" aria-hidden="true">
                <Icon icon="material-symbols-light:schedule" />
              </span>
              <h2 id="entrada-titulo" class="card__title">Entrada</h2>
            </header>

            <template v-if="estado.horaEntrada">
              <p class="hora">{{ horaEntrada }}</p>
              <span class="badge" :class="{ 'badge--late': estado.llegoTarde }">
                <Icon
                  :icon="estado.llegoTarde
                    ? 'material-symbols-light:schedule'
                    : 'material-symbols-light:check'"
                  aria-hidden="true"
                />
                {{ estado.llegoTarde
                  ? `Llegaste tarde: ${formatearHoras(estado.minutosTarde)}`
                  : 'Puntual' }}
              </span>
            </template>

            <template v-else-if="estado.puedeRegistrarEntrada">
              <p class="caption">Aún no has registrado tu entrada.</p>
              <button
                class="btn btn--primary"
                type="button"
                :disabled="enviandoEntrada"
                @click="marcarEntrada"
              >
                {{ enviandoEntrada ? 'Registrando…' : 'Registrar entrada' }}
              </button>
            </template>

            <p v-else class="notice">
              Ya pasó la hora de cierre. Hoy no puedes registrar la entrada.
            </p>
          </section>

          <section class="card" aria-labelledby="salida-titulo">
            <header class="card__header">
              <span class="card__icon" aria-hidden="true">
                <Icon icon="material-symbols-light:schedule" />
              </span>
              <h2 id="salida-titulo" class="card__title">Salida</h2>
            </header>

            <template v-if="estado.horaSalida">
              <p class="hora">{{ horaSalida }}</p>
              <p v-if="estado.salidaAnticipada" class="caption">
                Salida anticipada registrada. El administrador revisará el motivo.
              </p>
              <p v-else class="caption">Jornada completada.</p>
            </template>

            <template v-else-if="puedeSalir">
              <p class="caption">Ya puedes registrar tu salida.</p>
              <button
                class="btn btn--ghost"
                type="button"
                :disabled="enviandoSalida"
                @click="marcarSalida"
              >
                {{ enviandoSalida ? 'Registrando…' : 'Registrar salida' }}
              </button>
            </template>

            <template v-else>
              <button
                class="btn btn--ghost"
                type="button"
                disabled
                aria-describedby="salida-aviso"
              >
                Registrar salida
              </button>
              <p id="salida-aviso" class="caption">
                Podrás registrar tu salida a las {{ horaCierre }}.
              </p>
              <button
                v-if="estado.horaEntrada"
                class="btn btn--ghost btn--small"
                type="button"
                @click="abrirMotivo"
              >
                Necesito salir antes
              </button>
            </template>
          </section>
        </div>

        <p v-if="yaTermino" class="journey-done" role="status">
          Ya registraste tu jornada de hoy.
        </p>
      </template>
    </div>

    <ModalFormulario
      :open="modalMotivo"
      title="Salir antes del cierre"
      submit-label="Continuar"
      :loading="enviandoSalida"
      @close="cerrarMotivo"
      @submit="continuarSalida"
    >
      <div class="field">
        <label class="field__label" for="motivo-salida">Motivo de la salida anticipada</label>
        <textarea
          id="motivo-salida"
          v-model="motivo"
          class="textarea"
          maxlength="200"
          :aria-invalid="Boolean(errorMotivo)"
          :aria-describedby="errorMotivo ? 'motivo-salida-error' : 'motivo-salida-ayuda'"
        ></textarea>
        <p id="motivo-salida-ayuda" class="field__help">
          Entre 5 y 200 caracteres. El administrador podrá revisar este motivo.
        </p>
        <p v-if="errorMotivo" id="motivo-salida-error" class="field__error">
          {{ errorMotivo }}
        </p>
      </div>
    </ModalFormulario>

    <DialogoConfirmacion
      :open="dialogoSalida"
      title="Confirmar salida anticipada"
      message="¿Registrar tu salida anticipada ahora? Quedará guardada para revisión del administrador."
      confirm-label="Registrar salida"
      :loading="enviandoSalida"
      @confirm="confirmarSalida"
      @cancel="dialogoSalida = false"
    />
  </div>
</template>

<style scoped>
.asistencia {
  min-height: calc(100vh - var(--topbar-h));
  background: var(--color-fondo);
}

.fecha {
  margin-bottom: var(--space-4);
  color: var(--color-texto-suave);
  font-size: var(--text-body);
}

.jornada {
  display: grid;
  gap: var(--space-4);
}

.card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-6);
  border: var(--borde-suave);
  border-radius: var(--radio-md);
  background: var(--color-blanco);
}

.card__header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.card__icon {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border-radius: var(--radio-pill);
  background: var(--color-superficie);
  color: var(--color-marino);
}

.card__icon :deep(svg) {
  width: 20px;
  height: 20px;
}

.card__title {
  font-family: var(--fuente-titulo);
  font-size: var(--text-heading-sm);
  font-weight: var(--weight-regular);
  line-height: 1.2;
}

.hora {
  font-family: var(--fuente-titulo);
  font-size: var(--text-heading-lg);
  line-height: 1.1;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 4px var(--space-3);
  border: 1px solid var(--color-marino);
  border-radius: var(--radio-pill);
  color: var(--color-marino);
  font-size: var(--text-caption);
  font-weight: var(--weight-medium);
  line-height: 1.2;
}

.badge--late {
  border-style: dashed;
}

.badge :deep(svg) {
  width: 16px;
  height: 16px;
}

.notice {
  margin: 0;
  padding: var(--space-3) var(--space-4);
  border-left: 3px solid var(--color-marino);
  background: var(--color-superficie);
  color: var(--color-marino);
  font-size: var(--text-body);
  line-height: 1.5;
}

.success-message {
  margin: 0 0 var(--space-4);
  padding: var(--space-3) var(--space-4);
  border: var(--borde-suave);
  border-radius: var(--radio-sm);
  background: var(--color-superficie);
  color: var(--color-marino);
  font-size: var(--text-body);
  font-weight: var(--weight-medium);
}

.state-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-6);
  border: var(--borde-suave);
  border-radius: var(--radio-md);
  background: var(--color-blanco);
  color: var(--color-texto-suave);
  font-size: var(--text-body);
}

.state-card p {
  margin: 0;
}

.journey-done {
  margin-top: var(--space-4);
  padding: var(--space-3) var(--space-4);
  border: var(--borde-suave);
  border-radius: var(--radio-sm);
  background: var(--color-superficie);
  color: var(--color-marino);
  font-size: var(--text-body);
  font-weight: var(--weight-medium);
}

@media (min-width: 768px) {
  .jornada {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>

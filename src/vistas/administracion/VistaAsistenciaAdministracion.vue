<script setup>
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { Icon } from '@iconify/vue';
import EncabezadoPagina from '../../componentes/EncabezadoPagina.vue';
import TarjetaCifra from '../../componentes/TarjetaCifra.vue';
import TablaDatos from '../../componentes/TablaDatos.vue';
import ModalFormulario from '../../componentes/ModalFormulario.vue';
import { formatearHoras } from '../../recursos/formato.js';
import {
  actualizarHorario,
  listar,
  obtenerHorario,
} from '../../servicios/servicioAsistencia.js';

const columnas = [
  { key: 'estilista', label: 'Estilista' },
  { key: 'entrada', label: 'Entrada' },
  { key: 'salida', label: 'Salida' },
  { key: 'observacion', label: 'Observación' },
];

function fechaISO(fecha = new Date()) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

const hoy = fechaISO();
const fecha = ref(hoy);
const filas = ref([]);
const cargando = ref(true);
const error = ref('');

const horario = ref(null);
const cargandoHorario = ref(true);
const errorHorario = ref('');
const modalHorario = ref(false);
const guardandoHorario = ref(false);
const errorHorarioModal = ref('');
const mensajeHorario = ref('');
const formularioHorario = ref({ apertura: '', cierre: '' });

const conRegistro = computed(() => filas.value.filter((fila) => fila.trabajo).length);
const tardanzas = computed(() => filas.value.filter((fila) => fila.llegoTarde).length);
const anticipadas = computed(() => filas.value.filter((fila) => fila.salidaAnticipada).length);
const sinRegistro = computed(() => filas.value.filter((fila) => !fila.trabajo).length);

const fechaLegible = computed(() => {
  if (!fecha.value) return '';

  const [anio, mes, dia] = fecha.value.split('-').map(Number);
  const texto = new Intl.DateTimeFormat('es-VE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(anio, mes - 1, dia));

  return texto.charAt(0).toUpperCase() + texto.slice(1);
});

function horaCorta(valor) {
  return valor ? String(valor).slice(0, 5) : '—';
}

function iniciales(nombre) {
  return String(nombre ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte.charAt(0))
    .join('')
    .toUpperCase();
}

function mensajeDe(excepcion, defecto) {
  return excepcion?.response?.data?.message || defecto;
}

async function cargar() {
  cargando.value = true;
  error.value = '';

  try {
    const datos = await listar(fecha.value || hoy);
    filas.value = Array.isArray(datos) ? datos : [];
  } catch (excepcion) {
    filas.value = [];
    error.value = mensajeDe(excepcion, 'No se pudo cargar la asistencia del personal.');
  } finally {
    cargando.value = false;
  }
}

async function cargarHorario() {
  cargandoHorario.value = true;
  errorHorario.value = '';

  try {
    horario.value = await obtenerHorario();
  } catch (excepcion) {
    errorHorario.value = mensajeDe(excepcion, 'No se pudo cargar el horario del negocio.');
  } finally {
    cargandoHorario.value = false;
  }
}

function abrirModalHorario() {
  if (!horario.value) return;

  formularioHorario.value = {
    apertura: horaCorta(horario.value.apertura),
    cierre: horaCorta(horario.value.cierre),
  };
  errorHorarioModal.value = '';
  modalHorario.value = true;
}

function cerrarModalHorario() {
  if (guardandoHorario.value) return;
  modalHorario.value = false;
}

async function guardarHorario() {
  const apertura = formularioHorario.value.apertura;
  const cierre = formularioHorario.value.cierre;
  errorHorarioModal.value = '';

  if (!apertura || !cierre) {
    errorHorarioModal.value = 'Indica la hora de apertura y la de cierre.';
    return;
  }

  if (apertura >= cierre) {
    errorHorarioModal.value = 'La hora de apertura debe ser anterior a la hora de cierre.';
    return;
  }

  guardandoHorario.value = true;

  try {
    horario.value = await actualizarHorario({ apertura, cierre });
    mensajeHorario.value = 'Horario actualizado correctamente.';
    modalHorario.value = false;
  } catch (excepcion) {
    errorHorarioModal.value = mensajeDe(excepcion, 'No se pudo actualizar el horario.');
  } finally {
    guardandoHorario.value = false;
  }
}

onMounted(() => {
  cargar();
  cargarHorario();
});
</script>

<template>
  <div class="asistencia-admin">
    <EncabezadoPagina
      label="Control de personal"
      title="Asistencia del personal"
      accent="personal"
      subtitle="Consulta la jornada de cada estilista, las tardanzas y las salidas anticipadas."
    >
      <template #stats>
        <TarjetaCifra :value="conRegistro" label="Con registro" />
        <TarjetaCifra :value="tardanzas" label="Tardanzas" />
        <TarjetaCifra :value="anticipadas" label="Salidas anticipadas" />
      </template>
    </EncabezadoPagina>

    <div class="container page">
      <p v-if="mensajeHorario" class="success-message" role="status">{{ mensajeHorario }}</p>

      <section class="horario" aria-labelledby="horario-titulo">
        <div class="horario__texto">
          <p class="label">Horario del negocio</p>
          <h2 id="horario-titulo" class="horario__titulo">Apertura y cierre</h2>
          <p class="caption">Define cuándo el personal puede registrar entrada y salida.</p>
        </div>

        <div v-if="cargandoHorario" class="horario__estado caption" aria-busy="true">
          Cargando horario…
        </div>

        <div v-else-if="errorHorario" class="horario__estado" role="alert">
          <p class="caption">{{ errorHorario }}</p>
          <button class="btn btn--ghost btn--small" type="button" @click="cargarHorario">
            Reintentar
          </button>
        </div>

        <div v-else-if="horario" class="horario__horas">
          <div class="horario__hora">
            <span class="horario__etiqueta">Apertura</span>
            <strong>{{ horaCorta(horario.apertura) }}</strong>
          </div>
          <div class="horario__hora">
            <span class="horario__etiqueta">Cierre</span>
            <strong>{{ horaCorta(horario.cierre) }}</strong>
          </div>
        </div>

        <button
          class="btn btn--ghost btn--small horario__boton"
          type="button"
          :disabled="cargandoHorario || !horario"
          @click="abrirModalHorario"
        >
          Modificar
        </button>
      </section>

      <div class="toolbar">
        <div class="field toolbar__fecha">
          <label class="field__label" for="fecha-asistencia">Fecha</label>
          <input
            id="fecha-asistencia"
            v-model="fecha"
            class="input"
            type="date"
            :max="hoy"
            @change="cargar"
          />
        </div>

        <p class="resumen">
          {{ fechaLegible }}
          <span class="resumen__separador" aria-hidden="true">·</span>
          {{ sinRegistro }} sin registro
        </p>
      </div>

      <TablaDatos
        :columns="columnas"
        :rows="filas"
        row-key="personalId"
        caption="Asistencia del personal por fecha"
        :loading="cargando"
        :error="error"
        empty-title="No hay estilistas activos"
        empty-description="Registra personal para poder consultar su asistencia."
        @retry="cargar"
      >
        <template #cell-estilista="{ row }">
          <span class="persona">
            <span class="persona__avatar" aria-hidden="true">{{ iniciales(row.nombre) }}</span>
            <span class="persona__datos">
              <span class="persona__nombre">{{ row.nombre }}</span>
              <span class="persona__email">{{ row.email }}</span>
            </span>
          </span>
        </template>

        <template #cell-entrada="{ row }">
          <span class="hora" :class="{ 'hora--vacia': !row.horaEntrada }">
            {{ horaCorta(row.horaEntrada) }}
          </span>
        </template>

        <template #cell-salida="{ row }">
          <span class="hora" :class="{ 'hora--vacia': !row.horaSalida }">
            {{ horaCorta(row.horaSalida) }}
          </span>
        </template>

        <template #cell-observacion="{ row }">
          <div class="novedades">
            <template v-if="!row.trabajo">
              <span class="marca marca--vacia">
                <Icon icon="material-symbols-light:close" aria-hidden="true" />
                Sin registro
              </span>
              <p class="novedad__texto">No trabajó este día.</p>
            </template>

            <template v-else>
              <span class="marca" :class="row.llegoTarde ? 'marca--alerta' : 'marca--ok'">
                <Icon
                  :icon="row.llegoTarde
                    ? 'material-symbols-light:schedule'
                    : 'material-symbols-light:check'"
                  aria-hidden="true"
                />
                {{ row.llegoTarde ? `Llegó tarde: ${formatearHoras(row.minutosTarde)}` : 'Puntual' }}
              </span>

              <span v-if="row.salidaAnticipada" class="marca marca--alerta">
                <Icon icon="material-symbols-light:info" aria-hidden="true" />
                Salida anticipada
              </span>

              <p v-if="row.salidaAnticipada && row.motivoSalida" class="novedad__texto">
                Motivo: {{ row.motivoSalida }}
              </p>
              <p v-else-if="!row.horaSalida" class="novedad__texto">Jornada en curso.</p>
              <p v-else class="novedad__texto">Jornada completa.</p>
            </template>
          </div>
        </template>

        <template #empty-action>
          <RouterLink class="btn btn--ghost" :to="{ name: 'admin-personal' }">
            Ir a Personal
          </RouterLink>
        </template>
      </TablaDatos>

      <p class="nota">
        Si un estilista no registra su entrada, el día queda sin jornada laboral.
      </p>
    </div>

    <ModalFormulario
      :open="modalHorario"
      title="Modificar horario"
      submit-label="Guardar horario"
      :loading="guardandoHorario"
      :error="errorHorarioModal"
      @close="cerrarModalHorario"
      @submit="guardarHorario"
    >
      <div class="field">
        <label class="field__label" for="hora-apertura">Hora de apertura</label>
        <input
          id="hora-apertura"
          v-model="formularioHorario.apertura"
          class="input"
          type="time"
          required
        />
      </div>

      <div class="field">
        <label class="field__label" for="hora-cierre">Hora de cierre</label>
        <input
          id="hora-cierre"
          v-model="formularioHorario.cierre"
          class="input"
          type="time"
          required
        />
      </div>

      <p class="field__help">
        La apertura debe ser anterior al cierre. El cambio se aplica de inmediato.
      </p>
    </ModalFormulario>
  </div>
</template>

<style scoped>
.asistencia-admin {
  min-height: calc(100vh - var(--topbar-h));
  background: var(--color-fondo);
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

.horario {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
  padding: var(--space-4) var(--space-6);
  border: var(--borde-suave);
  border-radius: var(--radio-md);
  background: var(--color-blanco);
}

.horario__texto {
  min-width: 220px;
  flex: 1;
}

.horario__titulo {
  font-size: var(--text-heading-sm);
  line-height: 1.2;
}

.horario__horas {
  display: flex;
  gap: var(--space-8);
}

.horario__hora {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.horario__etiqueta {
  color: var(--color-texto-suave);
  font-size: var(--text-caption);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.horario__hora strong {
  color: var(--color-marino);
  font-family: var(--fuente-titulo);
  font-size: var(--text-heading-sm);
  font-weight: var(--weight-regular);
  line-height: 1.1;
}

.horario__estado {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.horario__estado p {
  margin: 0;
}

.horario__boton {
  margin-left: auto;
}

.toolbar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.toolbar__fecha {
  width: min(100%, 240px);
}

.resumen {
  margin: 0 0 var(--space-1);
  color: var(--color-texto-suave);
  font-size: var(--text-body);
}

.resumen__separador {
  margin-inline: var(--space-1);
}

.persona {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

.persona__avatar {
  display: grid;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  place-items: center;
  border: var(--borde-suave);
  border-radius: var(--radio-pill);
  background: var(--color-superficie);
  color: var(--color-marino);
  font-size: var(--text-caption);
  font-weight: var(--weight-semibold);
}

.persona__datos {
  display: flex;
  flex-direction: column;
}

.persona__nombre {
  color: var(--color-marino);
  font-weight: var(--weight-semibold);
}

.persona__email {
  color: var(--color-texto-suave);
  font-size: var(--text-caption);
}

.hora {
  color: var(--color-marino);
  font-variant-numeric: tabular-nums;
  font-weight: var(--weight-semibold);
}

.hora--vacia {
  color: var(--color-texto-suave);
  font-weight: var(--weight-regular);
}

.novedades {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-1);
}

.marca {
  display: inline-flex;
  min-height: 24px;
  align-items: center;
  gap: 4px;
  padding: 2px var(--space-2);
  border: 1px solid var(--color-marino);
  border-radius: var(--radio-pill);
  color: var(--color-marino);
  font-size: var(--text-caption);
  font-weight: var(--weight-medium);
  line-height: 1.2;
  white-space: nowrap;
}

.marca--ok {
  border-color: var(--color-borde-suave);
}

.marca--alerta {
  border-style: dashed;
  background: var(--color-superficie);
}

.marca--vacia {
  border-color: var(--color-borde-suave);
  border-style: dashed;
  color: var(--color-texto-suave);
}

.marca :deep(svg) {
  width: 16px;
  height: 16px;
}

.novedad__texto {
  width: 100%;
  margin: 0;
  color: var(--color-texto-suave);
  font-size: var(--text-caption);
  line-height: 1.4;
}

.nota {
  margin-top: var(--space-3);
  color: var(--color-texto-suave);
  font-size: var(--text-caption);
}

@media (max-width: 640px) {
  .horario {
    align-items: stretch;
    flex-direction: column;
  }

  .horario__horas {
    justify-content: space-between;
    gap: var(--space-4);
  }

  .horario__boton {
    width: 100%;
    margin-left: 0;
  }

  .toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .toolbar__fecha {
    width: 100%;
  }
}
</style>

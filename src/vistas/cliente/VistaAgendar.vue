<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { useAlmacenConfiguracion } from '../../almacenes/configuracion.js';
import { formatearDuracion, formatearPrecio } from '../../recursos/formato.js';
import { listar } from '../../servicios/servicioServicios.js';

const route = useRoute();
const router = useRouter();
const config = useAlmacenConfiguracion();

const paso = ref(1);
const servicioSeleccionado = ref(null);
const fechaSeleccionada = ref('');
const horaSeleccionada = ref('');
const confirmado = ref(false);
const cargando = ref(false);
const busqueda = ref('');

const servicios = ref([]);
const cargandoServicios = ref(true);
const errorServicios = ref('');

// Chips en píldora de 44 px (DESIGN §3.1)
const horarios = [
  { hora: '09:00', ocupado: false },
  { hora: '09:30', ocupado: false },
  { hora: '10:00', ocupado: true },
  { hora: '10:30', ocupado: false },
  { hora: '11:00', ocupado: false },
  { hora: '11:30', ocupado: true },
  { hora: '14:00', ocupado: false },
  { hora: '14:30', ocupado: false },
  { hora: '15:00', ocupado: false },
  { hora: '15:30', ocupado: true },
  { hora: '16:00', ocupado: false },
  { hora: '16:30', ocupado: false },
];

const hoy = new Date().toISOString().split('T')[0];
const servicioIdQuery = Number(route.query.servicio) || null;

const hayBusqueda = computed(() => busqueda.value.trim().length > 0);

const serviciosFiltrados = computed(() => {
  const termino = busqueda.value.trim().toLocaleLowerCase('es');

  if (!termino) return servicios.value;

  return servicios.value.filter((servicio) =>
    (servicio.nombre ?? '').toLocaleLowerCase('es').includes(termino)
  );
});

const puedeAvanzar = computed(() => {
  if (paso.value === 1) return servicioSeleccionado.value !== null;
  if (paso.value === 2) return Boolean(fechaSeleccionada.value && horaSeleccionada.value);
  return false;
});

const fechaFormateada = computed(() => {
  if (!fechaSeleccionada.value) return '';
  const d = new Date(fechaSeleccionada.value + 'T00:00:00');
  return d.toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
});

async function cargarServicios() {
  cargandoServicios.value = true;
  errorServicios.value = '';

  try {
    const datos = await listar();
    servicios.value = Array.isArray(datos) ? datos : [];

    if (servicioIdQuery) {
      const encontrado = servicios.value.find((servicio) => servicio.id === servicioIdQuery);
      if (encontrado) {
        servicioSeleccionado.value = encontrado;
        paso.value = 2;
      }
    }
  } catch (excepcion) {
    errorServicios.value =
      excepcion?.response?.data?.message || 'No se pudieron cargar los servicios.';
  } finally {
    cargandoServicios.value = false;
  }
}

function iconoServicio() {
  return 'material-symbols-light:content-cut';
}

function metaServicio(servicio) {
  return `${formatearDuracion(servicio?.duracionMinutos)} · ${formatearPrecio(servicio?.precio, config.moneda)}`;
}

function duracionServicio(servicio) {
  return formatearDuracion(servicio?.duracionMinutos);
}

function totalServicio(servicio) {
  return formatearPrecio(servicio?.precio, config.moneda);
}

function seleccionarServicio(servicio) {
  servicioSeleccionado.value = servicio;
}

function avanzar() {
  if (paso.value < 3) paso.value++;
}

function retroceder() {
  if (paso.value > 1) paso.value--;
}

async function confirmar() {
  cargando.value = true;
  try {
    await new Promise((r) => setTimeout(r, 1000));
    confirmado.value = true;
  } catch (e) {
    console.error('Error al agendar:', e);
  } finally {
    cargando.value = false;
  }
}

function nuevaCita() {
  paso.value = 1;
  servicioSeleccionado.value = null;
  fechaSeleccionada.value = '';
  horaSeleccionada.value = '';
  confirmado.value = false;
  busqueda.value = '';
}

onMounted(cargarServicios);
</script>

<template>
  <div class="page agendar-page">
    <div class="container container--agendar">

      <!-- ── Pantalla de éxito (DESIGN §3.1) ── -->
      <div v-if="confirmado" class="card agendar-exito" role="status" aria-live="polite">
        <div class="agendar-exito__icono" aria-hidden="true">
          <Icon icon="material-symbols-light:check-circle" />
        </div>
        <h1 class="agendar-exito__titulo">¡Cita confirmada!</h1>
        <p class="agendar-exito__sub">
          Tu cita de <strong>{{ servicioSeleccionado?.nombre }}</strong> está agendada para el
          <strong>{{ fechaFormateada }}</strong> a las <strong>{{ horaSeleccionada }}</strong>.
        </p>
        <div class="agendar-exito__acciones">
          <button class="btn btn--primary" type="button" @click="router.push({ name: 'servicios' })">
            Volver a servicios
          </button>
          <button class="btn btn--outline" type="button" @click="nuevaCita">
            Agendar otra cita
          </button>
        </div>
      </div>

      <!-- ── Formulario multi-paso ── -->
      <template v-else>
        <!-- Encabezado con una palabra en cursiva azul (DESIGN §1) -->
        <div class="agendar-header">
          <p class="label">Reserva tu espacio</p>
          <h1 class="agendar-header__title">Agenda tu <em>cita</em></h1>
        </div>

        <!-- Indicador de pasos (DESIGN §3.1) -->
        <nav class="agendar-pasos" aria-label="Pasos de la reserva">
          <div
            v-for="n in 3"
            :key="n"
            class="agendar-paso"
            :class="{
              'agendar-paso--activo': paso === n,
              'agendar-paso--completado': paso > n,
            }"
          >
            <div class="agendar-paso__num" :aria-current="paso === n ? 'step' : undefined">
              <Icon v-if="paso > n" icon="material-symbols-light:check" aria-hidden="true" />
              <span v-else>{{ n }}</span>
            </div>
            <span class="agendar-paso__label">
              {{ ['Servicio', 'Fecha y hora', 'Confirmar'][n - 1] }}
            </span>
            <div v-if="n < 3" class="agendar-paso__conector" aria-hidden="true"></div>
          </div>
        </nav>

        <!-- ── PASO 1: Seleccionar servicio ── -->
        <section v-if="paso === 1" class="agendar-paso-contenido" aria-label="Paso 1: Seleccionar servicio">
          <div class="field agendar-busqueda-wrap">
            <label class="sr-only" for="filtro-servicio">Filtrar servicios</label>
            <div class="agendar-input-icon">
              <Icon icon="material-symbols-light:search" class="agendar-busqueda__icono" aria-hidden="true" />
              <input
                id="filtro-servicio"
                v-model="busqueda"
                type="search"
                placeholder="Buscar servicio…"
                class="input agendar-busqueda__input"
              />
            </div>
          </div>

          <div
            v-if="cargandoServicios"
            class="agendar-servicios-grid"
            aria-busy="true"
            aria-label="Cargando servicios"
          >
            <div
              v-for="fila in 4"
              :key="fila"
              class="agendar-servicio-skeleton"
              aria-hidden="true"
            ></div>
          </div>

          <div v-else-if="errorServicios" class="agendar-estado" role="alert">
            <p>{{ errorServicios }}</p>
            <button class="btn btn--outline btn--small" type="button" @click="cargarServicios">
              Reintentar
            </button>
          </div>

          <div v-else-if="!serviciosFiltrados.length" class="agendar-estado">
            <p>
              {{ hayBusqueda ? 'No hay servicios que coincidan con la búsqueda.' : 'Aún no hay servicios disponibles.' }}
            </p>
          </div>

          <div v-else class="agendar-servicios-grid" role="list">
            <button
              v-for="s in serviciosFiltrados"
              :key="s.id"
              type="button"
              class="agendar-servicio-item"
              :class="{ 'agendar-servicio-item--seleccionado': servicioSeleccionado?.id === s.id }"
              role="listitem"
              @click="seleccionarServicio(s)"
              :aria-pressed="servicioSeleccionado?.id === s.id"
            >
              <div class="agendar-servicio-item__badge" aria-hidden="true">
                <Icon :icon="iconoServicio(s)" />
              </div>
              <div class="agendar-servicio-item__info">
                <span class="agendar-servicio-item__nombre">{{ s.nombre }}</span>
                <span class="caption agendar-servicio-item__meta">{{ metaServicio(s) }}</span>
              </div>
              <div class="agendar-servicio-item__check" aria-hidden="true">
                <Icon v-if="servicioSeleccionado?.id === s.id" icon="material-symbols-light:check" />
              </div>
            </button>
          </div>
        </section>

        <!-- ── PASO 2: Seleccionar fecha y hora ── -->
        <section v-if="paso === 2" class="agendar-paso-contenido" aria-label="Paso 2: Seleccionar fecha y hora">
          <div class="card agendar-servicio-resumen">
            <div class="agendar-servicio-item__badge" aria-hidden="true">
              <Icon :icon="iconoServicio(servicioSeleccionado)" />
            </div>
            <div>
              <strong class="agendar-servicio-resumen__nombre">{{ servicioSeleccionado?.nombre }}</strong>
              <p class="caption agendar-servicio-resumen__meta">
                {{ metaServicio(servicioSeleccionado) }}
              </p>
            </div>
          </div>

          <div class="agendar-fecha-wrap">
            <div class="field">
              <label class="field__label" for="fecha-cita">Fecha de tu cita</label>
              <input
                id="fecha-cita"
                v-model="fechaSeleccionada"
                type="date"
                class="input"
                :min="hoy"
                aria-required="true"
              />
            </div>
          </div>

          <!-- Selector de hora: cuadrícula de chips en píldora de 44 px (DESIGN §3.1) -->
          <div v-if="fechaSeleccionada" class="agendar-horarios">
            <p class="field__label">Horas disponibles</p>
            <div class="agendar-horarios-grid" role="list">
              <button
                v-for="item in horarios"
                :key="item.hora"
                type="button"
                class="chip-hora"
                :class="{
                  'chip-hora--seleccionado': horaSeleccionada === item.hora,
                  'chip-hora--ocupado': item.ocupado
                }"
                :disabled="item.ocupado"
                role="listitem"
                @click="horaSeleccionada = item.hora"
                :aria-pressed="horaSeleccionada === item.hora"
              >
                {{ item.hora }}
              </button>
            </div>
          </div>
        </section>

        <!-- ── PASO 3: Confirmar ── -->
        <section v-if="paso === 3" class="agendar-paso-contenido" aria-label="Paso 3: Confirmar cita">
          <div class="card agendar-resumen">
            <h2 class="agendar-resumen__titulo">Resumen de tu cita</h2>
            <div class="divider"></div>

            <dl class="agendar-resumen__lista">
              <div class="agendar-resumen__fila">
                <dt>Servicio</dt>
                <dd>{{ servicioSeleccionado?.nombre }}</dd>
              </div>
              <div class="agendar-resumen__fila">
                <dt>Fecha</dt>
                <dd>{{ fechaFormateada }}</dd>
              </div>
              <div class="agendar-resumen__fila">
                <dt>Hora</dt>
                <dd>{{ horaSeleccionada }}</dd>
              </div>
              <div class="agendar-resumen__fila">
                <dt>Duración estimada</dt>
                <dd>{{ duracionServicio(servicioSeleccionado) }}</dd>
              </div>
              <div class="divider"></div>
              <div class="agendar-resumen__fila agendar-resumen__fila--total">
                <dt>Total</dt>
                <dd class="agendar-resumen__total">{{ totalServicio(servicioSeleccionado) }}</dd>
              </div>
            </dl>

            <p class="caption agendar-resumen__nota">
              * El pago se realiza en el local al momento del servicio.
            </p>
          </div>
        </section>

        <!-- Botones de navegación (DESIGN §4: Un solo botón primario por vista) -->
        <div class="agendar-nav">
          <button
            v-if="paso > 1"
            class="btn btn--outline"
            type="button"
            @click="retroceder"
          >
            Atrás
          </button>
          <span v-else></span>

          <button
            v-if="paso < 3"
            class="btn btn--primary"
            type="button"
            :disabled="!puedeAvanzar"
            @click="avanzar"
          >
            Continuar
          </button>
          <button
            v-else
            class="btn btn--primary"
            type="button"
            :disabled="cargando"
            @click="confirmar"
          >
            <span v-if="cargando" class="agendar-spinner" aria-hidden="true"></span>
            {{ cargando ? 'Confirmando…' : 'Confirmar cita' }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* VistaAgendar — DESIGN §3.1 */
.agendar-page {
  background: var(--color-fondo);
  min-height: calc(100vh - var(--topbar-h));
  padding-block: var(--space-8) var(--space-16);
}

.container--agendar {
  max-width: 640px;
}

.agendar-header {
  text-align: center;
  margin-bottom: var(--space-8);
}

.agendar-header__title {
  font-family: var(--fuente-titulo);
  font-size: clamp(32px, 5vw, 44px);
  color: var(--color-marino);
  margin-top: var(--space-2);
}

.agendar-header__title em {
  font-style: italic;
  color: var(--color-azul);
}

/* Indicador de pasos */
.agendar-pasos {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-8);
  gap: var(--space-2);
}

.agendar-paso {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex: 1;
}

.agendar-paso__num {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 1.5px solid var(--color-borde-medio);
  background: var(--color-blanco);
  font-size: var(--text-caption);
  font-weight: var(--weight-semibold);
  color: var(--color-texto-suave);
  flex-shrink: 0;
}

.agendar-paso--activo .agendar-paso__num {
  border-color: var(--color-marino);
  background: var(--color-marino);
  color: var(--color-blanco);
}

.agendar-paso--completado .agendar-paso__num {
  border-color: var(--color-azul);
  background: var(--color-superficie);
  color: var(--color-azul);
}

.agendar-paso__label {
  font-size: var(--text-caption);
  font-weight: var(--weight-medium);
  color: var(--color-texto-suave);
  white-space: nowrap;
}

.agendar-paso--activo .agendar-paso__label {
  color: var(--color-marino);
  font-weight: var(--weight-semibold);
}

.agendar-paso__conector {
  flex: 1;
  height: 1px;
  background: var(--color-borde-suave);
  margin-inline: var(--space-2);
}

.agendar-paso--completado .agendar-paso__conector {
  background: var(--color-azul);
}

/* Contenido de pasos */
.agendar-paso-contenido {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.agendar-input-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.agendar-busqueda__icono {
  position: absolute;
  left: var(--space-3);
  width: 20px;
  height: 20px;
  color: var(--color-texto-suave);
  pointer-events: none;
}

.agendar-busqueda__input {
  padding-left: calc(var(--space-3) + 20px + var(--space-2));
}

/* Lista de servicios */
.agendar-servicios-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.agendar-servicio-skeleton {
  min-height: 72px;
  border: var(--borde-suave);
  border-radius: var(--radio-sm);
  background: var(--color-superficie);
}

.agendar-estado {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-8) var(--space-4);
  border: var(--borde-suave);
  border-radius: var(--radio-sm);
  background: var(--color-blanco);
  color: var(--color-texto-suave);
  font-size: var(--text-body);
  text-align: center;
}

.agendar-servicio-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  border-radius: var(--radio-sm);
  border: var(--borde-suave);
  background: var(--color-blanco);
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: all var(--dur-fast) var(--ease-out);
}

.agendar-servicio-item:hover {
  background: var(--color-superficie);
  border-color: var(--color-borde-medio);
}

.agendar-servicio-item--seleccionado {
  border-color: var(--color-marino) !important;
  background: var(--color-superficie) !important;
}

.agendar-servicio-item__badge {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: var(--radio-sm);
  background: var(--color-superficie);
  color: var(--color-marino);
  flex-shrink: 0;
}

.agendar-servicio-item__badge :deep(svg) {
  width: 22px;
  height: 22px;
}

.agendar-servicio-item__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.agendar-servicio-item__nombre {
  font-size: var(--text-body);
  font-weight: var(--weight-semibold);
  color: var(--color-marino);
}

.agendar-servicio-item__check {
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 1.5px solid var(--color-borde-medio);
  color: var(--color-marino);
}

.agendar-servicio-item--seleccionado .agendar-servicio-item__check {
  border-color: var(--color-marino);
  background: var(--color-marino);
  color: var(--color-blanco);
}

/* Paso 2: Resumen del servicio y fechas */
.agendar-servicio-resumen {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  border-radius: var(--radio-sm);
  background: var(--color-blanco);
}

.agendar-servicio-resumen__nombre {
  color: var(--color-marino);
  font-size: var(--text-body);
}

/* Selector de hora: chips en píldora de 44 px (DESIGN §3.1) */
.agendar-horarios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: var(--space-3);
  margin-top: var(--space-2);
}

.chip-hora {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: var(--borde-suave);
  border-radius: var(--radio-pill);
  background: var(--color-blanco);
  color: var(--color-marino);
  font-family: var(--fuente-texto);
  font-size: var(--text-body);
  font-weight: var(--weight-medium);
  cursor: pointer;
  transition: all var(--dur-fast) var(--ease-out);
}

.chip-hora:hover:not(:disabled) {
  background: var(--color-superficie);
  border-color: var(--color-marino);
}

.chip-hora--seleccionado {
  background: var(--color-marino) !important;
  color: var(--color-blanco) !important;
  border-color: var(--color-marino) !important;
}

.chip-hora--ocupado {
  opacity: 0.4;
  cursor: not-allowed;
  background: var(--color-fondo);
  color: var(--color-texto-suave);
  border-style: dashed;
}

/* Paso 3: Resumen */
.agendar-resumen {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.agendar-resumen__titulo {
  font-family: var(--fuente-titulo);
  font-size: 24px;
  color: var(--color-marino);
}

.agendar-resumen__lista {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin: 0;
}

.agendar-resumen__fila {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-body);
}

.agendar-resumen__fila dt {
  color: var(--color-texto-suave);
}

.agendar-resumen__fila dd {
  font-weight: var(--weight-medium);
  color: var(--color-marino);
  margin: 0;
}

.agendar-resumen__fila--total {
  font-size: var(--text-body-lg);
  font-weight: var(--weight-semibold);
}

.agendar-resumen__total {
  font-family: var(--fuente-titulo);
  font-size: 28px;
  color: var(--color-marino);
}

.agendar-resumen__nota {
  margin-top: var(--space-2);
}

/* Navegación */
.agendar-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--space-8);
  gap: var(--space-4);
}

.agendar-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Pantalla de confirmación */
.agendar-exito {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-4);
  padding: var(--space-12) var(--space-6);
}

.agendar-exito__icono {
  width: 64px;
  height: 64px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--color-superficie);
  color: var(--color-azul);
}

.agendar-exito__icono :deep(svg) {
  width: 48px;
  height: 48px;
}

.agendar-exito__titulo {
  font-family: var(--fuente-titulo);
  font-size: 36px;
  color: var(--color-marino);
}

.agendar-exito__sub {
  font-size: var(--text-body-lg);
  color: var(--color-texto-suave);
  max-width: 42ch;
  line-height: 1.5;
}

.agendar-exito__acciones {
  display: flex;
  gap: var(--space-4);
  margin-top: var(--space-4);
  flex-wrap: wrap;
  justify-content: center;
}

@media (max-width: 768px) {
  .agendar-paso__label {
    display: none;
  }
}
</style>

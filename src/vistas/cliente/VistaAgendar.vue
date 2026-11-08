<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { useAlmacenAutenticacion } from '../../almacenes/autenticacion.js';
import { useAlmacenConfiguracion } from '../../almacenes/configuracion.js';
import { formatearDuracion, formatearPrecio } from '../../recursos/formato.js';
import { listar } from '../../servicios/servicioServicios.js';
import {
  agendarCita,
  obtenerDisponibilidad,
  obtenerEstilistasPorServicio,
} from '../../servicios/servicioCitas.js';

const route = useRoute();
const router = useRouter();
const auth = useAlmacenAutenticacion();
const config = useAlmacenConfiguracion();

// Estados principales
const servicios = ref([]);
const cargandoServicios = ref(true);
const errorServicios = ref('');

const servicioSeleccionado = ref(null);
const fechaSeleccionada = ref('');
const estilistaSeleccionado = ref(null);
const horaSeleccionada = ref('');

const estilistas = ref([]);
const cargandoEstilistas = ref(false);

const horasDisponibles = ref([]);
const cargandoHoras = ref(false);

const cargandoConfirmacion = ref(false);
const errorConfirmacion = ref('');
const citaConfirmada = ref(null);

// Fechas disponibles: hasta 7 días a partir de hoy, excluyendo domingos
const fechasDisponibles = computed(() => {
  const lista = [];
  const hoy = new Date();

  for (let i = 0; i < 7; i++) {
    const dia = new Date(hoy);
    dia.setDate(hoy.getDate() + i);

    // Si es domingo (0), la peluquería está cerrada
    if (dia.getDay() === 0) continue;

    const iso = dia.toISOString().split('T')[0];
    const nombreDia = dia.toLocaleDateString('es-VE', { weekday: 'short' });
    const numeroDia = dia.getDate();
    const nombreMes = dia.toLocaleDateString('es-VE', { month: 'short' });

    lista.push({
      iso,
      nombreDia: nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1).replace('.', ''),
      numeroDia,
      nombreMes: nombreMes.replace('.', ''),
      esHoy: i === 0,
    });
  }

  return lista;
});

const fechaFormateada = computed(() => {
  if (!fechaSeleccionada.value) return '';
  const d = new Date(fechaSeleccionada.value + 'T00:00:00');
  return d.toLocaleDateString('es-VE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
});

async function cargarServicios() {
  cargandoServicios.value = true;
  errorServicios.value = '';

  try {
    const datos = await listar();
    servicios.value = Array.isArray(datos) ? datos : [];

    const servicioIdQuery = Number(route.query.servicio);
    if (servicioIdQuery) {
      const encontrado = servicios.value.find((s) => s.id === servicioIdQuery);
      if (encontrado) {
        seleccionarServicio(encontrado);
      }
    }
  } catch (e) {
    errorServicios.value = e?.response?.data?.message || 'No se pudieron cargar los servicios.';
  } finally {
    cargandoServicios.value = false;
  }
}

async function seleccionarServicio(servicio) {
  servicioSeleccionado.value = servicio;
  estilistaSeleccionado.value = null;
  horaSeleccionada.value = '';
  horasDisponibles.value = [];

  // Si no había fecha seleccionada, seleccionar la primera disponible
  if (!fechaSeleccionada.value && fechasDisponibles.value.length > 0) {
    fechaSeleccionada.value = fechasDisponibles.value[0].iso;
  }

  // Cargar los estilistas que ofrecen este servicio
  cargandoEstilistas.value = true;
  try {
    estilistas.value = await obtenerEstilistasPorServicio(servicio.id);
  } catch {
    estilistas.value = [];
  } finally {
    cargandoEstilistas.value = false;
  }

  // Si solo hay un estilista o ya había uno, seleccionarlo automáticamente
  if (estilistas.value.length === 1) {
    seleccionarEstilista(estilistas.value[0]);
  }
}

function seleccionarFecha(iso) {
  fechaSeleccionada.value = iso;
  horaSeleccionada.value = '';
  if (estilistaSeleccionado.value && servicioSeleccionado.value) {
    consultarHoras();
  }
}

function seleccionarEstilista(estilista) {
  estilistaSeleccionado.value = estilista;
  horaSeleccionada.value = '';
  if (fechaSeleccionada.value && servicioSeleccionado.value) {
    consultarHoras();
  }
}

async function consultarHoras() {
  if (!servicioSeleccionado.value || !estilistaSeleccionado.value || !fechaSeleccionada.value) {
    return;
  }

  cargandoHoras.value = true;
  horasDisponibles.value = [];

  try {
    horasDisponibles.value = await obtenerDisponibilidad(
      servicioSeleccionado.value.id,
      estilistaSeleccionado.value.id,
      fechaSeleccionada.value
    );
  } catch {
    horasDisponibles.value = [];
  } finally {
    cargandoHoras.value = false;
  }
}

watch([fechaSeleccionada, estilistaSeleccionado], () => {
  if (servicioSeleccionado.value && estilistaSeleccionado.value && fechaSeleccionada.value) {
    consultarHoras();
  }
});

async function confirmarCita() {
  if (!auth.estaAutenticado) {
    router.push({
      name: 'login',
      query: { redirect: `/agendar?servicio=${servicioSeleccionado.value.id}` },
    });
    return;
  }

  const hoyStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
  if (fechaSeleccionada.value < hoyStr) {
    errorConfirmacion.value = 'No puedes agendar en fechas pasadas.';
    return;
  }

  const d = new Date(fechaSeleccionada.value + 'T00:00:00');
  if (d.getDay() === 0) {
    errorConfirmacion.value = 'La peluquería permanece cerrada los domingos.';
    return;
  }

  cargandoConfirmacion.value = true;
  errorConfirmacion.value = '';

  try {
    const respuesta = await agendarCita({
      servicioId: servicioSeleccionado.value.id,
      estilistaId: estilistaSeleccionado.value.id,
      fecha: fechaSeleccionada.value,
      horaInicio: horaSeleccionada.value,
    });
    citaConfirmada.value = respuesta;
  } catch (e) {
    errorConfirmacion.value =
      e?.response?.data?.message || 'No se pudo confirmar la cita. Por favor intenta de nuevo.';
  } finally {
    cargandoConfirmacion.value = false;
  }
}

function reiniciarProceso() {
  citaConfirmada.value = null;
  servicioSeleccionado.value = null;
  estilistaSeleccionado.value = null;
  horaSeleccionada.value = '';
}

onMounted(cargarServicios);
</script>

<template>
  <div class="agendar-view">
    <div class="container container--agendar">
      <!-- ── 1. Pantalla de confirmación exitosa ── -->
      <div v-if="citaConfirmada" class="agendar-exito card" role="status">
        <div class="agendar-exito__icono" aria-hidden="true">
          <Icon icon="material-symbols-light:check-circle" />
        </div>
        <h1 class="agendar-exito__titulo">¡Cita confirmada!</h1>
        <p class="agendar-exito__sub">
          Tu cita de <strong>{{ citaConfirmada.servicioNombre }}</strong> con
          <strong>{{ citaConfirmada.estilistaNombre || 'tu estilista' }}</strong> ha sido reservada
          para el <strong>{{ fechaFormateada }}</strong> a las
          <strong>{{ citaConfirmada.horaInicio?.substring(0, 5) }}</strong>.
        </p>

        <div class="agendar-exito__detalles">
          <div class="detalle-item">
            <span class="detalle-label">Costo:</span>
            <span class="detalle-val">{{ formatearPrecio(citaConfirmada.costo, config.moneda) }}</span>
          </div>
          <div class="detalle-item">
            <span class="detalle-label">Estado:</span>
            <span class="detalle-val badge-ok">{{ citaConfirmada.estado }}</span>
          </div>
        </div>

        <div class="agendar-exito__acciones">
          <button class="btn btn--primary" type="button" @click="router.push({ name: 'visitas' })">
            Ver mis citas
          </button>
          <button class="btn btn--ghost" type="button" @click="reiniciarProceso">
            Agendar otra cita
          </button>
        </div>
      </div>

      <!-- ── 2. Flujo de selección y agendamiento ── -->
      <div v-else class="agendar-layout">
        <!-- Columna Izquierda: Detalle del servicio seleccionado o catálogo rápido -->
        <aside class="agendar-lateral">
          <!-- Si hay servicio seleccionado -->
          <div v-if="servicioSeleccionado" class="card servicio-ficha">
            <div class="servicio-ficha__cabecera">
              <span class="label">Servicio seleccionado</span>
              <button class="btn-cambiar" type="button" @click="servicioSeleccionado = null">
                Cambiar
              </button>
            </div>

            <div v-if="servicioSeleccionado.imagenUrl" class="servicio-ficha__img-wrap">
              <img
                :src="servicioSeleccionado.imagenUrl"
                :alt="`Foto de ${servicioSeleccionado.nombre}`"
                class="servicio-ficha__img"
              />
            </div>

            <h2 class="servicio-ficha__nombre">{{ servicioSeleccionado.nombre }}</h2>
            <p v-if="servicioSeleccionado.descripcion" class="servicio-ficha__desc">
              {{ servicioSeleccionado.descripcion }}
            </p>

            <div class="servicio-ficha__meta">
              <div class="meta-badge">
                <Icon icon="material-symbols-light:schedule" />
                <span>{{ formatearDuracion(servicioSeleccionado.duracionMinutos) }} estimado</span>
              </div>
              <div class="meta-badge meta-badge--precio">
                <span>{{ formatearPrecio(servicioSeleccionado.precio, config.moneda) }}</span>
              </div>
            </div>
          </div>

          <!-- Si aún no ha seleccionado servicio -->
          <div v-else class="card servicios-selector">
            <h2 class="servicios-selector__titulo">Elige un servicio</h2>
            <p class="servicios-selector__sub">Selecciona el servicio que deseas realizarte:</p>

            <div v-if="cargandoServicios" class="loading-state">
              <span class="spinner"></span>
              <span>Cargando servicios...</span>
            </div>

            <div v-else class="servicios-lista">
              <button
                v-for="s in servicios"
                :key="s.id"
                class="servicio-opcion"
                type="button"
                @click="seleccionarServicio(s)"
              >
                <div class="servicio-opcion__info">
                  <h3 class="servicio-opcion__nombre">{{ s.nombre }}</h3>
                  <span class="servicio-opcion__meta">
                    {{ formatearDuracion(s.duracionMinutos) }} · {{ formatearPrecio(s.precio, config.moneda) }}
                  </span>
                </div>
                <Icon icon="material-symbols-light:chevron-right" class="servicio-opcion__arrow" />
              </button>
            </div>
          </div>
        </aside>

        <!-- Columna Derecha: Selección de Fecha, Estilista y Hora -->
        <main class="agendar-principal">
          <div v-if="!servicioSeleccionado" class="placeholder-pasos card">
            <Icon icon="material-symbols-light:touch-app" class="placeholder-icono" />
            <h3>Selecciona un servicio para comenzar</h3>
            <p>Elige uno de los servicios disponibles a la izquierda para ver los estilistas y horarios.</p>
          </div>

          <div v-else class="pasos-card card">
            <!-- ── PASO 1: Selección de Fecha (Lunes a Sábado, máx 7 días) ── -->
            <section class="paso-bloque">
              <div class="paso-header">
                <span class="paso-num">1</span>
                <div>
                  <h3 class="paso-titulo">Selecciona la fecha</h3>
                  <p class="paso-desc">Atención de lunes a sábado (hasta 7 días de anticipación)</p>
                </div>
              </div>

              <div class="fechas-carrusel">
                <button
                  v-for="dia in fechasDisponibles"
                  :key="dia.iso"
                  type="button"
                  class="fecha-chip"
                  :class="{ 'fecha-chip--activa': fechaSeleccionada === dia.iso }"
                  @click="seleccionarFecha(dia.iso)"
                >
                  <span class="fecha-chip__dia">{{ dia.nombreDia }}</span>
                  <span class="fecha-chip__num">{{ dia.numeroDia }}</span>
                  <span class="fecha-chip__mes">{{ dia.nombreMes }}</span>
                </button>
              </div>
            </section>

            <!-- ── PASO 2: Selección de Estilista ── -->
            <section class="paso-bloque">
              <div class="paso-header">
                <span class="paso-num">2</span>
                <div>
                  <h3 class="paso-titulo">Selecciona tu estilista</h3>
                  <p class="paso-desc">Profesionales que ofrecen este servicio</p>
                </div>
              </div>

              <div v-if="cargandoEstilistas" class="loading-state">
                <span class="spinner"></span>
                <span>Buscando estilistas disponibles...</span>
              </div>

              <div v-else-if="estilistas.length === 0" class="empty-state">
                <p>No hay estilistas asignados a este servicio actualmente.</p>
              </div>

              <div v-else class="estilistas-grid">
                <button
                  v-for="e in estilistas"
                  :key="e.id"
                  type="button"
                  class="estilista-card"
                  :class="{ 'estilista-card--activa': estilistaSeleccionado?.id === e.id }"
                  @click="seleccionarEstilista(e)"
                >
                  <div class="estilista-avatar">
                    <span>{{ e.nombre.charAt(0) }}</span>
                  </div>
                  <div class="estilista-info">
                    <span class="estilista-nombre">{{ e.nombre }}</span>
                    <span class="estilista-tag">Estilista</span>
                  </div>
                </button>
              </div>
            </section>

            <!-- ── PASO 3: Selección de Horario Disponible ── -->
            <section v-if="estilistaSeleccionado" class="paso-bloque">
              <div class="paso-header">
                <span class="paso-num">3</span>
                <div>
                  <h3 class="paso-titulo">Selecciona la hora</h3>
                  <p class="paso-desc">Turnos disponibles para {{ fechaFormateada }}</p>
                </div>
              </div>

              <div v-if="cargandoHoras" class="loading-state">
                <span class="spinner"></span>
                <span>Calculando disponibilidad...</span>
              </div>

              <div v-else-if="horasDisponibles.length === 0" class="empty-state">
                <Icon icon="material-symbols-light:event-busy" class="empty-icon" />
                <p>No hay turnos disponibles para esta fecha con este estilista.</p>
                <span>Por favor prueba seleccionando otro día o estilista.</span>
              </div>

              <div v-else class="horas-grid">
                <button
                  v-for="h in horasDisponibles"
                  :key="h"
                  type="button"
                  class="hora-chip"
                  :class="{ 'hora-chip--activa': horaSeleccionada === h }"
                  @click="horaSeleccionada = h"
                >
                  {{ h.substring(0, 5) }}
                </button>
              </div>
            </section>

            <!-- Error de confirmación -->
            <div v-if="errorConfirmacion" class="form-error" role="alert">
              <Icon icon="material-symbols-light:error-outline" />
              <span>{{ errorConfirmacion }}</span>
            </div>

            <!-- Botón final de confirmación -->
            <div class="agendar-footer">
              <button
                type="button"
                class="btn btn--primary btn-confirmar"
                :disabled="!horaSeleccionada || cargandoConfirmacion"
                @click="confirmarCita"
              >
                <span v-if="cargandoConfirmacion" class="spinner-btn"></span>
                {{
                  !auth.estaAutenticado
                    ? 'Inicia sesión para agendar'
                    : cargandoConfirmacion
                    ? 'Confirmando cita...'
                    : 'Confirmar cita'
                }}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
.agendar-view {
  padding: var(--space-8) 0;
  min-height: calc(100vh - var(--topbar-h));
  background: var(--color-fondo);
}

.container--agendar {
  max-width: 1100px;
}

.agendar-layout {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: var(--space-6);
  align-items: start;
}

/* Columna Lateral */
.servicio-ficha {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-6);
  background: var(--color-blanco);
  border-radius: var(--radio-lg);
  border: 1px solid var(--color-borde-suave);
}

.servicio-ficha__cabecera {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.btn-cambiar {
  font-size: 13px;
  color: var(--color-azul);
  background: transparent;
  border: none;
  cursor: pointer;
  text-decoration: underline;
}

.servicio-ficha__img-wrap {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: var(--radio-md);
  overflow: hidden;
  background: var(--color-superficie);
}

.servicio-ficha__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.servicio-ficha__nombre {
  font-family: var(--fuente-titulo);
  font-size: 24px;
  color: var(--color-marino);
  margin: 0;
  line-height: 1.2;
}

.servicio-ficha__desc {
  font-size: 14px;
  color: var(--color-texto-suave);
  line-height: 1.5;
  margin: 0;
}

.servicio-ficha__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-borde-suave);
}

.meta-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: 13px;
  color: var(--color-texto-suave);
}

.meta-badge--precio {
  font-size: 18px;
  font-weight: var(--weight-bold);
  color: var(--color-marino);
}

/* Selector de servicios */
.servicios-selector {
  padding: var(--space-6);
  background: var(--color-blanco);
  border-radius: var(--radio-lg);
  border: 1px solid var(--color-borde-suave);
}

.servicios-selector__titulo {
  font-family: var(--fuente-titulo);
  font-size: 22px;
  color: var(--color-marino);
  margin: 0 0 var(--space-1);
}

.servicios-selector__sub {
  font-size: 13px;
  color: var(--color-texto-suave);
  margin: 0 0 var(--space-4);
}

.servicios-lista {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.servicio-opcion {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  background: var(--color-superficie);
  border: 1px solid var(--color-borde-suave);
  border-radius: var(--radio-md);
  cursor: pointer;
  text-align: left;
  transition: all var(--dur-fast) var(--ease-out);
}

.servicio-opcion:hover {
  border-color: var(--color-azul);
  background: var(--color-blanco);
}

.servicio-opcion__nombre {
  font-size: 15px;
  font-weight: var(--weight-semibold);
  color: var(--color-marino);
  margin: 0;
}

.servicio-opcion__meta {
  font-size: 12px;
  color: var(--color-texto-suave);
}

.servicio-opcion__arrow {
  font-size: 20px;
  color: var(--color-texto-suave);
}

/* Columna Principal */
.pasos-card {
  padding: var(--space-8);
  background: var(--color-blanco);
  border-radius: var(--radio-lg);
  border: 1px solid var(--color-borde-suave);
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.placeholder-pasos {
  padding: var(--space-12) var(--space-6);
  text-align: center;
  background: var(--color-blanco);
  border-radius: var(--radio-lg);
  border: 1px solid var(--color-borde-suave);
  color: var(--color-texto-suave);
}

.placeholder-icono {
  font-size: 48px;
  color: var(--color-azul);
  margin-bottom: var(--space-2);
}

.paso-bloque {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.paso-header {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
}

.paso-num {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border-radius: 50%;
  background: var(--color-marino);
  color: var(--color-blanco);
  font-size: 13px;
  font-weight: var(--weight-bold);
  flex-shrink: 0;
}

.paso-titulo {
  font-size: 17px;
  font-weight: var(--weight-semibold);
  color: var(--color-marino);
  margin: 0;
}

.paso-desc {
  font-size: 13px;
  color: var(--color-texto-suave);
  margin: 0;
}

/* Carrusel de Fechas */
.fechas-carrusel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(75px, 1fr));
  gap: var(--space-2);
}

.fecha-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-3) var(--space-2);
  border: 1px solid var(--color-borde-suave);
  border-radius: var(--radio-md);
  background: var(--color-superficie);
  cursor: pointer;
  transition: all var(--dur-fast) var(--ease-out);
}

.fecha-chip:hover {
  border-color: var(--color-azul);
}

.fecha-chip--activa {
  background: var(--color-marino);
  border-color: var(--color-marino);
  color: var(--color-blanco);
}

.fecha-chip__dia {
  font-size: 12px;
  font-weight: var(--weight-medium);
  text-transform: capitalize;
}

.fecha-chip__num {
  font-size: 18px;
  font-weight: var(--weight-bold);
  margin: 2px 0;
}

.fecha-chip__mes {
  font-size: 11px;
  opacity: 0.8;
  text-transform: capitalize;
}

/* Grid de Estilistas */
.estilistas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--space-3);
}

.estilista-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-borde-suave);
  border-radius: var(--radio-md);
  background: var(--color-superficie);
  cursor: pointer;
  text-align: left;
  transition: all var(--dur-fast) var(--ease-out);
}

.estilista-card:hover {
  border-color: var(--color-azul);
}

.estilista-card--activa {
  background: var(--color-marino);
  border-color: var(--color-marino);
  color: var(--color-blanco);
}

.estilista-avatar {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 50%;
  background: var(--color-azul);
  color: var(--color-blanco);
  font-size: 16px;
  font-weight: var(--weight-bold);
  flex-shrink: 0;
}

.estilista-card--activa .estilista-avatar {
  background: var(--color-blanco);
  color: var(--color-marino);
}

.estilista-info {
  display: flex;
  flex-direction: column;
}

.estilista-nombre {
  font-size: 14px;
  font-weight: var(--weight-semibold);
}

.estilista-tag {
  font-size: 12px;
  opacity: 0.75;
}

/* Grid de Horas */
.horas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: var(--space-2);
}

.hora-chip {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-borde-suave);
  border-radius: var(--radio-pill);
  background: var(--color-superficie);
  font-size: 14px;
  font-weight: var(--weight-medium);
  color: var(--color-marino);
  cursor: pointer;
  text-align: center;
  transition: all var(--dur-fast) var(--ease-out);
}

.hora-chip:hover {
  border-color: var(--color-azul);
}

.hora-chip--activa {
  background: var(--color-azul);
  border-color: var(--color-azul);
  color: var(--color-blanco);
}

/* Footer y botón confirmar */
.agendar-footer {
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-borde-suave);
}

.btn-confirmar {
  width: 100%;
  min-height: 48px;
  font-size: 16px;
  border-radius: var(--radio-pill);
}

/* Estados vacíos y de carga */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  color: var(--color-texto-suave);
  font-size: 14px;
  gap: var(--space-2);
  text-align: center;
}

.empty-icon {
  font-size: 36px;
  color: var(--color-texto-suave);
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--color-borde-medio);
  border-top-color: var(--color-azul);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.spinner-btn {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: var(--space-2);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Pantalla de éxito */
.agendar-exito {
  max-width: 560px;
  margin: var(--space-6) auto;
  padding: var(--space-8);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  background: var(--color-blanco);
  border-radius: var(--radio-lg);
  border: 1px solid var(--color-borde-suave);
}

.agendar-exito__icono {
  font-size: 64px;
  color: #0e9f6e;
}

.agendar-exito__titulo {
  font-family: var(--fuente-titulo);
  font-size: 32px;
  color: var(--color-marino);
  margin: 0;
}

.agendar-exito__sub {
  font-size: 15px;
  color: var(--color-texto-suave);
  line-height: 1.5;
  margin: 0;
}

.agendar-exito__detalles {
  display: flex;
  gap: var(--space-6);
  padding: var(--space-3) var(--space-6);
  background: var(--color-superficie);
  border-radius: var(--radio-md);
}

.detalle-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 14px;
}

.detalle-val {
  font-weight: var(--weight-bold);
  color: var(--color-marino);
}

.badge-ok {
  color: #03543f;
  background: #def7ec;
  padding: 2px 8px;
  border-radius: var(--radio-pill);
  font-size: 12px;
}

.agendar-exito__acciones {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-4);
  width: 100%;
}

.agendar-exito__acciones button {
  flex: 1;
}

@media (max-width: 860px) {
  .agendar-layout {
    grid-template-columns: 1fr;
  }
}
</style>

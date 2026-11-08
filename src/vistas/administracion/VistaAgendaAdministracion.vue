<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { Icon } from '@iconify/vue';
import { useAlmacenAutenticacion } from '../../almacenes/autenticacion.js';
import { useAlmacenConfiguracion } from '../../almacenes/configuracion.js';
import { formatearPrecio } from '../../recursos/formato.js';
import { obtenerAgendaSemanal } from '../../servicios/servicioCitas.js';
import api from '../../servicios/api.js';

const auth = useAlmacenAutenticacion();
const config = useAlmacenConfiguracion();

const esAdmin = computed(() => auth.rol === 'ADMIN');
const esPersonal = computed(() => auth.rol === 'PERSONAL');

const semanaOffset = ref(0);
const estilistas = ref([]);
const estilistaSeleccionado = ref('');
const citas = ref([]);
const cargando = ref(true);
const error = ref('');

// Día seleccionado para el panel lateral de detalle
const diaSeleccionadoIso = ref('');

// Horas de la grilla (de 8:00 AM a 7:00 PM)
const horasGrilla = [
  { hora: 8, label: '8:00 AM' },
  { hora: 9, label: '9:00 AM' },
  { hora: 10, label: '10:00 AM' },
  { hora: 11, label: '11:00 AM' },
  { hora: 12, label: '12:00 PM' },
  { hora: 13, label: '1:00 PM' },
  { hora: 14, label: '2:00 PM' },
  { hora: 15, label: '3:00 PM' },
  { hora: 16, label: '4:00 PM' },
  { hora: 17, label: '5:00 PM' },
  { hora: 18, label: '6:00 PM' },
  { hora: 19, label: '7:00 PM' },
];

// Cálculo correcto de la semana laboral (Lunes a Sábado)
function getSemanaLaboral(offset = 0) {
  const d = new Date();
  const day = d.getDay(); // 0 es Domingo, 1 es Lunes ... 6 es Sábado
  // Si hoy es domingo (0), la semana laboral de trabajo es la que empieza mañana lunes (+1)
  const diffToMonday = day === 0 ? 1 : (1 - day);

  const lunes = new Date(d.getFullYear(), d.getMonth(), d.getDate() + diffToMonday + (offset * 7));
  lunes.setHours(0, 0, 0, 0);

  const sabado = new Date(lunes.getFullYear(), lunes.getMonth(), lunes.getDate() + 5);
  sabado.setHours(23, 59, 59, 999);

  const formatoIso = (fecha) => {
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const diaNum = String(fecha.getDate()).padStart(2, '0');
    return `${y}-${m}-${diaNum}`;
  };

  return {
    inicio: formatoIso(lunes),
    fin: formatoIso(sabado),
    lunesDate: lunes,
    sabadoDate: sabado,
  };
}

const rangoSemana = computed(() => getSemanaLaboral(semanaOffset.value));

// Subtítulo legible: "Del 09 al 14 de Noviembre, 2026"
const subtituloRango = computed(() => {
  const l = rangoSemana.value.lunesDate;
  const s = rangoSemana.value.sabadoDate;
  const diaIni = String(l.getDate()).padStart(2, '0');
  const diaFin = String(s.getDate()).padStart(2, '0');
  const mesNombre = s.toLocaleDateString('es-VE', { month: 'long' });
  const mesCapitalizado = mesNombre.charAt(0).toUpperCase() + mesNombre.slice(1);
  const anio = s.getFullYear();

  return `Del ${diaIni} al ${diaFin} de ${mesCapitalizado}, ${anio}`;
});

// Columnas de los 6 días (Lun a Sáb)
const columnasDias = computed(() => {
  const dias = [];
  const base = new Date(rangoSemana.value.lunesDate);
  const nombresAbrev = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

  for (let i = 0; i < 6; i++) {
    const fecha = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const diaNum = String(fecha.getDate()).padStart(2, '0');
    const iso = `${y}-${m}-${diaNum}`;

    dias.push({
      iso,
      abrev: `${nombresAbrev[i]} ${diaNum}`,
      nombreCompleto: `${nombresAbrev[i]} ${diaNum} ${fecha.toLocaleDateString('es-VE', { month: 'short' }).toUpperCase()}`,
      fechaNum: diaNum,
    });
  }
  return dias;
});

// Cargar estilistas para filtro de admin
async function cargarEstilistas() {
  if (!esAdmin.value) return;
  try {
    const { data } = await api.get('/personal/buscar', { params: { email: '' } }).catch(() => ({ data: [] }));
    estilistas.value = Array.isArray(data) ? data : [];
  } catch {
    estilistas.value = [];
  }
}

// Cargar citas de la semana
async function cargarCitas() {
  cargando.value = true;
  error.value = '';
  try {
    const estilistaId = estilistaSeleccionado.value ? Number(estilistaSeleccionado.value) : null;
    const datos = await obtenerAgendaSemanal(
      rangoSemana.value.inicio,
      rangoSemana.value.fin,
      estilistaId
    );
    citas.value = Array.isArray(datos) ? datos : [];

    // Por defecto seleccionar el primer día de la semana o el día que ya estaba
    if (!diaSeleccionadoIso.value || !columnasDias.value.some((d) => d.iso === diaSeleccionadoIso.value)) {
      diaSeleccionadoIso.value = columnasDias.value[0]?.iso || '';
    }
  } catch (e) {
    error.value = e?.response?.data?.message || 'No se pudo cargar la agenda semanal.';
  } finally {
    cargando.value = false;
  }
}

// Estilo y color pastel de cada cita
const PALETA_COLORES = [
  { bg: '#fce7f3', border: '#f472b6', text: '#831843', icono: 'material-symbols-light:content-cut' }, // Rosa pastel
  { bg: '#ffedd5', border: '#fb923c', text: '#7c2d12', icono: 'material-symbols-light:air' }, // Melocotón/Naranja pastel
  { bg: '#e0f2fe', border: '#38bdf8', text: '#0369a1', icono: 'material-symbols-light:content-cut' }, // Azul pastel
  { bg: '#f3e8ff', border: '#c084fc', text: '#581c87', icono: 'material-symbols-light:brush' }, // Lila pastel
  { bg: '#dcfce7', border: '#4ade80', text: '#14532d', icono: 'material-symbols-light:spa' }, // Verde menta pastel
];

function obtenerEstiloCita(cita) {
  const index = (cita.id || 0) % PALETA_COLORES.length;
  return PALETA_COLORES[index];
}

// Citas organizadas por día y hora para la grilla
function citasEnSlot(diaIso, horaNum) {
  return citas.value.filter((c) => {
    if (c.fecha !== diaIso) return false;
    const horaInicioNum = parseInt(c.horaInicio.split(':')[0], 10);
    return horaInicioNum === horaNum;
  });
}

// Citas del día seleccionado para el panel lateral de detalle
const citasDelDiaSeleccionado = computed(() => {
  return citas.value
    .filter((c) => c.fecha === diaSeleccionadoIso.value)
    .sort((a, b) => (a.horaInicio || '').localeCompare(b.horaInicio || ''));
});

const infoDiaSeleccionado = computed(() => {
  const col = columnasDias.value.find((d) => d.iso === diaSeleccionadoIso.value);
  return col ? col.nombreCompleto : '';
});

function seleccionarDia(iso) {
  diaSeleccionadoIso.value = iso;
}

function irAHoy() {
  semanaOffset.value = 0;
  cargarCitas();
}

watch([semanaOffset, estilistaSeleccionado], () => {
  cargarCitas();
});

onMounted(async () => {
  await cargarEstilistas();
  await cargarCitas();
});
</script>

<template>
  <div class="agenda-container">
    <!-- Encabezado de la Agenda estilo Referencia -->
    <header class="agenda-top-header card">
      <div class="header-titulos">
        <h1 class="header-titulo">
          {{ esPersonal ? 'MI AGENDA DE TRABAJO - PELUQUERÍA ' : 'AGENDA SEMANAL - PELUQUERÍA ' }}{{ (config.nombre || 'ARMANDEUS').toUpperCase() }}
        </h1>
        <p class="header-subtitulo">{{ subtituloRango }}</p>
      </div>

      <div class="header-acciones">
        <!-- Filtro estilista (solo para admin) -->
        <div v-if="esAdmin && estilistas.length > 0" class="filtro-box">
          <select v-model="estilistaSeleccionado" class="filtro-select">
            <option value="">Todos los estilistas</option>
            <option v-for="est in estilistas" :key="est.id" :value="est.id">
              {{ est.nombre }}
            </option>
          </select>
        </div>

        <!-- Controles de navegación de semana -->
        <div class="btn-group-nav">
          <button
            class="btn btn--nav"
            type="button"
            :disabled="cargando"
            @click="semanaOffset--"
          >
            &lt; Anterior
          </button>
          <button
            class="btn btn--nav"
            type="button"
            :disabled="cargando"
            @click="irAHoy"
          >
            Hoy
          </button>
          <button
            class="btn btn--nav"
            type="button"
            :disabled="cargando"
            @click="semanaOffset++"
          >
            Siguiente &gt;
          </button>
        </div>

        <!-- Badge de Usuario -->
        <div class="usuario-badge">
          <Icon icon="material-symbols-light:account-circle" class="user-icon" />
          <span class="user-name">{{ esPersonal ? 'Estilista: ' : 'Administrador: ' }}{{ auth.nombre || 'Personal' }}</span>
        </div>
      </div>
    </header>

    <!-- Estado de Carga / Error -->
    <div v-if="cargando" class="card estado-card">
      <span class="spinner"></span>
      <p>Cargando agenda semanal...</p>
    </div>

    <div v-else-if="error" class="card estado-card error" role="alert">
      <Icon icon="material-symbols-light:error-outline" class="error-icon" />
      <p>{{ error }}</p>
      <button class="btn btn--secondary btn--sm" type="button" @click="cargarCitas">Reintentar</button>
    </div>

    <!-- Layout Principal: Grilla Semanal + Panel Lateral de Detalle -->
    <div v-else class="agenda-workspace">
      <!-- 1. Grilla Semanal Horaria -->
      <main class="grid-card card">
        <div class="horario-table-wrapper">
          <table class="horario-table">
            <thead>
              <tr>
                <th class="th-hora"></th>
                <th
                  v-for="col in columnasDias"
                  :key="col.iso"
                  class="th-dia"
                  :class="{ 'th-dia--activo': diaSeleccionadoIso === col.iso }"
                  @click="seleccionarDia(col.iso)"
                >
                  <span class="th-dia__label">{{ col.abrev }}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="h in horasGrilla" :key="h.hora" class="tr-hora">
                <!-- Columna de la hora a la izquierda -->
                <td class="td-hora-label">
                  <span>{{ h.label }}</span>
                </td>

                <!-- Celdas de los días -->
                <td
                  v-for="col in columnasDias"
                  :key="`${col.iso}-${h.hora}`"
                  class="td-dia-slot"
                  :class="{ 'td-dia-slot--activo': diaSeleccionadoIso === col.iso }"
                  @click="seleccionarDia(col.iso)"
                >
                  <!-- Tarjetas de citas en esta hora -->
                  <div
                    v-for="cita in citasEnSlot(col.iso, h.hora)"
                    :key="cita.id"
                    class="cita-grid-card"
                    :style="{
                      backgroundColor: obtenerEstiloCita(cita).bg,
                      borderLeftColor: obtenerEstiloCita(cita).border,
                      color: obtenerEstiloCita(cita).text
                    }"
                    @click.stop="seleccionarDia(col.iso)"
                  >
                    <div class="cita-grid-card__top">
                      <span class="cita-time">{{ cita.horaInicio?.substring(0, 5) }} - {{ cita.horaFin?.substring(0, 5) }}</span>
                      <Icon :icon="obtenerEstiloCita(cita).icono" class="cita-grid-card__icon" />
                    </div>
                    <div class="cita-grid-card__info">
                      <strong>{{ cita.servicioNombre }}</strong>
                      <span v-if="esAdmin" class="cita-estilista-tag"> - {{ cita.estilistaNombre?.split(' ')[0] }}</span>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>

      <!-- 2. Panel Lateral: DETALLE DEL DÍA (Estilo Referencia) -->
      <aside class="detalle-panel card">
        <header class="detalle-header">
          <h2 class="detalle-titulo">
            DETALLE DEL DÍA: {{ infoDiaSeleccionado }}
          </h2>
        </header>

        <div v-if="citasDelDiaSeleccionado.length === 0" class="detalle-vacio">
          <Icon icon="material-symbols-light:event-available" class="vacio-icon" />
          <p>Sin citas agendadas para este día.</p>
        </div>

        <div v-else class="detalle-lista">
          <article
            v-for="cita in citasDelDiaSeleccionado"
            :key="cita.id"
            class="detalle-card"
            :style="{
              backgroundColor: obtenerEstiloCita(cita).bg,
              borderLeftColor: obtenerEstiloCita(cita).border,
              color: obtenerEstiloCita(cita).text
            }"
          >
            <div class="detalle-card__top">
              <span class="detalle-hora-badge">
                {{ cita.horaInicio?.substring(0, 5) }} - {{ cita.horaFin?.substring(0, 5) }}
              </span>
              <Icon :icon="obtenerEstiloCita(cita).icono" class="detalle-card__icon" />
            </div>

            <p class="detalle-cliente">
              <strong>Cliente:</strong> {{ cita.clienteNombre || 'Cliente' }}
            </p>

            <p class="detalle-servicio">
              <strong>Servicio:</strong> {{ cita.servicioNombre }}
              <span v-if="cita.estilistaNombre" class="detalle-estilista"> - {{ cita.estilistaNombre }}</span>
            </p>

            <div class="detalle-card__footer">
              <span class="detalle-estado">{{ cita.estado }}</span>
              <span class="detalle-costo">{{ formatearPrecio(cita.costo, config.moneda) }}</span>
            </div>
          </article>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.agenda-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 24px;
  max-width: 1560px;
  margin: 0 auto;
}

/* Header superior estilo referencia */
.agenda-top-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  flex-wrap: wrap;
  gap: 16px;
}

.header-titulo {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  letter-spacing: -0.01em;
}

.header-subtitulo {
  font-size: 0.88rem;
  color: #64748b;
  margin: 2px 0 0 0;
}

.header-acciones {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.filtro-select {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-size: 0.85rem;
  color: #334155;
  background: #f8fafc;
}

.btn-group-nav {
  display: flex;
  align-items: center;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  overflow: hidden;
  background: #ffffff;
}

.btn--nav {
  padding: 6px 14px;
  background: transparent;
  border: none;
  border-right: 1px solid #cbd5e1;
  font-size: 0.85rem;
  font-weight: 500;
  color: #334155;
  cursor: pointer;
  transition: background 0.15s ease;
}

.btn--nav:last-child {
  border-right: none;
}

.btn--nav:hover:not(:disabled) {
  background: #f1f5f9;
}

.usuario-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.85rem;
  color: #334155;
  font-weight: 500;
}

.user-icon {
  font-size: 18px;
  color: #64748b;
}

/* Área de trabajo con grilla + panel lateral */
.agenda-workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 20px;
  align-items: start;
}

@media (max-width: 1100px) {
  .agenda-workspace {
    grid-template-columns: 1fr;
  }
}

/* Tarjeta de la grilla */
.grid-card {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.horario-table-wrapper {
  overflow-x: auto;
}

.horario-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

/* Encabezados de días */
.th-hora {
  width: 85px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.th-dia {
  padding: 12px 8px;
  text-align: center;
  border-bottom: 1px solid #e2e8f0;
  border-left: 1px solid #f1f5f9;
  background: #f8fafc;
  font-size: 0.85rem;
  font-weight: 700;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s ease;
}

.th-dia:hover {
  background: #f1f5f9;
}

/* Día activo destacado en azul */
.th-dia--activo {
  background: #e0f2fe !important;
  color: #0369a1;
  border-top: 3px solid #0284c7;
}

.th-dia__label {
  display: block;
  letter-spacing: 0.02em;
}

/* Filas de horas */
.tr-hora {
  height: 60px;
}

.td-hora-label {
  padding: 6px 10px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #64748b;
  text-align: right;
  vertical-align: top;
  border-bottom: 1px solid #f1f5f9;
  background: #ffffff;
  border-right: 1px solid #f1f5f9;
  white-space: nowrap;
}

.td-dia-slot {
  border-bottom: 1px solid #f1f5f9;
  border-left: 1px solid #f1f5f9;
  padding: 4px;
  vertical-align: top;
  background: #ffffff;
  cursor: pointer;
  transition: background 0.15s ease;
}

.td-dia-slot:hover {
  background: #f8fafc;
}

/* Columna activa del día tintada en azul suave */
.td-dia-slot--activo {
  background: #f0f9ff;
}

/* Tarjeta de cita dentro de la celda de la grilla */
.cita-grid-card {
  border-radius: 6px;
  border-left-width: 4px;
  border-left-style: solid;
  padding: 6px 8px;
  font-size: 0.78rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  margin-bottom: 4px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  overflow: hidden;
}

.cita-grid-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}

.cita-grid-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 700;
  font-size: 0.75rem;
  margin-bottom: 2px;
}

.cita-grid-card__icon {
  font-size: 14px;
  opacity: 0.85;
}

.cita-grid-card__info {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.75rem;
  line-height: 1.2;
}

/* Panel Lateral: Detalle del Día */
.detalle-panel {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 16px 18px;
  position: sticky;
  top: 20px;
}

.detalle-header {
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 14px;
}

.detalle-titulo {
  font-size: 0.88rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  letter-spacing: 0.02em;
}

.detalle-vacio {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  color: #94a3b8;
  text-align: center;
  font-size: 0.85rem;
  gap: 8px;
}

.vacio-icon {
  font-size: 36px;
  color: #cbd5e1;
}

.detalle-lista {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detalle-card {
  border-radius: 8px;
  border-left-width: 4px;
  border-left-style: solid;
  padding: 12px 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.detalle-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.detalle-hora-badge {
  font-weight: 700;
  font-size: 0.82rem;
}

.detalle-card__icon {
  font-size: 18px;
  opacity: 0.85;
}

.detalle-cliente,
.detalle-servicio {
  margin: 0 0 4px 0;
  font-size: 0.83rem;
  line-height: 1.35;
}

.detalle-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  padding-top: 6px;
  border-top: 1px dashed rgba(0, 0, 0, 0.1);
  font-size: 0.78rem;
}

.detalle-estado {
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.7rem;
}

.detalle-costo {
  font-weight: 800;
  font-size: 0.88rem;
}

/* Estado de carga */
.estado-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  gap: 12px;
  text-align: center;
  color: #64748b;
}

.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid #e2e8f0;
  border-top-color: #0284c7;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

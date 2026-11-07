<script setup>
import { computed, onMounted, ref } from 'vue';
import EncabezadoPagina from '../../componentes/EncabezadoPagina.vue';
import TarjetaCifra from '../../componentes/TarjetaCifra.vue';
import TablaDatos from '../../componentes/TablaDatos.vue';
import ModalServicio from '../../componentes/ModalServicio.vue';
import { listar } from '../../servicios/servicioServicios.js';
import { useAlmacenConfiguracion } from '../../almacenes/configuracion.js';

const config = useAlmacenConfiguracion();

const servicios = ref([]);
const cargando = ref(true);
const error = ref('');
const busqueda = ref('');
const modalAbierto = ref(false);
const mensajeExito = ref('');

const columnas = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'duracionMinutos', label: 'Duración' },
  { key: 'costo', label: 'Costo', align: 'right' },
];

const hayBusqueda = computed(() => busqueda.value.trim().length > 0);

const serviciosActivos = computed(() => servicios.value.length);

const serviciosFiltrados = computed(() => {
  const termino = busqueda.value.trim().toLocaleLowerCase('es');

  return servicios.value.filter(
    (servicio) => !termino || servicio.nombre.toLocaleLowerCase('es').includes(termino)
  );
});

const tituloVacio = computed(() =>
  hayBusqueda.value ? 'No hay servicios que coincidan' : 'Aún no hay servicios'
);

const descripcionVacia = computed(() =>
  hayBusqueda.value
    ? 'Prueba con otro nombre o limpia la búsqueda.'
    : 'Crea el primer servicio para que los clientes puedan agendarlo.'
);

function formatearCosto(valor) {
  const numero = Number(valor);

  if (!Number.isFinite(numero)) return '—';

  if (config.moneda) {
    try {
      return new Intl.NumberFormat('es-VE', {
        style: 'currency',
        currency: config.moneda,
      }).format(numero);
    } catch {
      // Si la configuración trae una moneda inválida, se muestra el número sin símbolo.
    }
  }

  return new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numero);
}

async function cargarServicios() {
  cargando.value = true;
  error.value = '';

  try {
    const datos = await listar();
    servicios.value = Array.isArray(datos) ? datos : [];
  } catch (excepcion) {
    error.value =
      excepcion?.response?.data?.message || 'No se pudieron cargar los servicios.';
  } finally {
    cargando.value = false;
  }
}

function abrirModal() {
  mensajeExito.value = '';
  modalAbierto.value = true;
}

async function alCrear() {
  modalAbierto.value = false;
  mensajeExito.value = 'Servicio creado correctamente.';
  await cargarServicios();
}

onMounted(cargarServicios);
</script>

<template>
  <div class="servicios-admin">
    <EncabezadoPagina
      label="Gestión de servicios"
      title="Catálogo de servicios"
      subtitle="Crea los servicios que ofrece la peluquería y consulta su costo y duración."
    >
      <template #stats>
        <TarjetaCifra :value="serviciosActivos" label="Servicios activos" />
      </template>
    </EncabezadoPagina>

    <div class="container page">
      <div class="toolbar">
        <div class="field toolbar__search">
          <label class="field__label" for="buscar-servicio">Buscar por nombre</label>
          <input
            id="buscar-servicio"
            v-model="busqueda"
            class="input"
            type="search"
            placeholder="Ej. Corte"
            autocomplete="off"
          />
        </div>

        <button class="btn btn--primary" type="button" @click="abrirModal">
          Crear servicio
        </button>
      </div>

      <p v-if="mensajeExito" class="success-message" role="status">{{ mensajeExito }}</p>

      <TablaDatos
        :columns="columnas"
        :rows="serviciosFiltrados"
        row-key="id"
        caption="Servicios activos de la peluquería"
        :loading="cargando"
        :error="error"
        :empty-title="tituloVacio"
        :empty-description="descripcionVacia"
        @retry="cargarServicios"
      >
        <template #cell-duracionMinutos="{ row }">{{ row.duracionMinutos }} min</template>
        <template #cell-costo="{ row }">{{ formatearCosto(row.costo) }}</template>
        <template #empty-action>
          <button v-if="hayBusqueda" class="btn btn--ghost" type="button" @click="busqueda = ''">
            Limpiar búsqueda
          </button>
          <button v-else class="btn btn--ghost" type="button" @click="abrirModal">
            Crear servicio
          </button>
        </template>
      </TablaDatos>
    </div>

    <ModalServicio
      :open="modalAbierto"
      @close="modalAbierto = false"
      @creado="alCrear"
    />
  </div>
</template>

<style scoped>
.servicios-admin {
  min-height: calc(100vh - var(--topbar-h));
}

.toolbar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.toolbar__search {
  width: min(100%, 360px);
}

.success-message {
  margin-bottom: var(--space-4);
  padding: var(--space-2) var(--space-3);
  border: var(--border-soft);
  border-radius: var(--radius-base);
  color: var(--color-warm-ink);
  font-size: var(--text-caption);
  font-weight: var(--weight-regular);
}

@media (max-width: 768px) {
  .toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .toolbar__search {
    width: 100%;
  }

  .toolbar .btn {
    width: 100%;
  }
}
</style>

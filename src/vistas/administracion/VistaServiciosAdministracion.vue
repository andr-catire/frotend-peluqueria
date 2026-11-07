<script setup>
import { computed, onMounted, ref } from 'vue';
import EncabezadoPagina from '../../componentes/EncabezadoPagina.vue';
import TarjetaCifra from '../../componentes/TarjetaCifra.vue';
import TarjetaServicio from '../../componentes/TarjetaServicio.vue';
import EstadoVacio from '../../componentes/EstadoVacio.vue';
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

function alCrear(servicio) {
  modalAbierto.value = false;
  mensajeExito.value = 'Servicio creado correctamente.';
  servicios.value = servicios.value.filter((existente) => existente.id !== servicio.id);
  servicios.value.push(servicio);
  ordenar();
}

function ordenar() {
  servicios.value.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}

onMounted(cargarServicios);
</script>

<template>
  <div class="servicios-admin">
    <EncabezadoPagina
      label="Gestión de servicios"
      title="Catálogo de servicios"
      accent="servicios"
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

      <div v-if="error" class="error-panel" role="alert">
        <p>{{ error }}</p>
        <button class="btn btn--ghost btn--small" type="button" @click="cargarServicios">
          Reintentar
        </button>
      </div>

      <div
        v-else-if="cargando"
        class="services-grid"
        aria-busy="true"
        aria-label="Cargando servicios"
      >
        <div v-for="fila in 3" :key="fila" class="service-skeleton" aria-hidden="true"></div>
      </div>

      <div v-else-if="serviciosFiltrados.length" class="services-grid">
        <TarjetaServicio
          v-for="servicio in serviciosFiltrados"
          :key="servicio.id"
          :servicio="servicio"
          :precio="formatearCosto(servicio.costo)"
        />
      </div>

      <EstadoVacio
        v-else
        :title="tituloVacio"
        :description="descripcionVacia"
        icon="material-symbols-light:content-cut"
      >
        <template #action>
          <button v-if="hayBusqueda" class="btn btn--ghost" type="button" @click="busqueda = ''">
            Limpiar búsqueda
          </button>
          <button v-else class="btn btn--ghost" type="button" @click="abrirModal">
            Crear servicio
          </button>
        </template>
      </EstadoVacio>
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
  background: var(--color-fondo);
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
  padding: var(--space-3) var(--space-4);
  border: var(--borde-suave);
  border-radius: var(--radio-sm);
  background: var(--color-blanco);
  color: var(--color-marino);
  font-size: var(--text-body);
  font-weight: var(--weight-medium);
}

.error-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4);
  border: 2px solid var(--color-marino);
  border-radius: var(--radio-sm);
  background: var(--color-blanco);
  color: var(--color-marino);
  font-size: var(--text-body);
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-4);
}

.service-skeleton {
  min-height: 168px;
  border: var(--borde-suave);
  border-radius: var(--radio-md);
  background: var(--color-superficie);
}

@media (max-width: 1024px) {
  .services-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
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

  .error-panel {
    align-items: stretch;
    flex-direction: column;
  }
}

@media (max-width: 640px) {
  .services-grid {
    grid-template-columns: 1fr;
  }
}
</style>

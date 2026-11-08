<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import TarjetaServicio from '../../componentes/TarjetaServicio.vue';
import EstadoVacio from '../../componentes/EstadoVacio.vue';
import { useAlmacenAutenticacion } from '../../almacenes/autenticacion.js';
import { useAlmacenConfiguracion } from '../../almacenes/configuracion.js';
import { formatearPrecio } from '../../recursos/formato.js';
import { listar } from '../../servicios/servicioServicios.js';

const router = useRouter();
const auth = useAlmacenAutenticacion();
const config = useAlmacenConfiguracion();

const servicios = ref([]);
const cargando = ref(true);
const error = ref('');
const busqueda = ref('');

const hayBusqueda = computed(() => busqueda.value.trim().length > 0);

const serviciosFiltrados = computed(() => {
  const termino = busqueda.value.trim().toLocaleLowerCase('es');

  if (!termino) return servicios.value;

  return servicios.value.filter((servicio) => {
    const nombre = servicio.nombre?.toLocaleLowerCase('es') ?? '';
    const descripcion = servicio.descripcion?.toLocaleLowerCase('es') ?? '';
    return nombre.includes(termino) || descripcion.includes(termino);
  });
});

const tituloVacio = computed(() =>
  hayBusqueda.value ? 'No se encontraron servicios' : 'Aún no hay servicios'
);

const descripcionVacia = computed(() =>
  hayBusqueda.value
    ? 'Prueba con otro término de búsqueda o limpia el filtro.'
    : 'La peluquería todavía no ha publicado servicios disponibles.'
);

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

function precioDe(servicio) {
  return formatearPrecio(servicio.precio, config.moneda);
}

function agendar(servicio) {
  if (!auth.estaAutenticado) {
    router.push({ name: 'login', query: { redirect: '/agendar' } });
    return;
  }

  router.push({ name: 'agendar', query: { servicio: servicio.id } });
}

onMounted(cargarServicios);
</script>

<template>
  <div class="servicios-vista">
    <header class="servicios-hero">
      <div class="container servicios-hero__inner">
        <p class="label">Nuestros servicios</p>
        <h1 class="servicios-hero__title">
          Experiencias de <em>belleza</em>
        </h1>
        <p class="servicios-hero__sub">
          Cada servicio está diseñado para realzar tu estilo con técnicas y productos de alta calidad.
        </p>
      </div>
    </header>

    <div class="container page--tight">
      <div class="servicios-controles">
        <div class="field servicios-controles__busqueda">
          <label class="sr-only" for="buscar-servicios-input">Buscar servicio</label>
          <div class="servicios-busqueda-wrap">
            <Icon icon="material-symbols-light:search" class="servicios-busqueda__icono" aria-hidden="true" />
            <input
              id="buscar-servicios-input"
              v-model="busqueda"
              type="search"
              placeholder="Buscar servicio…"
              class="input servicios-busqueda__input"
            />
          </div>
        </div>
      </div>

      <p v-if="!cargando && !error" class="servicios-contador caption">
        {{ serviciosFiltrados.length }}
        {{ serviciosFiltrados.length === 1 ? 'servicio disponible' : 'servicios disponibles' }}
      </p>

      <div
        v-if="cargando"
        class="servicios-grid"
        aria-busy="true"
        aria-label="Cargando servicios"
      >
        <div v-for="fila in 6" :key="fila" class="servicio-skeleton" aria-hidden="true"></div>
      </div>

      <div v-else-if="error" class="servicios-error" role="alert">
        <Icon icon="material-symbols-light:error" class="servicios-error__icon" aria-hidden="true" />
        <p>{{ error }}</p>
        <button class="btn btn--outline btn--small" type="button" @click="cargarServicios">
          Reintentar
        </button>
      </div>

      <div v-else-if="serviciosFiltrados.length > 0" class="servicios-grid">
        <TarjetaServicio
          v-for="servicio in serviciosFiltrados"
          :key="servicio.id"
          :servicio="servicio"
          :precio="precioDe(servicio)"
        >
          <template #actions>
            <button class="btn btn--outline btn--small" type="button" @click="agendar(servicio)">
              Agendar
            </button>
          </template>
        </TarjetaServicio>
      </div>

      <EstadoVacio
        v-else
        :title="tituloVacio"
        :description="descripcionVacia"
        icon="material-symbols-light:content-cut"
      >
        <template #action>
          <button
            v-if="hayBusqueda"
            class="btn btn--outline btn--small"
            type="button"
            @click="busqueda = ''"
          >
            Limpiar búsqueda
          </button>
          <button v-else class="btn btn--outline btn--small" type="button" @click="cargarServicios">
            Reintentar
          </button>
        </template>
      </EstadoVacio>
    </div>
  </div>
</template>

<style scoped>
.servicios-vista {
  min-height: calc(100vh - var(--topbar-h));
  background: var(--color-fondo);
}

.servicios-hero {
  border-bottom: var(--borde-suave);
  background: var(--color-blanco);
  padding-block: var(--space-12) var(--space-8);
  text-align: center;
}

.servicios-hero__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
}

.servicios-hero__title {
  font-family: var(--fuente-titulo);
  font-size: clamp(36px, 5vw, 56px);
  font-weight: var(--weight-regular);
  color: var(--color-marino);
  line-height: 1.1;
  margin: 0;
}

.servicios-hero__title em {
  font-style: italic;
  color: var(--color-azul);
}

.servicios-hero__sub {
  max-width: 54ch;
  font-size: var(--text-body-lg);
  color: var(--color-texto-suave);
  line-height: 1.5;
  margin: 0;
}

.servicios-controles {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  margin-top: var(--space-6);
  margin-bottom: var(--space-3);
}

.servicios-controles__busqueda {
  flex: 1;
  min-width: 240px;
  max-width: 420px;
}

.servicios-busqueda-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.servicios-busqueda__icono {
  position: absolute;
  left: var(--space-3);
  width: 20px;
  height: 20px;
  color: var(--color-texto-suave);
  pointer-events: none;
}

.servicios-busqueda__input {
  padding-left: calc(var(--space-3) + 20px + var(--space-2));
}

.servicios-contador {
  margin-bottom: var(--space-6);
}

.servicios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-6);
  margin-bottom: var(--space-12);
}

.servicio-skeleton {
  min-height: 220px;
  border: var(--borde-suave);
  border-radius: var(--radio-md);
  background: var(--color-superficie);
}

.servicios-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-12) var(--space-4);
  border: var(--borde-suave);
  border-radius: var(--radio-md);
  background: var(--color-blanco);
  text-align: center;
  margin-bottom: var(--space-12);
}

.servicios-error__icon {
  width: 32px;
  height: 32px;
  color: var(--color-marino);
}

.servicios-error p {
  color: var(--color-texto-suave);
  font-size: var(--text-body);
}

@media (max-width: 768px) {
  .servicios-controles {
    flex-direction: column;
    align-items: stretch;
  }

  .servicios-controles__busqueda {
    max-width: 100%;
  }

  .servicios-grid {
    grid-template-columns: 1fr;
  }
}
</style>

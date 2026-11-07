<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { useAlmacenAutenticacion } from '../../almacenes/autenticacion.js';

const router = useRouter();
const auth = useAlmacenAutenticacion();

const busqueda = ref('');
const categoriaActiva = ref('todos');

const categorias = [
  { id: 'todos', label: 'Todos' },
  { id: 'corte', label: 'Corte' },
  { id: 'color', label: 'Color' },
  { id: 'tratamiento', label: 'Tratamiento' },
  { id: 'estilizado', label: 'Estilizado' },
];

const servicios = [
  {
    id: 1,
    nombre: 'Corte Clásico',
    descripcion: 'Corte de cabello con tijera y acabado profesional adaptado a tu tipo de rostro.',
    precio: 25,
    duracion: '45 min',
    categoria: 'corte',
    icono: 'material-symbols-light:content-cut',
  },
  {
    id: 2,
    nombre: 'Corte y Peinado',
    descripcion: 'Corte completo más peinado con secador y productos de acabado.',
    precio: 40,
    duracion: '60 min',
    categoria: 'corte',
    icono: 'material-symbols-light:content-cut',
  },
  {
    id: 3,
    nombre: 'Coloración Completa',
    descripcion: 'Tinte de cabello en color único con materiales de alta calidad y protección del cabello.',
    precio: 85,
    duracion: '120 min',
    categoria: 'color',
    icono: 'material-symbols-light:palette',
  },
  {
    id: 4,
    nombre: 'Mechas Balayage',
    descripcion: 'Técnica de coloración degradada a mano para un efecto natural y luminoso.',
    precio: 110,
    duracion: '150 min',
    categoria: 'color',
    icono: 'material-symbols-light:palette',
  },
  {
    id: 5,
    nombre: 'Tratamiento Hidratante',
    descripcion: 'Mascarilla nutritiva de keratina para restaurar brillo y suavidad en cabello dañado.',
    precio: 45,
    duracion: '60 min',
    categoria: 'tratamiento',
    icono: 'material-symbols-light:spa',
  },
  {
    id: 6,
    nombre: 'Keratina Express',
    descripcion: 'Tratamiento alisador de larga duración que elimina el frizz y aporta suavidad profunda.',
    precio: 95,
    duracion: '120 min',
    categoria: 'tratamiento',
    icono: 'material-symbols-light:spa',
  },
  {
    id: 7,
    nombre: 'Peinado de Ocasión',
    descripcion: 'Peinado para eventos especiales, recogido o suelto según tu preferencia.',
    precio: 120,
    duracion: '150 min',
    categoria: 'estilizado',
    icono: 'material-symbols-light:face-3',
  },
  {
    id: 8,
    nombre: 'Barba y Perfil',
    descripcion: 'Arreglo de barba con navaja, contorno y productos de acabado.',
    precio: 20,
    duracion: '30 min',
    categoria: 'corte',
    icono: 'material-symbols-light:face',
  },
];

const serviciosFiltrados = computed(() => {
  return servicios.filter((s) => {
    const coincideCategoria =
      categoriaActiva.value === 'todos' || s.categoria === categoriaActiva.value;
    const coincideBusqueda =
      !busqueda.value ||
      s.nombre.toLowerCase().includes(busqueda.value.toLowerCase()) ||
      s.descripcion.toLowerCase().includes(busqueda.value.toLowerCase());
    return coincideCategoria && coincideBusqueda;
  });
});

function agendar(servicio) {
  if (!auth.estaAutenticado) {
    router.push({ name: 'login', query: { redirect: '/agendar' } });
    return;
  }
  router.push({ name: 'agendar', query: { servicio: servicio.id } });
}
</script>

<template>
  <div class="servicios-vista">
    <!-- Encabezado de la página (DESIGN §3.1) -->
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
      <!-- Barra de controles: búsqueda y filtros en píldora (DESIGN §4) -->
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

        <nav class="servicios-categorias" aria-label="Categorías de servicios">
          <button
            v-for="cat in categorias"
            :key="cat.id"
            class="chip-cat"
            :class="{ 'chip-cat--activo': categoriaActiva === cat.id }"
            type="button"
            @click="categoriaActiva = cat.id"
          >
            {{ cat.label }}
          </button>
        </nav>
      </div>

      <!-- Contador de resultados -->
      <p class="servicios-contador caption">
        {{ serviciosFiltrados.length }}
        {{ serviciosFiltrados.length === 1 ? 'servicio disponible' : 'servicios disponibles' }}
      </p>

      <!-- Cuadrícula de tarjetas de servicios (DESIGN §3.1 y §3.2) -->
      <div v-if="serviciosFiltrados.length > 0" class="servicios-grid">
        <article
          v-for="servicio in serviciosFiltrados"
          :key="servicio.id"
          class="card servicio-card"
        >
          <div class="servicio-card__header">
            <span class="servicio-card__badge">
              <Icon :icon="servicio.icono" class="servicio-card__icono" aria-hidden="true" />
              <span class="servicio-card__cat">{{ servicio.categoria }}</span>
            </span>
          </div>

          <div class="servicio-card__body">
            <h2 class="servicio-card__nombre">{{ servicio.nombre }}</h2>
            <p class="servicio-card__desc">{{ servicio.descripcion }}</p>
          </div>

          <div class="servicio-card__footer">
            <div class="servicio-card__meta">
              <span class="servicio-card__precio">${{ servicio.precio }}</span>
              <span class="servicio-card__duracion caption">
                <Icon icon="material-symbols-light:schedule" aria-hidden="true" />
                {{ servicio.duracion }}
              </span>
            </div>
            <button class="btn btn--outline btn--small" type="button" @click="agendar(servicio)">
              Agendar
            </button>
          </div>
        </article>
      </div>

      <!-- Estado vacío (DESIGN §4) -->
      <div v-else class="servicios-vacio card">
        <Icon icon="material-symbols-light:search-off" class="servicios-vacio__icon" aria-hidden="true" />
        <h2 class="servicios-vacio__title">No se encontraron servicios</h2>
        <p class="caption">Prueba con otro término de búsqueda o selecciona otra categoría.</p>
        <button class="btn btn--outline btn--small" type="button" @click="busqueda = ''; categoriaActiva = 'todos'">
          Limpiar filtros
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* VistaServicios — DESIGN §3.1
   Editorial claro: fondo casi blanco, tarjetas blancas 16 px, serifa en titulares.
*/
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

/* ── Controles ── */
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
  max-width: 360px;
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

/* Categorías en chips de píldora (DESIGN §4) */
.servicios-categorias {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.chip-cat {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: var(--space-2) var(--space-4);
  border: var(--borde-suave);
  border-radius: var(--radio-pill);
  background: var(--color-blanco);
  color: var(--color-texto-suave);
  font-family: var(--fuente-texto);
  font-size: var(--text-caption);
  font-weight: var(--weight-medium);
  cursor: pointer;
  transition: all var(--dur-fast) var(--ease-out);
}

.chip-cat:hover {
  background: var(--color-superficie);
  color: var(--color-marino);
}

.chip-cat--activo {
  background: var(--color-superficie);
  color: var(--color-marino);
  font-weight: var(--weight-semibold);
  border-color: var(--color-marino);
}

.servicios-contador {
  margin-bottom: var(--space-6);
}

/* ── Cuadrícula de tarjetas ── */
.servicios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-6);
  margin-bottom: var(--space-12);
}

.servicio-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--space-4);
  border: var(--borde-suave);
  border-radius: var(--radio-md);
  background: var(--color-blanco);
  padding: var(--space-4);
  transition: border-color var(--dur-fast) var(--ease-out);
}

.servicio-card:hover {
  border-color: var(--color-borde-medio);
}

.servicio-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.servicio-card__badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 4px var(--space-2);
  border-radius: var(--radio-pill);
  background: var(--color-superficie);
  color: var(--color-marino);
  font-size: var(--text-caption);
  font-weight: var(--weight-medium);
}

.servicio-card__icono {
  width: 16px;
  height: 16px;
}

.servicio-card__cat {
  text-transform: capitalize;
}

.servicio-card__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.servicio-card__nombre {
  font-family: var(--fuente-texto);
  font-size: 18px;
  font-weight: var(--weight-semibold);
  color: var(--color-marino);
  line-height: 1.25;
}

.servicio-card__desc {
  font-size: var(--text-body);
  color: var(--color-texto-suave);
  line-height: 1.5;
}

.servicio-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: var(--space-3);
  border-top: var(--borde-suave);
}

.servicio-card__meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.servicio-card__precio {
  font-family: var(--fuente-titulo);
  font-size: 26px;
  font-weight: var(--weight-regular);
  color: var(--color-marino);
  line-height: 1.1;
}

.servicio-card__duracion {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.servicio-card__duracion :deep(svg) {
  width: 14px;
  height: 14px;
}

/* ── Estado vacío ── */
.servicios-vacio {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-12) var(--space-4);
  text-align: center;
  margin-bottom: var(--space-12);
}

.servicios-vacio__icon {
  width: 48px;
  height: 48px;
  color: var(--color-borde-medio);
}

.servicios-vacio__title {
  font-family: var(--fuente-titulo);
  font-size: 24px;
  color: var(--color-marino);
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

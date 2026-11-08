<script setup>
import { computed, ref } from 'vue';
import { Icon } from '@iconify/vue';
import { formatearDuracion } from '../recursos/formato.js';
import { obtenerEstilistasPorServicio } from '../servicios/servicioCitas.js';

const props = defineProps({
  servicio: {
    type: Object,
    required: true,
  },
  precio: {
    type: String,
    default: '',
  },
});

const abierto = ref(false);
const estilistas = ref([]);
const cargandoEstilistas = ref(false);
const estilistasCargados = ref(false);
const errorEstilistas = ref('');

const detalleId = computed(() => `servicio-detalle-${props.servicio.id}`);
const textoBoton = computed(() => (abierto.value ? 'Ocultar detalles' : 'Ver detalles'));
const iconoBoton = computed(() =>
  abierto.value ? 'material-symbols-light:expand-less' : 'material-symbols-light:expand-more'
);

async function cargarEstilistas() {
  if (estilistasCargados.value || cargandoEstilistas.value) return;

  cargandoEstilistas.value = true;
  errorEstilistas.value = '';

  try {
    estilistas.value = await obtenerEstilistasPorServicio(props.servicio.id);
    estilistasCargados.value = true;
  } catch (excepcion) {
    errorEstilistas.value =
      excepcion?.response?.data?.message || 'No se pudieron cargar los estilistas.';
  } finally {
    cargandoEstilistas.value = false;
  }
}

async function alternarDetalles() {
  abierto.value = !abierto.value;

  if (abierto.value) {
    await cargarEstilistas();
  }
}

function reintentarEstilistas() {
  estilistasCargados.value = false;
  cargarEstilistas();
}

function inicialEstilista(nombre) {
  return (nombre?.trim()?.charAt(0) || '?').toUpperCase();
}
</script>

<template>
  <article class="service-card" :class="{ 'service-card--abierta': abierto }">
    <img
      v-if="servicio.imagenUrl"
      class="service-card__image"
      :src="servicio.imagenUrl"
      :alt="`Imagen de ${servicio.nombre}`"
      loading="lazy"
    />
    <div v-else class="service-card__image service-card__image--placeholder" aria-hidden="true">
      <Icon icon="material-symbols-light:content-cut" />
    </div>

    <header class="service-card__header">
      <h2 class="service-card__name">{{ servicio.nombre }}</h2>
    </header>

    <button
      class="service-card__toggle"
      type="button"
      :aria-expanded="abierto"
      :aria-controls="detalleId"
      @click="alternarDetalles"
    >
      <span>{{ textoBoton }}</span>
      <Icon :icon="iconoBoton" aria-hidden="true" />
    </button>

    <div v-if="abierto" :id="detalleId" class="service-card__details">
      <p v-if="servicio.descripcion" class="service-card__description">
        {{ servicio.descripcion }}
      </p>

      <dl class="service-card__data">
        <div class="service-card__data-item">
          <dt>Precio</dt>
          <dd class="service-card__price">{{ precio || '—' }}</dd>
        </div>
        <div class="service-card__data-item">
          <dt>Duración</dt>
          <dd>{{ formatearDuracion(servicio.duracionMinutos) }}</dd>
        </div>
      </dl>

      <section class="service-card__stylists" aria-live="polite">
        <h3 class="service-card__stylists-title">Estilistas que lo ofrecen</h3>

        <p v-if="cargandoEstilistas" class="service-card__status">Cargando estilistas…</p>

        <div v-else-if="errorEstilistas" class="service-card__error" role="alert">
          <p>{{ errorEstilistas }}</p>
          <button class="btn btn--ghost btn--small" type="button" @click="reintentarEstilistas">
            Reintentar
          </button>
        </div>

        <p v-else-if="estilistas.length === 0" class="service-card__status">
          Aún no hay estilistas asignados a este servicio.
        </p>

        <ul v-else class="service-card__stylist-list">
          <li v-for="estilista in estilistas" :key="estilista.id" class="service-card__stylist">
            <span class="service-card__avatar" aria-hidden="true">
              {{ inicialEstilista(estilista.nombre) }}
            </span>
            <span>{{ estilista.nombre }}</span>
          </li>
        </ul>
      </section>

      <div v-if="$slots.actions" class="service-card__actions">
        <slot name="actions" />
      </div>
    </div>
  </article>
</template>

<style scoped>
.service-card {
  display: flex;
  min-height: 168px;
  align-self: start;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-6);
  border: var(--borde-suave);
  border-radius: var(--radio-md);
  background: var(--color-blanco);
  transition: border-color var(--dur-fast) var(--ease-out);
}

.service-card:hover,
.service-card--abierta {
  border-color: var(--color-borde-medio);
}

.service-card__image {
  width: 100%;
  aspect-ratio: 4 / 3;
  border: var(--borde-suave);
  border-radius: var(--radio-sm);
  background: var(--color-superficie);
  object-fit: cover;
}

.service-card__image--placeholder {
  display: grid;
  place-items: center;
  color: var(--color-borde-medio);
}

.service-card__image--placeholder :deep(svg) {
  width: 44px;
  height: 44px;
}

.service-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
}

.service-card__name {
  font-family: var(--fuente-texto);
  font-size: var(--text-body-lg);
  font-weight: var(--weight-semibold);
  line-height: 1.3;
}

.service-card__toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  width: 100%;
  min-height: 42px;
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--color-borde-suave);
  border-radius: var(--radio-pill);
  background: var(--color-superficie);
  color: var(--color-marino);
  font: inherit;
  font-size: var(--text-body);
  font-weight: var(--weight-medium);
  cursor: pointer;
  transition:
    border-color var(--dur-fast) var(--ease-out),
    background-color var(--dur-fast) var(--ease-out);
}

.service-card__toggle:hover {
  border-color: var(--color-azul);
  background: var(--color-blanco);
}

.service-card__toggle :deep(svg) {
  width: 20px;
  height: 20px;
}

.service-card__details {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding-top: var(--space-4);
  border-top: var(--borde-suave);
}

.service-card__description {
  color: var(--color-texto-suave);
  font-size: var(--text-body);
  line-height: 1.5;
}

.service-card__data {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-3);
  margin: 0;
}

.service-card__data-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.service-card__data-item dt {
  color: var(--color-texto-suave);
  font-size: var(--text-caption);
  font-weight: var(--weight-medium);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.service-card__data-item dd {
  margin: 0;
  color: var(--color-marino);
  font-size: var(--text-body);
  font-weight: var(--weight-semibold);
}

.service-card__price {
  font-family: var(--fuente-titulo);
  font-size: 24px;
  line-height: 1.1;
}

.service-card__stylists {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.service-card__stylists-title {
  font-size: var(--text-body);
  font-weight: var(--weight-semibold);
  color: var(--color-marino);
}

.service-card__status {
  color: var(--color-texto-suave);
  font-size: var(--text-caption);
  line-height: 1.4;
}

.service-card__error {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-2);
  color: var(--color-texto-suave);
  font-size: var(--text-caption);
}

.service-card__stylist-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.service-card__stylist {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-2);
  border: var(--borde-suave);
  border-radius: var(--radio-pill);
  background: var(--color-superficie);
  color: var(--color-marino);
  font-size: var(--text-caption);
  font-weight: var(--weight-medium);
}

.service-card__avatar {
  display: grid;
  width: 24px;
  height: 24px;
  place-items: center;
  border-radius: 50%;
  background: var(--color-azul);
  color: var(--color-blanco);
  font-size: 11px;
  font-weight: var(--weight-bold);
}

.service-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  padding-top: var(--space-2);
}
</style>

<script setup>
import { Icon } from '@iconify/vue';

defineProps({
  servicio: {
    type: Object,
    required: true,
  },
  precio: {
    type: String,
    default: '',
  },
});
</script>

<template>
  <article class="service-card">
    <img
      v-if="servicio.imagenUrl"
      class="service-card__image"
      :src="servicio.imagenUrl"
      :alt="`Imagen de ${servicio.nombre}`"
      loading="lazy"
    />

    <header class="service-card__header">
      <h2 class="service-card__name">{{ servicio.nombre }}</h2>
      <span v-if="precio" class="service-card__price">{{ precio }}</span>
    </header>

    <p v-if="servicio.descripcion" class="service-card__description">
      {{ servicio.descripcion }}
    </p>

    <div class="service-card__meta">
      <Icon icon="material-symbols-light:schedule" aria-hidden="true" />
      <span>{{ servicio.duracionMinutos }} min</span>
    </div>

    <div v-if="$slots.actions" class="service-card__actions">
      <slot name="actions" />
    </div>
  </article>
</template>

<style scoped>
.service-card {
  display: flex;
  min-height: 168px;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-6);
  border: var(--borde-suave);
  border-radius: var(--radio-md);
  background: var(--color-blanco);
  transition: border-color var(--dur-fast) var(--ease-out);
}

.service-card:hover {
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

.service-card__price {
  flex-shrink: 0;
  color: var(--color-marino);
  font-family: var(--fuente-titulo);
  font-size: 24px;
  line-height: 1.1;
}

.service-card__description {
  color: var(--color-texto-suave);
  font-size: var(--text-body);
  line-height: 1.5;
}

.service-card__meta {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  margin-top: auto;
  color: var(--color-texto-suave);
  font-size: var(--text-caption);
  font-weight: var(--weight-regular);
}

.service-card__meta :deep(svg) {
  width: 16px;
  height: 16px;
}

.service-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  padding-top: var(--space-2);
}
</style>

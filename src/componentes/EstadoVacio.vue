<script setup>
import { Icon } from '@iconify/vue';

defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: 'material-symbols-light:event-note',
  },
});
</script>

<template>
  <div class="empty-state">
    <Icon v-if="icon" :icon="icon" class="empty-state__icon" aria-hidden="true" />
    <h2 class="empty-state__title">{{ title }}</h2>
    <p v-if="description" class="empty-state__description">{{ description }}</p>
    <div v-if="$slots.action" class="empty-state__action">
      <slot name="action" />
    </div>
  </div>
</template>

<style scoped>
/* EstadoVacio — DESIGN §4
   Obligatorio en todo componente que traiga datos.
*/
.empty-state {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-12) var(--space-4);
  text-align: center;
}

.empty-state__icon {
  width: 48px;
  height: 48px;
  color: var(--color-borde-medio);
}

.empty-state__title {
  font-family: var(--fuente-titulo);
  font-size: 28px;
  font-weight: var(--weight-regular);
  color: var(--color-marino);
  line-height: 1.1;
}

.empty-state__description {
  max-width: 48ch;
  color: var(--color-texto-suave);
  font-size: var(--text-body);
  line-height: 1.5;
}

.empty-state__action {
  margin-top: var(--space-2);
}
</style>

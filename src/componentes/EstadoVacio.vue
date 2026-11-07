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
.empty-state {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-16) var(--space-4);
  text-align: center;
}

.empty-state__icon {
  width: 24px;
  height: 24px;
  color: var(--color-texto-suave);
}

.empty-state__title {
  font-size: var(--text-heading-sm);
  line-height: 1.2;
}

.empty-state__description {
  max-width: 52ch;
  color: var(--color-texto-suave);
  font-size: var(--text-body-lg);
  line-height: 1.6;
}

.empty-state__action {
  margin-top: var(--space-2);
}
</style>

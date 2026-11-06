<script setup>
import { computed } from 'vue';
import { Icon } from '@iconify/vue';

const props = defineProps({
  estado: {
    type: String,
    required: true,
  },
});

const estados = {
  PENDIENTE: { label: 'Pendiente', clase: 'status--pendiente', icono: '' },
  CONFIRMADA: { label: 'Confirmada', clase: 'status--confirmada', icono: '' },
  COMPLETADA: {
    label: 'Completada',
    clase: 'status--completada',
    icono: 'material-symbols-light:check',
  },
  CANCELADA: {
    label: 'Cancelada',
    clase: 'status--cancelada',
    icono: 'material-symbols-light:close',
  },
};

const config = computed(
  () => estados[props.estado] ?? { label: props.estado, clase: 'status--desconocido', icono: '' }
);
</script>

<template>
  <span class="status" :class="config.clase">
    <Icon v-if="config.icono" :icon="config.icono" class="status__icon" aria-hidden="true" />
    <span v-else class="status__mark" aria-hidden="true"></span>
    <span class="status__text">{{ config.label }}</span>
  </span>
</template>

<style scoped>
.status {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 2px var(--space-2);
  border: 1px solid var(--color-warm-ink);
  border-radius: var(--radius-base);
  font-size: var(--text-caption);
  font-weight: var(--weight-regular);
  line-height: 1.2;
  white-space: nowrap;
}

.status__mark {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  border: 1px solid currentColor;
  border-radius: 50%;
}

.status__icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.status--pendiente {
  border-style: dashed;
}

.status--confirmada {
  border-style: solid;
}

.status--confirmada .status__mark {
  background: var(--color-warm-ink);
}

.status--completada {
  background: var(--color-powder-blue);
}

.status--cancelada {
  border-color: var(--color-powder-blue);
  border-style: dashed;
  color: var(--color-mist-gray);
}

.status--cancelada .status__text {
  text-decoration: line-through;
}

.status--desconocido {
  border-style: dashed;
  color: var(--color-mist-gray);
}
</style>

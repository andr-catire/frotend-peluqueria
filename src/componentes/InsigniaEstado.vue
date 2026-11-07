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
  gap: var(--space-2);
  padding: 4px var(--space-3);
  border: 1px solid var(--color-marino);
  border-radius: var(--radio-pill);
  color: var(--color-marino);
  font-size: var(--text-caption);
  font-weight: var(--weight-medium);
  line-height: 1.2;
  white-space: nowrap;
}

.status__mark {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  border: 1.5px solid currentColor;
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
  border-left: 3px solid var(--color-azul);
  border-style: solid;
}

.status--confirmada .status__mark {
  background: var(--color-marino);
}

.status--completada {
  border-color: var(--color-borde-suave);
  background: var(--color-superficie-fuerte);
}

.status--cancelada {
  border-color: var(--color-borde-suave);
  border-style: dashed;
  color: var(--color-texto-suave);
}

.status--cancelada .status__text {
  text-decoration: line-through;
}

.status--desconocido {
  border-style: dashed;
  color: var(--color-texto-suave);
}
</style>

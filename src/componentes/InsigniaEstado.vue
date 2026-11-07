<script setup>
import { computed } from 'vue';
import { Icon } from '@iconify/vue';

const props = defineProps({
  estado: {
    type: String,
    required: true,
  },
});

/*
  Estados de cita — DESIGN §2.2
  El estado NUNCA depende solo del color: lleva texto, icono y forma.
  Colores: solo marino, azul, superficie, borde-suave (sin colores nuevos).
*/
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
/* InsigniaEstado — DESIGN §2.2
   Píldora. Estado nunca depende solo del color: texto + icono + forma.
   Colores: marino, azul, superficie-fuerte, borde-suave. Sin colores nuevos.
*/
.status {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 3px var(--space-2);
  border: 1.5px solid var(--color-marino);
  border-radius: var(--radio-pill);
  font-family: var(--fuente-texto);
  font-size: var(--text-caption);
  font-weight: var(--weight-medium);
  line-height: 1.2;
  white-space: nowrap;
  color: var(--color-marino);
  background: var(--color-blanco);
}

/* Círculo hueco ○ — Pendiente */
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

/* PENDIENTE: borde discontinuo marino, círculo hueco, fondo blanco */
.status--pendiente {
  border-style: dashed;
}

/* CONFIRMADA: punto sólido ● + barra izquierda 3 px azul, fondo blanco */
.status--confirmada {
  border-left: 3px solid var(--color-azul);
  border-left-color: var(--color-azul);
}

.status--confirmada .status__mark {
  background: var(--color-marino);
  border-color: var(--color-marino);
}

/* COMPLETADA: icono ✓, fondo superficie-fuerte, borde suave */
.status--completada {
  background: var(--color-superficie-fuerte);
  border-color: var(--color-borde-suave);
  border-style: solid;
}

/* CANCELADA: borde discontinuo suave, texto-suave, texto tachado */
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

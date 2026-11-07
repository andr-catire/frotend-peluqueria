<script setup>
defineProps({
  value: {
    type: [String, Number],
    default: '—',
  },
  label: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <div class="stat-card">
    <span class="stat-card__value">{{ value }}</span>
    <span class="stat-card__label">{{ label }}</span>
  </div>
</template>

<style scoped>
.stat-card {
  display: flex;
  min-width: 128px;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-4) var(--space-6);
  border: var(--borde-suave);
  border-radius: var(--radio-md);
  background: var(--color-blanco);
}

.stat-card__value {
  color: var(--color-marino);
  font-family: var(--fuente-titulo);
  font-size: var(--text-heading);
  font-weight: var(--weight-regular);
  line-height: 1.1;
}

.stat-card__label {
  color: var(--color-texto-suave);
  font-size: var(--text-caption);
  font-weight: var(--weight-regular);
}
</style>

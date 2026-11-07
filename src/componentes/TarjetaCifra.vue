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
    <!-- Cifra en serifa 40 px (DESIGN §4) -->
    <span class="stat-card__value">{{ value }}</span>
    <span class="stat-card__label">{{ label }}</span>
  </div>
</template>

<style scoped>
/* TarjetaCifra — DESIGN §4
   Tarjeta blanca, borde suave, radio 16 px.
   Número en serifa 40 px, leyenda en 12 px.
*/
.stat-card {
  display: flex;
  min-width: 120px;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-4) var(--space-6);
  border: var(--borde-suave);
  border-radius: var(--radio-md);
  background: var(--color-blanco);
}

.stat-card__value {
  font-family: var(--fuente-titulo);
  font-size: 40px;
  font-weight: var(--weight-regular);
  color: var(--color-marino);
  line-height: 1.08;
}

.stat-card__label {
  color: var(--color-texto-suave);
  font-size: var(--text-caption);
  font-weight: var(--weight-regular);
}
</style>

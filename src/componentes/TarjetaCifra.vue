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
  min-width: 116px;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  border: var(--border-soft);
  border-radius: var(--radius-base);
  background: var(--color-paper-white);
}

.stat-card__value {
  font-size: var(--text-heading-lg);
  font-weight: var(--weight-light);
  line-height: 1.08;
}

.stat-card__label {
  color: var(--color-mist-gray);
  font-size: var(--text-caption);
  font-weight: var(--weight-regular);
}
</style>

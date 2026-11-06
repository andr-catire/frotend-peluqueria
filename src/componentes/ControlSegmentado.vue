<script setup>
defineProps({
  options: {
    type: Array,
    required: true,
  },
  modelValue: {
    type: String,
    required: true,
  },
  ariaLabel: {
    type: String,
    default: 'Opciones',
  },
});

const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <div class="segmented" role="group" :aria-label="ariaLabel">
    <button
      v-for="opcion in options"
      :key="opcion.value"
      class="segmented__item"
      :class="{ 'is-active': opcion.value === modelValue }"
      type="button"
      :aria-pressed="opcion.value === modelValue"
      @click="emit('update:modelValue', opcion.value)"
    >
      {{ opcion.label }}
    </button>
  </div>
</template>

<style scoped>
.segmented {
  display: inline-flex;
  overflow: hidden;
  border: var(--border-soft);
  border-radius: var(--radius-base);
}

.segmented__item {
  min-height: 44px;
  padding: var(--space-2) var(--space-4);
  border: 0;
  background: var(--color-paper-white);
  color: var(--color-warm-ink);
  font-size: var(--text-body);
  font-weight: var(--weight-light);
  transition:
    background-color var(--dur-fast) var(--ease-out),
    color var(--dur-fast) var(--ease-out);
}

.segmented__item + .segmented__item {
  border-left: var(--border-soft);
}

.segmented__item:hover {
  background: var(--color-powder-blue);
}

.segmented__item.is-active {
  background: var(--color-powder-blue);
  font-weight: var(--weight-medium);
}
</style>

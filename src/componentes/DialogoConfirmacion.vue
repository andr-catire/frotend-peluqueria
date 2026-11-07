<script setup>
import ModalFormulario from './ModalFormulario.vue';

defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  confirmLabel: {
    type: String,
    default: 'Confirmar',
  },
  cancelLabel: {
    type: String,
    default: 'Cancelar',
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['confirm', 'cancel']);
</script>

<template>
  <ModalFormulario
    :open="open"
    :title="title"
    :submit-label="confirmLabel"
    :cancel-label="cancelLabel"
    loading-label="Procesando..."
    :loading="loading"
    size="sm"
    @close="$emit('cancel')"
    @submit="$emit('confirm')"
  >
    <p class="confirm-message">{{ message }}</p>
  </ModalFormulario>
</template>

<style scoped>
.confirm-message {
  color: var(--color-marino);
  font-size: var(--text-body-lg);
  font-weight: var(--weight-regular);
  line-height: 1.6;
}
</style>

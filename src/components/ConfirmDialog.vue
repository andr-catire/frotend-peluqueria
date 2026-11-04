<script setup>
import FormModal from './FormModal.vue';

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
  <FormModal
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
  </FormModal>
</template>

<style scoped>
.confirm-message {
  font-size: var(--text-body);
  font-weight: var(--weight-light);
  line-height: 1.3;
}
</style>

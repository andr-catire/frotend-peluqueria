<script setup>
import { nextTick, onBeforeUnmount, ref, useId, watch } from 'vue';
import { Icon } from '@iconify/vue';

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    required: true,
  },
  submitLabel: {
    type: String,
    default: 'Guardar',
  },
  cancelLabel: {
    type: String,
    default: 'Cancelar',
  },
  loadingLabel: {
    type: String,
    default: 'Guardando...',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    default: 'md',
  },
});

const emit = defineEmits(['close', 'submit']);

const titleId = useId();
const panel = ref(null);
let elementoPrevio = null;
let overflowPrevio = '';

function enfocables() {
  if (!panel.value) return [];

  return Array.from(
    panel.value.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  );
}

function alPresionarTecla(evento) {
  if (evento.key === 'Escape' && !props.loading) {
    evento.stopPropagation();
    emit('close');
    return;
  }

  if (evento.key !== 'Tab') return;

  const elementos = enfocables();
  if (!elementos.length) return;

  const primero = elementos[0];
  const ultimo = elementos[elementos.length - 1];

  if (evento.shiftKey && document.activeElement === primero) {
    evento.preventDefault();
    ultimo.focus();
  } else if (!evento.shiftKey && document.activeElement === ultimo) {
    evento.preventDefault();
    primero.focus();
  }
}

async function activarFoco() {
  elementoPrevio = document.activeElement;
  overflowPrevio = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  document.addEventListener('keydown', alPresionarTecla);

  await nextTick();
  const elementos = enfocables();
  (elementos[0] ?? panel.value)?.focus();
}

function desactivarFoco() {
  document.removeEventListener('keydown', alPresionarTecla);
  document.body.style.overflow = overflowPrevio;

  if (elementoPrevio instanceof HTMLElement) {
    elementoPrevio.focus();
  }
}

watch(
  () => props.open,
  (abierto) => {
    if (abierto) {
      activarFoco();
    } else {
      desactivarFoco();
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  document.removeEventListener('keydown', alPresionarTecla);
  document.body.style.overflow = overflowPrevio;
});

function cerrar() {
  if (!props.loading) emit('close');
}

function enviar() {
  if (!props.loading) emit('submit');
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="modal-overlay" @mousedown.self="cerrar">
        <div
          ref="panel"
          class="modal__panel"
          :class="`modal__panel--${size}`"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          tabindex="-1"
        >
          <header class="modal__header">
            <h2 :id="titleId" class="modal__title">{{ title }}</h2>
            <button
              class="btn btn--icon modal__close"
              type="button"
              aria-label="Cerrar"
              :disabled="loading"
              @click="cerrar"
            >
              <Icon icon="material-symbols-light:close" aria-hidden="true" />
            </button>
          </header>

          <form class="modal__form" @submit.prevent="enviar">
            <div class="modal__body">
              <p v-if="error" class="form-error" role="alert">{{ error }}</p>
              <slot />
            </div>

            <footer class="modal__footer">
              <button class="btn btn--ghost" type="button" :disabled="loading" @click="cerrar">
                {{ cancelLabel }}
              </button>
              <button class="btn btn--primary" type="submit" :disabled="loading">
                {{ loading ? loadingLabel : submitLabel }}
              </button>
            </footer>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  overflow-y: auto;
  place-items: center;
  padding: var(--space-4);
  background: rgb(35 31 32 / 40%);
}

.modal__panel {
  display: flex;
  width: min(100%, 520px);
  max-height: 90vh;
  flex-direction: column;
  border: var(--border-ink);
  border-radius: var(--radius-base);
  background: var(--color-paper-white);
  transition: transform var(--dur-base) var(--ease-out);
}

.modal__panel--sm {
  width: min(100%, 420px);
}

.modal__header,
.modal__footer {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4);
}

.modal__header {
  justify-content: space-between;
  border-bottom: var(--border-soft);
}

.modal__title {
  font-size: var(--text-heading-sm);
  line-height: 1.1;
}

.modal__close {
  border-color: transparent;
}

.modal__close :deep(svg) {
  width: 20px;
  height: 20px;
}

.modal__form {
  display: flex;
  min-height: 0;
  flex-direction: column;
}

.modal__body {
  display: flex;
  min-height: 0;
  flex-direction: column;
  gap: var(--space-4);
  overflow-y: auto;
  padding: var(--space-4);
}

.modal__footer {
  justify-content: flex-end;
  border-top: var(--border-soft);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--dur-base) var(--ease-out);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal__panel,
.modal-leave-to .modal__panel {
  transform: scale(0.97);
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: var(--space-3);
  }

  .modal__panel {
    max-height: 92vh;
  }
}
</style>

<script setup>
import { Icon } from '@iconify/vue';
import { useRouter } from 'vue-router';
import { useAlmacenAutenticacion } from '../almacenes/autenticacion.js';

defineProps({
  title: {
    type: String,
    default: '',
  },
});

defineEmits(['toggle-sidebar']);

const router = useRouter();
const auth = useAlmacenAutenticacion();

function cerrarSesion() {
  auth.logout();
  router.push({ name: 'login' });
}
</script>

<template>
  <header class="topbar">
    <div class="topbar__left">
      <button
        class="btn btn--icon topbar__menu"
        type="button"
        aria-label="Abrir menú"
        @click="$emit('toggle-sidebar')"
      >
        <Icon icon="material-symbols-light:menu" aria-hidden="true" />
      </button>
      <span class="topbar__title">{{ title }}</span>
    </div>

    <div class="topbar__right">
      <div class="topbar__actions">
        <slot name="actions" />
      </div>

      <div class="user">
        <span class="user__initials" aria-hidden="true">{{ auth.iniciales }}</span>
        <span class="user__meta">
          <span class="user__name">{{ auth.nombre }}</span>
          <span class="user__role">{{ auth.rolLabel }}</span>
        </span>
        <button class="btn btn--icon" type="button" aria-label="Cerrar sesión" @click="cerrarSesion">
          <Icon icon="material-symbols-light:logout" aria-hidden="true" />
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  display: flex;
  min-height: var(--topbar-h);
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  border-bottom: var(--borde-suave);
  padding-inline: var(--space-6);
  background: var(--color-blanco);
}

.topbar__left,
.topbar__right,
.topbar__actions,
.user {
  display: flex;
  align-items: center;
}

.topbar__left {
  min-width: 0;
  gap: var(--space-2);
}

.topbar__right {
  gap: var(--space-4);
}

.topbar__title {
  overflow: hidden;
  color: var(--color-marino);
  font-size: var(--text-body);
  font-weight: var(--weight-medium);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.topbar__actions:empty {
  display: none;
}

.topbar__menu {
  display: none;
}

.topbar :deep(svg) {
  width: 20px;
  height: 20px;
}

.user {
  gap: var(--space-2);
}

.user__initials {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border: var(--borde-suave);
  border-radius: var(--radio-pill);
  background: var(--color-blanco);
  color: var(--color-marino);
  font-size: var(--text-body);
  font-weight: var(--weight-semibold);
}

.user__meta {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.user__name {
  color: var(--color-texto-suave);
  font-size: var(--text-body);
  font-weight: var(--weight-medium);
}

.user__role {
  color: var(--color-texto-suave);
  font-size: var(--text-caption);
  font-weight: var(--weight-regular);
}

@media (max-width: 768px) {
  .topbar {
    padding-inline: var(--space-3);
  }

  .topbar__menu {
    display: inline-flex;
  }

  .topbar__actions {
    display: none;
  }

  .user__meta {
    display: none;
  }
}
</style>

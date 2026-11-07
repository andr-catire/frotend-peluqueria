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
/* BarraSuperior — DESIGN §3.2
   64 px, fondo blanco, borde inferior suave.
   Iniciales en círculo con borde suave, nombre y rol en texto suave.
*/
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
  font-family: var(--fuente-texto);
  font-size: var(--text-body);
  font-weight: var(--weight-medium);
  color: var(--color-texto-suave);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.topbar__actions:empty {
  display: none;
}

.topbar__menu {
  display: none;
  border-color: transparent;
}

.topbar :deep(svg) {
  width: 20px;
  height: 20px;
}

.user {
  gap: var(--space-2);
}

/* Iniciales: círculo con borde suave (DESIGN §3.2) */
.user__initials {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border: var(--borde-suave);
  border-radius: 50%;
  background: var(--color-superficie);
  font-family: var(--fuente-texto);
  font-size: var(--text-caption);
  font-weight: var(--weight-semibold);
  color: var(--color-marino);
}

.user__meta {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}

.user__name {
  font-size: var(--text-caption);
  font-weight: var(--weight-medium);
  color: var(--color-marino);
}

.user__role {
  color: var(--color-texto-suave);
  font-size: 11px;
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

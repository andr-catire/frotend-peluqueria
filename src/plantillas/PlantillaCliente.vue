<script setup>
import { computed } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { useAlmacenAutenticacion } from '../almacenes/autenticacion.js';
import { useAlmacenConfiguracion } from '../almacenes/configuracion.js';

const route = useRoute();
const router = useRouter();
const auth = useAlmacenAutenticacion();
const config = useAlmacenConfiguracion();

const navItems = [
  { name: 'servicios', label: 'Servicios', icon: 'material-symbols-light:content-cut' },
  { name: 'agendar', label: 'Agendar', icon: 'material-symbols-light:calendar-month' },
  { name: 'mis-citas', label: 'Mis citas', icon: 'material-symbols-light:event-note' },
  { name: 'perfil', label: 'Perfil', icon: 'material-symbols-light:person' },
];

const nombreMarca = computed(() => config.nombre);

function esActiva(name) {
  return route.name === name;
}

function cerrarSesion() {
  auth.logout();
  router.push({ name: 'login' });
}
</script>

<template>
  <div class="cliente-layout">
    <header class="topbar">
      <div class="topbar__inner">
        <RouterLink class="brand" :to="{ name: 'inicio' }" aria-label="Ir al inicio">
          <span class="brand__mark" aria-hidden="true">P</span>
          <span class="brand__name">{{ nombreMarca }}</span>
        </RouterLink>

        <nav class="nav" aria-label="Navegación principal">
          <RouterLink
            v-for="item in navItems"
            :key="item.name"
            :to="{ name: item.name }"
            class="nav__link"
            :class="{ 'is-active': esActiva(item.name) }"
            :aria-current="esActiva(item.name) ? 'page' : undefined"
          >
            {{ item.label }}
          </RouterLink>
        </nav>

        <div class="user">
          <template v-if="auth.estaAutenticado">
            <span class="user__initials" aria-hidden="true">{{ auth.iniciales }}</span>
            <span class="user__meta">
              <span class="user__name">{{ auth.nombre }}</span>
              <span class="user__role">{{ auth.rolLabel }}</span>
            </span>
            <button class="btn btn--ghost btn--small" type="button" @click="cerrarSesion">
              Salir
            </button>
          </template>
          <RouterLink v-else class="btn btn--ghost btn--small" :to="{ name: 'login' }">
            Iniciar sesión
          </RouterLink>
        </div>
      </div>
    </header>

    <main class="cliente-main">
      <slot />
    </main>

    <nav class="bottom-nav" aria-label="Navegación móvil">
      <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="{ name: item.name }"
        class="bottom-nav__link"
        :class="{ 'is-active': esActiva(item.name) }"
        :aria-current="esActiva(item.name) ? 'page' : undefined"
      >
        <Icon :icon="item.icon" aria-hidden="true" />
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>
  </div>
</template>

<style scoped>
.cliente-layout {
  min-height: 100vh;
  background: var(--color-paper-white);
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: var(--border-soft);
  background: var(--color-paper-white);
}

.topbar__inner {
  display: flex;
  width: min(100% - 32px, var(--page-max));
  min-height: var(--topbar-h);
  align-items: center;
  gap: var(--space-6);
  margin-inline: auto;
}

.brand {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-body);
  font-weight: var(--weight-medium);
  text-decoration: none;
}

.brand__mark {
  display: grid;
  width: 28px;
  aspect-ratio: 1;
  place-items: center;
  border: var(--border-ink);
  border-radius: var(--radius-base);
  background: var(--color-powder-blue);
  font-size: var(--text-body-lg);
}

.nav {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.nav__link {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  padding-inline: var(--space-1);
  border-bottom: 2px solid transparent;
  color: var(--color-mist-gray);
  font-size: var(--text-body);
  font-weight: var(--weight-light);
  text-decoration: none;
}

.nav__link:hover,
.nav__link.is-active {
  color: var(--color-warm-ink);
  text-decoration: none;
}

.nav__link.is-active {
  border-bottom-color: var(--color-slate-bloom);
  font-weight: var(--weight-medium);
}

.user {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-left: auto;
}

.user__initials {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border: var(--border-ink);
  border-radius: var(--radius-base);
  font-size: var(--text-caption);
  font-weight: var(--weight-regular);
}

.user__meta {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}

.user__name {
  font-size: var(--text-caption);
  font-weight: var(--weight-regular);
}

.user__role {
  color: var(--color-mist-gray);
  font-size: var(--text-label);
  font-weight: var(--weight-regular);
}

.cliente-main {
  min-height: calc(100vh - var(--topbar-h));
}

.bottom-nav {
  display: none;
}

@media (max-width: 768px) {
  .topbar__inner {
    width: min(100% - 24px, var(--page-max));
    gap: var(--space-2);
  }

  .nav {
    display: none;
  }

  .brand__name {
    max-width: 42vw;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .user__meta {
    display: none;
  }

  .cliente-main {
    padding-bottom: 64px;
  }

  .bottom-nav {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 20;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    border-top: var(--border-soft);
    background: var(--color-paper-white);
  }

  .bottom-nav__link {
    display: flex;
    min-height: 56px;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 2px;
    color: var(--color-mist-gray);
    font-size: var(--text-label);
    font-weight: var(--weight-regular);
    text-decoration: none;
  }

  .bottom-nav__link :deep(svg) {
    width: 20px;
    height: 20px;
  }

  .bottom-nav__link.is-active {
    background: var(--color-powder-blue);
    color: var(--color-warm-ink);
    font-weight: var(--weight-medium);
  }
}
</style>

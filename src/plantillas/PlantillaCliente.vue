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

const navItems = computed(() => {
  const items = [
    { name: 'servicios', label: 'Servicios', icon: 'material-symbols-light:content-cut' },
    { name: 'agendar', label: 'Agendar', icon: 'material-symbols-light:calendar-month' },
    { name: 'visitas', label: 'Visitas', icon: 'material-symbols-light:event-note' },
    { name: 'perfil', label: 'Perfil', icon: 'material-symbols-light:person' },
  ];

  if (auth.rol === 'ADMIN') {
    items.push({
      name: 'admin-servicios',
      label: 'Panel de control',
      icon: 'material-symbols-light:dashboard',
    });
  }

  if (auth.rol === 'PERSONAL') {
    items.push({
      name: 'admin-agenda',
      label: 'Mi agenda',
      icon: 'material-symbols-light:calendar-month',
    });
  }

  return items;
});

const mostrarReservar = computed(() => auth.estaAutenticado && auth.rol !== 'ADMIN');

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
        <RouterLink class="brand" :to="{ name: 'servicios' }" aria-label="Ir a servicios">
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
          <RouterLink
            v-if="mostrarReservar"
            class="btn btn--primary btn--small user__reservar"
            :to="{ name: 'agendar' }"
          >
            Reservar
          </RouterLink>
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

    <RouterLink
      v-if="mostrarReservar"
      class="btn btn--primary btn--small reserva-movil"
      :to="{ name: 'agendar' }"
    >
      Reservar cita
    </RouterLink>

    <nav
      class="bottom-nav"
      aria-label="Navegación móvil"
      :style="{ '--nav-count': navItems.length }"
    >
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
  background: var(--color-fondo);
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: var(--borde-suave);
  background: var(--color-blanco);
}

.topbar__inner {
  display: flex;
  width: min(100% - 32px, var(--page-max));
  min-height: var(--topbar-h);
  align-items: center;
  gap: var(--space-8);
  margin-inline: auto;
}

.brand {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--fuente-titulo);
  font-size: 22px;
  font-weight: var(--weight-regular);
  text-decoration: none;
}

.brand__mark {
  display: grid;
  width: 32px;
  aspect-ratio: 1;
  place-items: center;
  border: var(--borde-suave);
  border-radius: var(--radio-pill);
  background: var(--color-superficie);
  color: var(--color-marino);
  font-family: var(--fuente-titulo);
  font-size: 20px;
}

.nav {
  display: flex;
  align-items: center;
  gap: var(--space-6);
}

.nav__link {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  padding-inline: var(--space-1);
  border-bottom: 2px solid transparent;
  color: var(--color-texto-suave);
  font-size: var(--text-body-lg);
  font-weight: var(--weight-medium);
  text-decoration: none;
}

.nav__link:hover,
.nav__link.is-active {
  color: var(--color-marino);
  text-decoration: none;
}

.nav__link.is-active {
  border-bottom-color: var(--color-azul);
  font-weight: var(--weight-semibold);
}

.user {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-left: auto;
}

.user__reservar {
  white-space: nowrap;
}

.reserva-movil {
  display: none;
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
  color: var(--color-marino);
  font-size: var(--text-body);
  font-weight: var(--weight-medium);
}

.user__role {
  color: var(--color-texto-suave);
  font-size: var(--text-caption);
  font-weight: var(--weight-regular);
}

.cliente-main {
  min-height: calc(100vh - var(--topbar-h));
}

.bottom-nav {
  display: none;
}

@media (max-width: 900px) {
  .topbar__inner {
    width: min(100% - 24px, var(--page-max));
    gap: var(--space-3);
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
    padding-bottom: 72px;
  }

  .user__reservar {
    display: none;
  }

  .reserva-movil {
    position: fixed;
    right: var(--space-4);
    bottom: calc(64px + var(--space-4));
    z-index: 19;
    display: inline-flex;
    box-shadow: none;
  }

  .bottom-nav {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 20;
    display: grid;
    grid-template-columns: repeat(var(--nav-count, 4), minmax(0, 1fr));
    border-top: var(--borde-suave);
    background: var(--color-blanco);
  }

  .bottom-nav__link {
    display: flex;
    min-height: 64px;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 2px;
    padding-inline: 2px;
    color: var(--color-texto-suave);
    font-size: var(--text-caption);
    font-weight: var(--weight-regular);
    text-decoration: none;
  }

  .bottom-nav__link span {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .bottom-nav__link :deep(svg) {
    width: 20px;
    height: 20px;
  }

  .bottom-nav__link.is-active {
    background: var(--color-superficie);
    color: var(--color-marino);
    font-weight: var(--weight-semibold);
  }
}
</style>

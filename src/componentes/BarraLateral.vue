<script setup>
import { computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { Icon } from '@iconify/vue';
import { useAlmacenAutenticacion } from '../almacenes/autenticacion.js';
import { useAlmacenConfiguracion } from '../almacenes/configuracion.js';

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['close']);

const route = useRoute();
const auth = useAlmacenAutenticacion();
const config = useAlmacenConfiguracion();

const nombreMarca = computed(() => config.nombre);

const items = computed(() => {
  if (auth.rol === 'PERSONAL') {
    return [
      {
        name: 'no-autorizado',
        label: 'Mi agenda',
        icon: 'material-symbols-light:calendar-month',
        query: { motivo: 'personal' },
      },
      { name: 'admin-asistencia', label: 'Asistencia', icon: 'material-symbols-light:schedule' },
    ];
  }

  return [
    { name: 'admin-servicios', label: 'Servicios', icon: 'material-symbols-light:content-cut' },
    { name: 'admin-personal', label: 'Personal', icon: 'material-symbols-light:group' },
    { name: 'admin-asistencia', label: 'Asistencia', icon: 'material-symbols-light:schedule' },
  ];
});

function esActiva(item) {
  return route.name === item.name;
}

function destino(item) {
  return item.query ? { name: item.name, query: item.query } : { name: item.name };
}
</script>

<template>
  <button
    v-if="props.open"
    class="sidebar-overlay"
    type="button"
    aria-label="Cerrar menú"
    @click="$emit('close')"
  ></button>

  <aside class="sidebar" :class="{ 'is-open': props.open }" aria-label="Navegación del panel">
    <div class="sidebar__top">
      <RouterLink class="brand" :to="{ name: 'inicio' }" aria-label="Ir al inicio">
        <span class="brand__mark" aria-hidden="true">P</span>
        <span class="brand__name">{{ nombreMarca }}</span>
      </RouterLink>

      <button
        class="btn btn--icon sidebar__close"
        type="button"
        aria-label="Cerrar menú"
        @click="$emit('close')"
      >
        <Icon icon="material-symbols-light:close" aria-hidden="true" />
      </button>
    </div>

    <nav class="sidebar__nav" aria-label="Secciones del panel">
      <RouterLink
        v-for="item in items"
        :key="`${item.name}-${item.label}`"
        :to="destino(item)"
        class="nav-link"
        :class="{ 'is-active': esActiva(item) }"
        :title="item.label"
        :aria-current="esActiva(item) ? 'page' : undefined"
        @click="$emit('close')"
      >
        <Icon :icon="item.icon" aria-hidden="true" />
        <span class="nav-link__label">{{ item.label }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  position: sticky;
  top: 0;
  display: flex;
  width: var(--sidebar-w);
  height: 100vh;
  flex-shrink: 0;
  flex-direction: column;
  border-right: var(--border-soft);
  background: var(--color-paper-white);
}

.sidebar__top {
  display: flex;
  min-height: var(--topbar-h);
  align-items: center;
  justify-content: space-between;
  border-bottom: var(--border-soft);
  padding-inline: var(--space-4);
}

.brand {
  display: inline-flex;
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
  flex-shrink: 0;
  place-items: center;
  border: var(--border-ink);
  border-radius: var(--radius-base);
  background: var(--color-powder-blue);
  font-size: var(--text-body-lg);
}

.sidebar__close {
  display: none;
  border-color: transparent;
}

.sidebar__close :deep(svg) {
  width: 20px;
  height: 20px;
}

.sidebar__nav {
  display: flex;
  flex-direction: column;
  padding-block: var(--space-2);
}

.nav-link {
  display: flex;
  min-height: 44px;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-4);
  border-left: 2px solid transparent;
  color: var(--color-warm-ink);
  font-size: var(--text-body);
  font-weight: var(--weight-light);
  text-decoration: none;
}

.nav-link:hover {
  background: color-mix(in srgb, var(--color-powder-blue) 40%, transparent);
  text-decoration: none;
}

.nav-link.is-active {
  border-left-color: var(--color-slate-bloom);
  background: var(--color-powder-blue);
  font-weight: var(--weight-medium);
}

.nav-link :deep(svg) {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.sidebar-overlay {
  display: none;
}

@media (max-width: 1024px) {
  .sidebar {
    width: var(--sidebar-w-compact);
  }

  .sidebar__top {
    justify-content: center;
    padding-inline: var(--space-2);
  }

  .brand__name,
  .nav-link__label {
    display: none;
  }

  .nav-link {
    justify-content: center;
    padding-inline: var(--space-2);
  }
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 30;
    width: var(--sidebar-w);
    height: 100vh;
    transform: translateX(-100%);
    transition: transform var(--dur-base) var(--ease-out);
  }

  .sidebar.is-open {
    transform: translateX(0);
  }

  .sidebar__top {
    justify-content: space-between;
    padding-inline: var(--space-4);
  }

  .brand__name,
  .nav-link__label {
    display: inline;
  }

  .nav-link {
    justify-content: flex-start;
    padding-inline: var(--space-4);
  }

  .sidebar__close {
    display: inline-flex;
  }

  .sidebar-overlay {
    position: fixed;
    inset: 0;
    z-index: 20;
    display: block;
    width: 100%;
    height: 100%;
    padding: 0;
    border: 0;
    background: rgb(35 31 32 / 40%);
  }
}
</style>

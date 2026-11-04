<script setup>
import { computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import PageHeader from '../components/PageHeader.vue';
import EmptyState from '../components/EmptyState.vue';

const route = useRoute();

const esAuth = computed(() => route.meta.layout === 'auth');
const esNoEncontrado = computed(() => route.name === 'no-encontrado');
const esNoAutorizado = computed(() => route.name === 'no-autorizado');
const esPersonal = computed(() => route.query.motivo === 'personal');

const titulo = computed(() => {
  if (esNoEncontrado.value) return 'Página no encontrada';
  if (esNoAutorizado.value) return 'Acceso restringido';
  return route.meta.title || 'En construcción';
});

const etiqueta = computed(() => {
  if (esNoEncontrado.value) return 'Error 404';
  if (esNoAutorizado.value) return 'Acceso';
  return 'En construcción';
});

const mensaje = computed(() => {
  if (esNoEncontrado.value) return 'La página que buscas no existe o cambió de dirección.';
  if (esPersonal.value) return 'Tu panel estará disponible pronto.';
  if (esNoAutorizado.value) return 'No tienes permisos para ver esta sección.';
  return 'Esta sección se implementará en una próxima fase.';
});

const tituloVacio = computed(() => {
  if (esNoEncontrado.value) return 'No encontramos esta página';
  if (esNoAutorizado.value) return esPersonal.value ? 'Panel no disponible' : 'No autorizado';
  return 'En construcción';
});

const icono = computed(() => {
  if (esNoEncontrado.value) return 'material-symbols-light:search';
  if (esNoAutorizado.value) return 'material-symbols-light:close';
  return 'material-symbols-light:schedule';
});
</script>

<template>
  <div v-if="esAuth" class="auth-placeholder">
    <EmptyState :title="titulo" :description="mensaje" :icon="icono">
      <template #action>
        <RouterLink class="btn btn--ghost" :to="{ name: 'inicio' }">Volver al inicio</RouterLink>
      </template>
    </EmptyState>
  </div>

  <div v-else class="placeholder">
    <PageHeader :label="etiqueta" :title="titulo" :subtitle="mensaje" />

    <div class="container page">
      <EmptyState :title="tituloVacio" :description="mensaje" :icon="icono">
        <template #action>
          <RouterLink class="btn btn--ghost" :to="{ name: 'inicio' }">Volver al inicio</RouterLink>
        </template>
      </EmptyState>
    </div>
  </div>
</template>

<style scoped>
.auth-placeholder {
  border: var(--border-ink);
  border-radius: var(--radius-base);
  background: var(--color-paper-white);
}

.placeholder {
  min-height: calc(100vh - var(--topbar-h));
}
</style>

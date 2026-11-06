<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import PlantillaAutenticacion from './plantillas/PlantillaAutenticacion.vue';
import PlantillaCliente from './plantillas/PlantillaCliente.vue';
import PlantillaAdministracion from './plantillas/PlantillaAdministracion.vue';

const route = useRoute();
const layout = computed(() => route.meta.layout ?? 'cliente');
</script>

<template>
  <PlantillaAutenticacion v-if="layout === 'auth'">
    <RouterView />
  </PlantillaAutenticacion>

  <PlantillaAdministracion v-else-if="layout === 'admin'">
    <RouterView />
  </PlantillaAdministracion>

  <PlantillaCliente v-else-if="layout === 'cliente'">
    <RouterView />
  </PlantillaCliente>

  <RouterView v-else />
</template>

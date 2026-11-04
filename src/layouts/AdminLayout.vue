<script setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import AppSidebar from '../components/AppSidebar.vue';
import AppTopbar from '../components/AppTopbar.vue';

const route = useRoute();
const sidebarAbierto = ref(false);
const titulo = computed(() => route.meta.title || 'Panel');
</script>

<template>
  <div class="admin-layout">
    <AppSidebar :open="sidebarAbierto" @close="sidebarAbierto = false" />

    <div class="admin-content">
      <AppTopbar :title="titulo" @toggle-sidebar="sidebarAbierto = true">
        <template #actions>
          <slot name="actions" />
        </template>
      </AppTopbar>

      <main class="admin-main">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: var(--color-paper-white);
}

.admin-content {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
}

.admin-main {
  flex: 1;
}
</style>

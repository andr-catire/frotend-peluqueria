<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AuthLayout from './layouts/AuthLayout.vue';
import ClienteLayout from './layouts/ClienteLayout.vue';
import AdminLayout from './layouts/AdminLayout.vue';

const route = useRoute();
const layout = computed(() => route.meta.layout ?? 'cliente');
</script>

<template>
  <AuthLayout v-if="layout === 'auth'">
    <RouterView />
  </AuthLayout>

  <AdminLayout v-else-if="layout === 'admin'">
    <RouterView />
  </AdminLayout>

  <ClienteLayout v-else-if="layout === 'cliente'">
    <RouterView />
  </ClienteLayout>

  <RouterView v-else />
</template>

import { createRouter, createWebHistory } from 'vue-router';
import HealthView from '../views/cliente/HealthView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'health',
      component: HealthView,
    },
  ],
});

export default router;
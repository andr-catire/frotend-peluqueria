import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';
import EnConstruccionView from '../views/EnConstruccionView.vue';
import HealthView from '../views/cliente/HealthView.vue';

const routes = [
  {
    path: '/login',
    name: 'login',
    component: EnConstruccionView,
    meta: { layout: 'auth', guestOnly: true, title: 'Iniciar sesión' },
  },
  {
    path: '/registro',
    name: 'registro',
    component: EnConstruccionView,
    meta: { layout: 'auth', guestOnly: true, title: 'Crear cuenta' },
  },
  {
    path: '/',
    name: 'inicio',
    component: EnConstruccionView,
    meta: { layout: 'cliente', title: 'Inicio' },
  },
  {
    path: '/servicios',
    name: 'servicios',
    component: EnConstruccionView,
    meta: { layout: 'cliente', title: 'Servicios' },
  },
  {
    path: '/agendar',
    name: 'agendar',
    component: EnConstruccionView,
    meta: { layout: 'cliente', requiresAuth: true, roles: ['CLIENTE'], title: 'Agendar cita' },
  },
  {
    path: '/mis-citas',
    name: 'mis-citas',
    component: EnConstruccionView,
    meta: { layout: 'cliente', requiresAuth: true, roles: ['CLIENTE'], title: 'Mis citas' },
  },
  {
    path: '/perfil',
    name: 'perfil',
    component: EnConstruccionView,
    meta: { layout: 'cliente', requiresAuth: true, roles: ['CLIENTE'], title: 'Mi perfil' },
  },
  {
    path: '/admin',
    redirect: { name: 'admin-servicios' },
  },
  {
    path: '/admin/servicios',
    name: 'admin-servicios',
    component: EnConstruccionView,
    meta: { layout: 'admin', requiresAuth: true, roles: ['ADMIN'], title: 'Servicios' },
  },
  {
    path: '/admin/personal',
    name: 'admin-personal',
    component: EnConstruccionView,
    meta: { layout: 'admin', requiresAuth: true, roles: ['ADMIN'], title: 'Personal' },
  },
  {
    path: '/admin/asistencia',
    name: 'admin-asistencia',
    component: EnConstruccionView,
    meta: { layout: 'admin', requiresAuth: true, roles: ['ADMIN'], title: 'Asistencia' },
  },
  {
    path: '/no-autorizado',
    name: 'no-autorizado',
    component: EnConstruccionView,
    meta: { layout: 'blank', title: 'Acceso restringido' },
  },
  {
    path: '/estado',
    name: 'estado',
    component: HealthView,
    meta: { layout: 'blank', title: 'Estado del backend' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'no-encontrado',
    component: EnConstruccionView,
    meta: { layout: 'blank', title: 'Página no encontrada' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

router.beforeEach((to) => {
  const auth = useAuthStore();

  if (to.meta.guestOnly && auth.estaAutenticado) {
    return auth.rutaInicio;
  }

  if (to.meta.requiresAuth && !auth.estaAutenticado) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    };
  }

  if (to.meta.roles && !to.meta.roles.includes(auth.rol)) {
    return { name: 'no-autorizado' };
  }

  return true;
});

router.afterEach((to) => {
  const titulo = to.meta.title ? `${to.meta.title} · Peluquería` : 'Peluquería';
  document.title = titulo;
});

export default router;

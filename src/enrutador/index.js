import { createRouter, createWebHistory } from 'vue-router';
import { useAlmacenAutenticacion } from '../almacenes/autenticacion.js';
import VistaEnConstruccion from '../vistas/VistaEnConstruccion.vue';
import VistaServiciosAdministracion from '../vistas/administracion/VistaServiciosAdministracion.vue';
import VistaPersonalAdministracion from '../vistas/administracion/VistaPersonalAdministracion.vue';
import VistaSalud from '../vistas/cliente/VistaSalud.vue';
import VistaLogin from '../vistas/autenticacion/VistaLogin.vue';
import VistaRegistro from '../vistas/autenticacion/VistaRegistro.vue';
import VistaServicios from '../vistas/cliente/VistaServicios.vue';
import VistaAgendar from '../vistas/cliente/VistaAgendar.vue';

const routes = [
  {
    path: '/login',
    name: 'login',
    component: VistaLogin,
    meta: { layout: 'auth', guestOnly: true, title: 'Iniciar sesión' },
  },
  {
    path: '/registro',
    name: 'registro',
    component: VistaRegistro,
    meta: { layout: 'auth', guestOnly: true, title: 'Crear cuenta' },
  },
  {
    path: '/',
    name: 'inicio',
    component: VistaEnConstruccion,
    meta: { layout: 'cliente', title: 'Inicio' },
  },
  {
    path: '/servicios',
    name: 'servicios',
    component: VistaServicios,
    meta: { layout: 'cliente', title: 'Servicios' },
  },
  {
    path: '/agendar',
    name: 'agendar',
    component: VistaAgendar,
    meta: { layout: 'cliente', requiresAuth: true, roles: ['CLIENTE'], title: 'Agendar cita' },
  },
  {
    path: '/mis-citas',
    name: 'mis-citas',
    component: VistaEnConstruccion,
    meta: { layout: 'cliente', requiresAuth: true, roles: ['CLIENTE'], title: 'Mis citas' },
  },
  {
    path: '/perfil',
    name: 'perfil',
    component: VistaEnConstruccion,
    meta: { layout: 'cliente', requiresAuth: true, roles: ['CLIENTE'], title: 'Mi perfil' },
  },
  {
    path: '/admin',
    redirect: { name: 'admin-servicios' },
  },
  {
    path: '/admin/servicios',
    name: 'admin-servicios',
    component: VistaServiciosAdministracion,
    meta: { layout: 'admin', requiresAuth: true, roles: ['ADMIN'], title: 'Servicios' },
  },
  {
    path: '/admin/personal',
    name: 'admin-personal',
    component: VistaPersonalAdministracion,
    meta: { layout: 'admin', requiresAuth: true, roles: ['ADMIN'], title: 'Personal' },
  },
  {
    path: '/admin/asistencia',
    name: 'admin-asistencia',
    component: VistaEnConstruccion,
    meta: { layout: 'admin', requiresAuth: true, roles: ['ADMIN'], title: 'Asistencia' },
  },
  {
    path: '/no-autorizado',
    name: 'no-autorizado',
    component: VistaEnConstruccion,
    meta: { layout: 'blank', title: 'Acceso restringido' },
  },
  {
    path: '/estado',
    name: 'estado',
    component: VistaSalud,
    meta: { layout: 'blank', title: 'Estado del backend' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'no-encontrado',
    component: VistaEnConstruccion,
    meta: { layout: 'blank', title: 'Página no encontrada' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

router.beforeEach((to) => {
  const auth = useAlmacenAutenticacion();

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
  const titulo = to.meta.title ? `${to.meta.title} · Armandeus` : 'Armandeus';
  document.title = titulo;
});

export default router;

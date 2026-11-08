<script setup>
import { ref, reactive } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { useAlmacenAutenticacion } from '../../almacenes/autenticacion.js';
import { login as loginApi } from '../../servicios/servicioAutenticacion.js';

const router = useRouter();
const route = useRoute();
const auth = useAlmacenAutenticacion();

const form = reactive({ email: '', password: '' });
const cargando = ref(false);
const error = ref('');

/** Vuelve a la ruta pedida (por ejemplo, el QR de asistencia) solo si es interna. */
function destinoTrasLogin() {
  const destino = route.query.redirect;
  if (typeof destino === 'string' && destino.startsWith('/') && !destino.startsWith('//')) {
    return destino;
  }
  return auth.rutaInicio;
}

async function iniciarSesion() {
  if (!form.email || !form.password) {
    error.value = 'Por favor completa todos los campos.';
    return;
  }
  cargando.value = true;
  error.value = '';
  try {
    const datos = await loginApi(form.email, form.password);
    auth.login(datos);
    router.push(destinoTrasLogin());
  } catch (e) {
    const mensaje = e?.response?.data?.message || e?.message;
    error.value = mensaje || 'Credenciales incorrectas. Intenta de nuevo.';
  } finally {
    cargando.value = false;
  }
}
</script>

<template>
  <div class="login-wrap">
    <!-- Panel decorativo izquierdo (aria-hidden: solo decorativo) -->
    <div class="login-deco" aria-hidden="true">
      <div class="login-deco__inner">
        <p class="login-deco__label">Sistema de gestión</p>
        <h1 class="login-deco__title">
          Arte en cada<br><em>corte.</em>
        </h1>
        <p class="login-deco__sub">
          Gestiona citas, servicios y personal desde un solo lugar.
        </p>
        <div class="login-deco__accent"></div>
      </div>
    </div>

    <!-- Panel del formulario -->
    <div class="login-form-panel">
      <div class="login-form-inner">
        <!-- Marca -->
        <div class="login-brand">
          <span class="login-brand__mark" aria-hidden="true">P</span>
          <span class="login-brand__name">Peluquería</span>
        </div>

        <!-- Título -->
        <div class="login-header">
          <h2 class="login-title">Bienvenido</h2>
          <p class="login-subtitle">Inicia sesión en tu cuenta</p>
        </div>

        <!-- Formulario -->
        <form class="login-form" @submit.prevent="iniciarSesion" novalidate>
          <div class="field">
            <label class="field__label" for="login-email">Correo electrónico</label>
            <input
              id="login-email"
              v-model="form.email"
              class="input"
              type="email"
              autocomplete="email"
              placeholder="tu@correo.com"
              :disabled="cargando"
            />
          </div>

          <div class="field">
            <label class="field__label" for="login-password">Contraseña</label>
            <input
              id="login-password"
              v-model="form.password"
              class="input"
              type="password"
              autocomplete="current-password"
              placeholder="••••••••"
              :disabled="cargando"
            />
          </div>

          <div v-if="error" class="form-error" role="alert">{{ error }}</div>

          <button
            id="btn-login"
            type="submit"
            class="btn btn--primary login-submit"
            :disabled="cargando"
          >
            <span v-if="cargando" class="login-spinner" aria-hidden="true"></span>
            {{ cargando ? 'Entrando...' : 'Iniciar sesión' }}
          </button>
        </form>

        <p class="login-register">
          ¿No tienes cuenta?
          <RouterLink :to="{ name: 'registro' }" class="login-register__link">Crear cuenta</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* VistaLogin — DESIGN §3.1
   Dos columnas: panel decorativo marino a la izq, formulario sobre fondo a la der.
   En móvil: solo el formulario.
*/
.login-wrap {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
}

/* === PANEL DECORATIVO === */
.login-deco {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-12);
  background: var(--color-marino);
  overflow: hidden;
}

/* Curva decorativa estática (DESIGN §2.6: líneas curvas decorativas estáticas) */
.login-deco::before {
  content: '';
  position: absolute;
  top: 0;
  right: -80px;
  bottom: 0;
  width: 160px;
  background: var(--color-fondo);
  border-radius: 50% 0 0 50% / 50% 0 0 50%;
}

.login-deco__inner {
  position: relative;
  z-index: 1;
  max-width: 380px;
}

/* Etiqueta: azul sobre marino — blanco/azul sobre marino cumple 14.2:1 */
.login-deco__label {
  font-family: var(--fuente-texto);
  font-size: var(--text-caption);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-azul);
  margin: 0 0 var(--space-4);
}

/* Titular serifa con <em> en cursiva azul (DESIGN §1 y §2.4) */
.login-deco__title {
  font-family: var(--fuente-titulo);
  font-size: clamp(48px, 5vw, 72px);
  font-weight: var(--weight-regular);
  line-height: 1.0;
  color: var(--color-blanco);
  margin: 0 0 var(--space-6);
}

.login-deco__title em {
  font-style: italic;
  color: var(--color-azul);
}

.login-deco__sub {
  font-size: var(--text-body-lg);
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  margin: 0;
}

/* Acento: línea corta azul */
.login-deco__accent {
  margin-top: var(--space-8);
  width: 48px;
  height: 2px;
  background: var(--color-azul);
  border-radius: 1px;
}

/* === PANEL FORMULARIO === */
.login-form-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
  background: var(--color-fondo);
}

.login-form-inner {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.login-brand {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
}

.login-brand__mark {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border: var(--borde-fuerte);
  border-radius: var(--radio-sm);
  background: var(--color-superficie);
  font-family: var(--fuente-titulo);
  font-size: var(--text-body-lg);
  color: var(--color-marino);
}

.login-brand__name {
  font-family: var(--fuente-titulo);
  font-size: 22px;
  font-weight: var(--weight-regular);
  color: var(--color-marino);
}

.login-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.login-title {
  font-family: var(--fuente-titulo);
  font-size: 36px;
  font-weight: var(--weight-regular);
  color: var(--color-marino);
  line-height: 1.1;
}

.login-subtitle {
  font-size: var(--text-body);
  color: var(--color-texto-suave);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* Botón primario: ancho completo, píldora, marino con texto blanco */
.login-submit {
  width: 100%;
  margin-top: var(--space-2);
}

/* Spinner de carga */
.login-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.login-register {
  text-align: center;
  font-size: var(--text-caption);
  color: var(--color-texto-suave);
}

.login-register__link {
  color: var(--color-azul);
  text-decoration: underline;
  text-underline-offset: 2px;
}

/* Móvil: ocultar panel decorativo */
@media (max-width: 768px) {
  .login-wrap {
    grid-template-columns: 1fr;
  }

  .login-deco {
    display: none;
  }

  .login-form-panel {
    padding: var(--space-6);
  }
}
</style>

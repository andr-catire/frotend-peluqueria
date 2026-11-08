<script setup>
import { reactive, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { useAlmacenAutenticacion } from '../../almacenes/autenticacion.js';
import { login as loginApi } from '../../servicios/servicioAutenticacion.js';

const route = useRoute();
const router = useRouter();
const auth = useAlmacenAutenticacion();

const form = reactive({ email: '', password: '' });
const cargando = ref(false);
const error = ref('');
const mostrarPassword = ref(false);

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
    const datos = await loginApi(form.email.trim(), form.password.trim());
    auth.login(datos);
    router.push(destinoTrasLogin());
  } catch (e) {
    if (!e?.response || e.code === 'ERR_NETWORK' || e.message === 'Network Error') {
      error.value = 'No se pudo conectar con el servidor. Verifica que el backend esté iniciado.';
    } else if (e.response?.status === 401) {
      error.value = e.response.data?.message || 'Credenciales incorrectas. Intenta de nuevo.';
    } else if (e.response?.status === 400) {
      error.value = e.response.data?.message || 'Por favor ingresa un correo y contraseña válidos.';
    } else if (e.response?.status >= 500) {
      error.value = 'Ocurrió un error en el servidor. Por favor intenta más tarde.';
    } else {
      error.value = e.response?.data?.message || 'No fue posible iniciar sesión. Intenta de nuevo.';
    }
  } finally {
    cargando.value = false;
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Panel decorativo izquierdo (estilo apaisado / horizontal como en la referencia) -->
      <div class="login-card__deco" aria-hidden="true">
        <!-- Curvas y geometrías decorativas de fondo -->
        <div class="deco-shape deco-shape--circle"></div>
        <div class="deco-shape deco-shape--pill"></div>
        <div class="deco-shape deco-shape--line"></div>

        <div class="login-card__deco-content">
          <p class="login-deco__label">Sistema de gestión</p>
          <h1 class="login-deco__title">
            Arte en cada<br />
            <em>corte.</em>
          </h1>
          <p class="login-deco__sub">
            Gestiona citas, servicios y personal de manera ágil desde un solo lugar.
          </p>
          <div class="login-deco__accent"></div>
        </div>
      </div>

      <!-- Panel del formulario -->
      <div class="login-card__form-panel">
        <div class="login-form-inner">
          <div class="login-header">
            <h2 class="login-title">Bienvenido</h2>
            <p class="login-subtitle">Inicia sesión en tu cuenta</p>
          </div>

          <form class="login-form" @submit.prevent="iniciarSesion" novalidate>
            <!-- Campo de correo -->
            <div class="field">
              <label class="field__label" for="login-email">Correo electrónico</label>
              <div class="input-wrap">
                <Icon
                  icon="material-symbols-light:mail-outline"
                  class="input-icon"
                  aria-hidden="true"
                />
                <input
                  id="login-email"
                  v-model="form.email"
                  class="input input--icon"
                  type="email"
                  autocomplete="email"
                  placeholder="tu@correo.com"
                  :disabled="cargando"
                />
              </div>
            </div>

            <!-- Campo de contraseña con botón de ver/ocultar -->
            <div class="field">
              <label class="field__label" for="login-password">Contraseña</label>
              <div class="input-wrap">
                <Icon
                  icon="material-symbols-light:lock-outline"
                  class="input-icon"
                  aria-hidden="true"
                />
                <input
                  id="login-password"
                  v-model="form.password"
                  class="input input--icon input--action"
                  :type="mostrarPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  placeholder="••••••••"
                  :disabled="cargando"
                />
                <button
                  type="button"
                  class="btn-toggle-eye"
                  :disabled="cargando"
                  :aria-label="mostrarPassword ? 'Ocultar contraseña' : 'Ver contraseña'"
                  @click="mostrarPassword = !mostrarPassword"
                >
                  <Icon
                    :icon="
                      mostrarPassword
                        ? 'material-symbols-light:visibility-off-outline'
                        : 'material-symbols-light:visibility-outline'
                    "
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>

            <!-- Mensaje de error -->
            <div v-if="error" class="form-error" role="alert">
              <Icon icon="material-symbols-light:error-outline" class="form-error__icon" aria-hidden="true" />
              <span>{{ error }}</span>
            </div>

            <!-- Botón de submit -->
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
            <RouterLink :to="{ name: 'registro' }" class="login-register__link">
              Crear cuenta
            </RouterLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Contenedor exterior centrado sin scroll en desktop */
.login-container {
  width: 100%;
  max-width: 1040px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Tarjeta apaisada / alargada (estilo de la imagen de referencia) */
.login-card {
  width: 100%;
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  min-height: 520px;
  max-height: calc(100vh - 120px);
  background: var(--color-blanco);
  border-radius: 28px;
  border: 1px solid var(--color-borde-suave);
  box-shadow:
    0 24px 60px -12px rgba(0, 43, 73, 0.14),
    0 12px 28px -6px rgba(0, 43, 73, 0.08);
  overflow: hidden;
}

/* === PANEL DECORATIVO IZQUIERDO === */
.login-card__deco {
  position: relative;
  background: var(--color-marino);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-10) var(--space-12);
  overflow: hidden;
}

/* Formas decorativas con la paleta marino/azul */
.deco-shape {
  position: absolute;
  pointer-events: none;
}

.deco-shape--circle {
  top: -60px;
  right: -60px;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(26, 115, 232, 0.28) 0%, rgba(0, 43, 73, 0) 70%);
}

.deco-shape--pill {
  bottom: -40px;
  left: -20px;
  width: 260px;
  height: 120px;
  border-radius: var(--radio-pill);
  transform: rotate(-25deg);
  background: linear-gradient(135deg, rgba(26, 115, 232, 0.18), rgba(255, 255, 255, 0.04));
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.deco-shape--line {
  top: 30%;
  right: 15%;
  width: 90px;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--color-azul), transparent);
}

.login-card__deco-content {
  position: relative;
  z-index: 1;
  max-width: 400px;
}

.login-deco__label {
  font-family: var(--fuente-texto);
  font-size: var(--text-caption);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-azul);
  margin: 0 0 var(--space-4);
}

.login-deco__title {
  font-family: var(--fuente-titulo);
  font-size: clamp(38px, 4vw, 56px);
  font-weight: var(--weight-regular);
  line-height: 1.05;
  color: var(--color-blanco);
  margin: 0 0 var(--space-5);
}

.login-deco__title em {
  font-style: italic;
  color: var(--color-azul);
}

.login-deco__sub {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.78);
  line-height: 1.6;
  margin: 0;
}

.login-deco__accent {
  margin-top: var(--space-6);
  width: 54px;
  height: 3px;
  background: var(--color-azul);
  border-radius: var(--radio-pill);
}

/* === PANEL DEL FORMULARIO === */
.login-card__form-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8) var(--space-10);
  background: var(--color-blanco);
  overflow-y: auto;
}

.login-form-inner {
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.login-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.login-title {
  font-family: var(--fuente-titulo);
  font-size: 32px;
  font-weight: var(--weight-regular);
  color: var(--color-marino);
  line-height: 1.15;
  margin: 0;
}

.login-subtitle {
  font-size: var(--text-body);
  color: var(--color-texto-suave);
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* Input con icono interno y botón de acción */
.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.input-icon {
  position: absolute;
  left: 14px;
  font-size: 20px;
  color: var(--color-texto-suave);
  pointer-events: none;
  transition: color var(--dur-fast) var(--ease-out);
}

.input--icon {
  padding-left: 44px;
}

.input--action {
  padding-right: 44px;
}

.input-wrap:focus-within .input-icon {
  color: var(--color-azul);
}

/* Botón de ojito para alternar ver/ocultar contraseña */
.btn-toggle-eye {
  position: absolute;
  right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-texto-suave);
  font-size: 20px;
  border-radius: var(--radio-sm);
  cursor: pointer;
  transition: color var(--dur-fast) var(--ease-out);
}

.btn-toggle-eye:hover {
  color: var(--color-marino);
}

.btn-toggle-eye:focus-visible {
  outline: 2px solid var(--color-azul);
  outline-offset: 1px;
}

/* Botón de envío */
.login-submit {
  width: 100%;
  min-height: 48px;
  margin-top: var(--space-2);
  font-size: 15px;
  border-radius: var(--radio-pill);
}

/* Spinner dentro del botón */
.login-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  margin-right: var(--space-2);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Mensaje de error */
.form-error {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: #fdf2f2;
  border: 1px solid #f8b4b4;
  border-radius: var(--radio-sm);
  color: #9b1c1c;
  font-size: var(--text-caption);
  line-height: 1.4;
}

.form-error__icon {
  font-size: 18px;
  flex-shrink: 0;
}

/* Enlace a registro */
.login-register {
  text-align: center;
  font-size: var(--text-caption);
  color: var(--color-texto-suave);
  margin: 0;
}

.login-register__link {
  color: var(--color-azul);
  font-weight: var(--weight-semibold);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.login-register__link:hover {
  color: var(--color-marino);
}

/* === RESPONSIVE (Tablet y Móvil) === */
@media (max-width: 860px) {
  .login-card {
    grid-template-columns: 1fr;
    max-height: none;
    min-height: auto;
    border-radius: 20px;
  }

  .login-card__deco {
    padding: var(--space-8) var(--space-6);
  }

  .login-deco__title {
    font-size: 32px;
  }

  .login-card__form-panel {
    padding: var(--space-8) var(--space-6);
  }
}

@media (max-width: 480px) {
  .login-card__deco {
    display: none;
  }

  .login-card__form-panel {
    padding: var(--space-6) var(--space-4);
  }
}
</style>
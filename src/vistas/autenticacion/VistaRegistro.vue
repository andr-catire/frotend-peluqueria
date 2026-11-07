<script setup>
import { ref, reactive } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { Icon } from '@iconify/vue';

const router = useRouter();

const form = reactive({ nombre: '', email: '', password: '', confirmar: '' });
const cargando = ref(false);
const error = ref('');
const paso = ref(1); // 1 = datos, 2 = éxito

async function registrar() {
  error.value = '';
  if (!form.nombre || !form.email || !form.password || !form.confirmar) {
    error.value = 'Por favor completa todos los campos.';
    return;
  }
  if (form.password.length < 8) {
    error.value = 'La contraseña debe tener al menos 8 caracteres.';
    return;
  }
  if (form.password !== form.confirmar) {
    error.value = 'Las contraseñas no coinciden.';
    return;
  }
  cargando.value = true;
  try {
    // Simulación de registro
    await new Promise(r => setTimeout(r, 1000));
    paso.value = 2;
  } catch (e) {
    error.value = e.message || 'Error al crear la cuenta. Intenta de nuevo.';
  } finally {
    cargando.value = false;
  }
}
</script>

<template>
  <div class="reg-wrap">
    <!-- Panel decorativo izquierdo (DESIGN §3.1) -->
    <div class="reg-deco" aria-hidden="true">
      <div class="reg-deco__inner">
        <p class="reg-deco__label">Nuevo cliente</p>
        <h1 class="reg-deco__title">Tu estilo,<br><em>tu identidad.</em></h1>
        <p class="reg-deco__sub">Crea tu cuenta y accede a nuestra agenda de citas de forma rápida y sencilla.</p>
        <ul class="reg-deco__perks">
          <li>Reserva tus citas en cualquier momento</li>
          <li>Consulta la disponibilidad en tiempo real</li>
          <li>Historial y seguimiento de tus citas</li>
        </ul>
        <div class="reg-deco__accent"></div>
      </div>
    </div>

    <!-- Panel del formulario -->
    <div class="reg-form-panel">
      <div class="reg-form-inner">
        <!-- Éxito -->
        <div v-if="paso === 2" class="reg-success">
          <div class="reg-success__icon" aria-hidden="true">
            <Icon icon="material-symbols-light:check" />
          </div>
          <h2 class="reg-success__title">¡Cuenta creada!</h2>
          <p class="reg-success__sub">Tu cuenta ha sido creada exitosamente. Ya puedes iniciar sesión.</p>
          <RouterLink :to="{ name: 'login' }" class="btn btn--primary reg-success__btn">
            Iniciar sesión
          </RouterLink>
        </div>

        <!-- Formulario -->
        <template v-else>
          <div class="reg-brand">
            <span class="reg-brand__mark" aria-hidden="true">P</span>
            <span class="reg-brand__name">Peluquería</span>
          </div>

          <div class="reg-header">
            <h2 class="reg-title">Crear cuenta</h2>
            <p class="reg-subtitle">Ingresa tus datos para registrarte</p>
          </div>

          <form class="reg-form" @submit.prevent="registrar" novalidate>
            <div class="field">
              <label class="field__label" for="reg-nombre">Nombre completo</label>
              <input
                id="reg-nombre"
                v-model="form.nombre"
                class="input"
                type="text"
                autocomplete="name"
                placeholder="Ej. Ana Pérez"
                :disabled="cargando"
              />
            </div>

            <div class="field">
              <label class="field__label" for="reg-email">Correo electrónico</label>
              <input
                id="reg-email"
                v-model="form.email"
                class="input"
                type="email"
                autocomplete="email"
                placeholder="tu@correo.com"
                :disabled="cargando"
              />
            </div>

            <div class="field">
              <label class="field__label" for="reg-password">Contraseña</label>
              <input
                id="reg-password"
                v-model="form.password"
                class="input"
                type="password"
                autocomplete="new-password"
                placeholder="Mínimo 8 caracteres"
                :disabled="cargando"
              />
            </div>

            <div class="field">
              <label class="field__label" for="reg-confirmar">Confirmar contraseña</label>
              <input
                id="reg-confirmar"
                v-model="form.confirmar"
                class="input"
                type="password"
                autocomplete="new-password"
                placeholder="Repite la contraseña"
                :disabled="cargando"
              />
            </div>

            <div v-if="error" class="form-error" role="alert">{{ error }}</div>

            <button
              id="btn-registro"
              type="submit"
              class="btn btn--primary reg-submit"
              :disabled="cargando"
            >
              <span v-if="cargando" class="reg-spinner" aria-hidden="true"></span>
              {{ cargando ? 'Creando cuenta...' : 'Crear cuenta' }}
            </button>
          </form>

          <p class="reg-login">
            ¿Ya tienes cuenta?
            <RouterLink :to="{ name: 'login' }" class="reg-login__link">Iniciar sesión</RouterLink>
          </p>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* VistaRegistro — DESIGN §3.1 */
.reg-wrap {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
}

/* === PANEL DECORATIVO === */
.reg-deco {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-12);
  background: var(--color-marino);
  overflow: hidden;
}

.reg-deco::before {
  content: '';
  position: absolute;
  top: 0;
  right: -80px;
  bottom: 0;
  width: 160px;
  background: var(--color-fondo);
  border-radius: 50% 0 0 50% / 50% 0 0 50%;
}

.reg-deco__inner {
  position: relative;
  z-index: 1;
  max-width: 380px;
}

.reg-deco__label {
  font-family: var(--fuente-texto);
  font-size: var(--text-caption);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-azul);
  margin: 0 0 var(--space-4);
}

.reg-deco__title {
  font-family: var(--fuente-titulo);
  font-size: clamp(48px, 5vw, 72px);
  font-weight: var(--weight-regular);
  line-height: 1.0;
  color: var(--color-blanco);
  margin: 0 0 var(--space-6);
}

.reg-deco__title em {
  font-style: italic;
  color: var(--color-azul);
}

.reg-deco__sub {
  font-size: var(--text-body-lg);
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.6;
  margin-bottom: var(--space-6);
}

.reg-deco__perks {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  font-size: var(--text-body);
  color: rgba(255, 255, 255, 0.9);
}

.reg-deco__accent {
  margin-top: var(--space-8);
  width: 48px;
  height: 2px;
  background: var(--color-azul);
  border-radius: 1px;
}

/* === PANEL FORMULARIO === */
.reg-form-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
  background: var(--color-fondo);
}

.reg-form-inner {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.reg-brand {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
}

.reg-brand__mark {
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

.reg-brand__name {
  font-family: var(--fuente-titulo);
  font-size: 22px;
  font-weight: var(--weight-regular);
  color: var(--color-marino);
}

.reg-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.reg-title {
  font-family: var(--fuente-titulo);
  font-size: 36px;
  font-weight: var(--weight-regular);
  color: var(--color-marino);
  line-height: 1.1;
}

.reg-subtitle {
  font-size: var(--text-body);
  color: var(--color-texto-suave);
}

.reg-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.reg-submit {
  width: 100%;
  margin-top: var(--space-2);
}

.reg-spinner {
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

.reg-login {
  text-align: center;
  font-size: var(--text-caption);
  color: var(--color-texto-suave);
}

.reg-login__link {
  color: var(--color-azul);
  text-decoration: underline;
  text-underline-offset: 2px;
}

/* Estado de éxito */
.reg-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-4);
  padding: var(--space-6) 0;
}

.reg-success__icon {
  width: 64px;
  height: 64px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--color-superficie);
  color: var(--color-marino);
}

.reg-success__icon :deep(svg) {
  width: 36px;
  height: 36px;
}

.reg-success__title {
  font-family: var(--fuente-titulo);
  font-size: 32px;
  color: var(--color-marino);
}

.reg-success__sub {
  font-size: var(--text-body);
  color: var(--color-texto-suave);
  max-width: 32ch;
}

.reg-success__btn {
  margin-top: var(--space-4);
  width: 100%;
}

@media (max-width: 768px) {
  .reg-wrap {
    grid-template-columns: 1fr;
  }

  .reg-deco {
    display: none;
  }

  .reg-form-panel {
    padding: var(--space-6);
  }
}
</style>

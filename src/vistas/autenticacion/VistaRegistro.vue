<script setup>
import { reactive, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { Icon } from '@iconify/vue';
import { registrar as registrarApi } from '../../servicios/servicioAutenticacion.js';

const form = reactive({
  nombre: '',
  email: '',
  password: '',
  confirmar: '',
  cedula: '',
  telefono: '',
});

const cargando = ref(false);
const error = ref('');
const paso = ref(1); // 1 = datos, 2 = éxito
const mostrarPassword = ref(false);
const mostrarConfirmar = ref(false);

async function registrar() {
  error.value = '';
  if (
    !form.nombre ||
    !form.email ||
    !form.password ||
    !form.confirmar ||
    !form.cedula ||
    !form.telefono
  ) {
    error.value = 'Por favor completa todos los campos.';
    return;
  }
  if (!/^([VEve]-?)?\d{5,9}$/.test(form.cedula.trim())) {
    error.value = 'La cédula debe tener entre 5 y 9 dígitos (Ej. V-12345678).';
    return;
  }
  if (!/^\+?\d[\d\s()-]{6,19}$/.test(form.telefono.trim())) {
    error.value =
      'El teléfono solo puede contener números, espacios, guiones y paréntesis (Ej. 0414-1234567).';
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
    await registrarApi({
      nombre: form.nombre.trim(),
      email: form.email.trim(),
      password: form.password,
      cedula: form.cedula.trim(),
      telefono: form.telefono.trim(),
    });
    paso.value = 2;
  } catch (e) {
    if (!e?.response || e.code === 'ERR_NETWORK' || e.message === 'Network Error') {
      error.value = 'No se pudo conectar con el servidor. Verifica que el backend esté iniciado.';
    } else if (e.response?.status === 409) {
      error.value = e.response.data?.message || 'Este correo electrónico ya está registrado.';
    } else if (e.response?.status === 400) {
      error.value = e.response.data?.message || 'Por favor verifica los datos ingresados.';
    } else if (e.response?.status >= 500) {
      error.value = 'Ocurrió un error en el servidor. Por favor intenta más tarde.';
    } else {
      error.value = e.response?.data?.message || 'Error al crear la cuenta. Intenta de nuevo.';
    }
  } finally {
    cargando.value = false;
  }
}
</script>

<template>
  <div class="reg-container">
    <div class="reg-card">
      <!-- Panel decorativo izquierdo (coherente con Login) -->
      <div class="reg-card__deco" aria-hidden="true">
        <div class="deco-shape deco-shape--circle"></div>
        <div class="deco-shape deco-shape--pill"></div>
        <div class="deco-shape deco-shape--line"></div>

        <div class="reg-card__deco-content">
          <p class="reg-deco__label">Nuevo cliente</p>
          <h1 class="reg-deco__title">
            Tu estilo,<br />
            <em>tu identidad.</em>
          </h1>
          <p class="reg-deco__sub">
            Crea tu cuenta y accede a nuestra agenda de citas de forma rápida y sencilla.
          </p>

          <ul class="reg-deco__perks">
            <li>
              <Icon icon="material-symbols-light:check-circle-outline" class="perk-icon" />
              <span>Reserva tus citas en cualquier momento</span>
            </li>
            <li>
              <Icon icon="material-symbols-light:check-circle-outline" class="perk-icon" />
              <span>Consulta la disponibilidad en tiempo real</span>
            </li>
            <li>
              <Icon icon="material-symbols-light:check-circle-outline" class="perk-icon" />
              <span>Historial y seguimiento de tus visitas</span>
            </li>
          </ul>

          <div class="reg-deco__accent"></div>
        </div>
      </div>

      <!-- Panel del formulario con scroll interno -->
      <div class="reg-card__form-panel">
        <div class="reg-form-inner">
          <!-- Pantalla de éxito -->
          <div v-if="paso === 2" class="reg-success">
            <div class="reg-success__icon" aria-hidden="true">
              <Icon icon="material-symbols-light:check" />
            </div>
            <h2 class="reg-success__title">¡Cuenta creada!</h2>
            <p class="reg-success__sub">
              Tu cuenta ha sido creada exitosamente. Ya puedes iniciar sesión.
            </p>
            <RouterLink :to="{ name: 'login' }" class="btn btn--primary reg-success__btn">
              Iniciar sesión
            </RouterLink>
          </div>

          <!-- Formulario de datos -->
          <template v-else>
            <div class="reg-header">
              <h2 class="reg-title">Crear cuenta</h2>
              <p class="reg-subtitle">Ingresa tus datos para registrarte</p>
            </div>

            <form class="reg-form" @submit.prevent="registrar" novalidate>
              <!-- Nombre completo -->
              <div class="field">
                <label class="field__label" for="reg-nombre">Nombre completo</label>
                <div class="input-wrap">
                  <Icon
                    icon="material-symbols-light:person-outline"
                    class="input-icon"
                    aria-hidden="true"
                  />
                  <input
                    id="reg-nombre"
                    v-model="form.nombre"
                    class="input input--icon"
                    type="text"
                    autocomplete="name"
                    placeholder="Ej. Ana Pérez"
                    :disabled="cargando"
                  />
                </div>
              </div>

              <!-- Correo electrónico -->
              <div class="field">
                <label class="field__label" for="reg-email">Correo electrónico</label>
                <div class="input-wrap">
                  <Icon
                    icon="material-symbols-light:mail-outline"
                    class="input-icon"
                    aria-hidden="true"
                  />
                  <input
                    id="reg-email"
                    v-model="form.email"
                    class="input input--icon"
                    type="email"
                    autocomplete="email"
                    placeholder="tu@correo.com"
                    :disabled="cargando"
                  />
                </div>
              </div>

              <!-- Fila con Cédula y Teléfono -->
              <div class="form-row">
                <div class="field">
                  <label class="field__label" for="reg-cedula">Cédula</label>
                  <div class="input-wrap">
                    <Icon
                      icon="material-symbols-light:badge-outline"
                      class="input-icon"
                      aria-hidden="true"
                    />
                    <input
                      id="reg-cedula"
                      v-model="form.cedula"
                      class="input input--icon"
                      type="text"
                      autocomplete="off"
                      placeholder="V-12345678"
                      :disabled="cargando"
                    />
                  </div>
                </div>

                <div class="field">
                  <label class="field__label" for="reg-telefono">Teléfono</label>
                  <div class="input-wrap">
                    <Icon
                      icon="material-symbols-light:call-outline"
                      class="input-icon"
                      aria-hidden="true"
                    />
                    <input
                      id="reg-telefono"
                      v-model="form.telefono"
                      class="input input--icon"
                      type="tel"
                      autocomplete="tel"
                      placeholder="0414-1234567"
                      :disabled="cargando"
                    />
                  </div>
                </div>
              </div>

              <!-- Contraseña -->
              <div class="field">
                <label class="field__label" for="reg-password">Contraseña</label>
                <div class="input-wrap">
                  <Icon
                    icon="material-symbols-light:lock-outline"
                    class="input-icon"
                    aria-hidden="true"
                  />
                  <input
                    id="reg-password"
                    v-model="form.password"
                    class="input input--icon input--action"
                    :type="mostrarPassword ? 'text' : 'password'"
                    autocomplete="new-password"
                    placeholder="Mínimo 8 caracteres"
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

              <!-- Confirmar contraseña -->
              <div class="field">
                <label class="field__label" for="reg-confirmar">Confirmar contraseña</label>
                <div class="input-wrap">
                  <Icon
                    icon="material-symbols-light:lock-outline"
                    class="input-icon"
                    aria-hidden="true"
                  />
                  <input
                    id="reg-confirmar"
                    v-model="form.confirmar"
                    class="input input--icon input--action"
                    :type="mostrarConfirmar ? 'text' : 'password'"
                    autocomplete="new-password"
                    placeholder="Repite la contraseña"
                    :disabled="cargando"
                  />
                  <button
                    type="button"
                    class="btn-toggle-eye"
                    :disabled="cargando"
                    :aria-label="mostrarConfirmar ? 'Ocultar contraseña' : 'Ver contraseña'"
                    @click="mostrarConfirmar = !mostrarConfirmar"
                  >
                    <Icon
                      :icon="
                        mostrarConfirmar
                          ? 'material-symbols-light:visibility-off-outline'
                          : 'material-symbols-light:visibility-outline'
                      "
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>

              <!-- Error -->
              <div v-if="error" class="form-error" role="alert">
                <Icon
                  icon="material-symbols-light:error-outline"
                  class="form-error__icon"
                  aria-hidden="true"
                />
                <span>{{ error }}</span>
              </div>

              <!-- Botón submit -->
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
              <RouterLink :to="{ name: 'login' }" class="reg-login__link">
                Iniciar sesión
              </RouterLink>
            </p>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Contenedor exterior centrado sin scroll de página en PC */
.reg-container {
  width: 100%;
  max-width: 1040px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Tarjeta apaisada idéntica a la del Login */
.reg-card {
  width: 100%;
  display: grid;
  grid-template-columns: 1.05fr 1.15fr;
  height: min(640px, calc(100vh - 100px));
  background: var(--color-blanco);
  border-radius: 28px;
  border: 1px solid var(--color-borde-suave);
  box-shadow:
    0 24px 60px -12px rgba(0, 43, 73, 0.14),
    0 12px 28px -6px rgba(0, 43, 73, 0.08);
  overflow: hidden;
}

/* === PANEL DECORATIVO IZQUIERDO === */
.reg-card__deco {
  position: relative;
  background: var(--color-marino);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8) var(--space-10);
  overflow: hidden;
}

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
  top: 25%;
  right: 15%;
  width: 80px;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--color-azul), transparent);
}

.reg-card__deco-content {
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
  margin: 0 0 var(--space-3);
}

.reg-deco__title {
  font-family: var(--fuente-titulo);
  font-size: clamp(34px, 3.5vw, 48px);
  font-weight: var(--weight-regular);
  line-height: 1.05;
  color: var(--color-blanco);
  margin: 0 0 var(--space-4);
}

.reg-deco__title em {
  font-style: italic;
  color: var(--color-azul);
}

.reg-deco__sub {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.78);
  line-height: 1.5;
  margin: 0 0 var(--space-6);
}

.reg-deco__perks {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.reg-deco__perks li {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 13.5px;
  color: rgba(255, 255, 255, 0.88);
}

.perk-icon {
  font-size: 18px;
  color: var(--color-azul);
  flex-shrink: 0;
}

.reg-deco__accent {
  margin-top: var(--space-6);
  width: 48px;
  height: 3px;
  background: var(--color-azul);
  border-radius: var(--radio-pill);
}

/* === PANEL DEL FORMULARIO CON SCROLL INTERNO === */
.reg-card__form-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  padding: var(--space-6) var(--space-8);
  background: var(--color-blanco);
  overscroll-behavior: contain;
}

/* Scrollbar sutil y estilizada en el cuadro del formulario */
.reg-card__form-panel::-webkit-scrollbar {
  width: 6px;
}

.reg-card__form-panel::-webkit-scrollbar-track {
  background: transparent;
}

.reg-card__form-panel::-webkit-scrollbar-thumb {
  background: var(--color-borde-medio);
  border-radius: var(--radio-pill);
}

.reg-card__form-panel::-webkit-scrollbar-thumb:hover {
  background: var(--color-texto-suave);
}

.reg-form-inner {
  width: 100%;
  max-width: 400px;
  margin: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-2) 0;
}

.reg-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.reg-title {
  font-family: var(--fuente-titulo);
  font-size: 28px;
  font-weight: var(--weight-regular);
  color: var(--color-marino);
  line-height: 1.15;
  margin: 0;
}

.reg-subtitle {
  font-size: 14px;
  color: var(--color-texto-suave);
  margin: 0;
}

.reg-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

/* Fila para cédula y teléfono compactos */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

/* Input con icono */
.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.input-icon {
  position: absolute;
  left: 12px;
  font-size: 18px;
  color: var(--color-texto-suave);
  pointer-events: none;
  transition: color var(--dur-fast) var(--ease-out);
}

.input--icon {
  padding-left: 38px;
  min-height: 44px;
  font-size: 14px;
}

.input--action {
  padding-right: 38px;
}

.input-wrap:focus-within .input-icon {
  color: var(--color-azul);
}

/* Botón de ojito */
.btn-toggle-eye {
  position: absolute;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-texto-suave);
  font-size: 18px;
  border-radius: var(--radio-sm);
  cursor: pointer;
  transition: color var(--dur-fast) var(--ease-out);
}

.btn-toggle-eye:hover {
  color: var(--color-marino);
}

/* Submit */
.reg-submit {
  width: 100%;
  min-height: 46px;
  margin-top: var(--space-2);
  font-size: 15px;
  border-radius: var(--radio-pill);
}

.reg-spinner {
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

.form-error {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: #fdf2f2;
  border: 1px solid #f8b4b4;
  border-radius: var(--radio-sm);
  color: #9b1c1c;
  font-size: 13px;
  line-height: 1.4;
}

.form-error__icon {
  font-size: 16px;
  flex-shrink: 0;
}

.reg-login {
  text-align: center;
  font-size: var(--text-caption);
  color: var(--color-texto-suave);
  margin: 0;
}

.reg-login__link {
  color: var(--color-azul);
  font-weight: var(--weight-semibold);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.reg-login__link:hover {
  color: var(--color-marino);
}

/* Pantalla de éxito */
.reg-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-3);
  padding: var(--space-6) 0;
}

.reg-success__icon {
  display: grid;
  width: 56px;
  height: 56px;
  place-items: center;
  border-radius: 50%;
  background: #def7ec;
  color: #03543f;
  font-size: 28px;
}

.reg-success__title {
  font-family: var(--fuente-titulo);
  font-size: 28px;
  color: var(--color-marino);
  margin: 0;
}

.reg-success__sub {
  font-size: 14px;
  color: var(--color-texto-suave);
  margin: 0;
}

.reg-success__btn {
  margin-top: var(--space-3);
  width: 100%;
}

/* === RESPONSIVE (Tablet y Móvil) === */
@media (max-width: 860px) {
  .reg-card {
    grid-template-columns: 1fr;
    height: auto;
    max-height: none;
    border-radius: 20px;
  }

  .reg-card__deco {
    padding: var(--space-6) var(--space-6);
  }

  .reg-card__form-panel {
    height: auto;
    max-height: none;
    overflow-y: visible;
    padding: var(--space-6);
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .reg-card__deco {
    display: none;
  }

  .reg-card__form-panel {
    padding: var(--space-5) var(--space-4);
  }
}
</style>

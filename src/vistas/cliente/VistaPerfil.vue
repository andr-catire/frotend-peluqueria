<script setup>
import { onMounted, reactive, ref } from 'vue';
import EncabezadoPagina from '../../componentes/EncabezadoPagina.vue';
import { useAlmacenAutenticacion } from '../../almacenes/autenticacion.js';
import {
  actualizarPerfil,
  cambiarPassword,
  obtenerPerfil,
} from '../../servicios/servicioPerfil.js';

// Mismas reglas de formato que el backend (SolicitudPerfil).
const REGEX_CEDULA = /^([VEve]-?)?\d{5,9}$/;
const REGEX_TELEFONO = /^\+?\d[\d\s()-]{6,19}$/;

const auth = useAlmacenAutenticacion();

const cargando = ref(true);
const errorCarga = ref('');
const email = ref('');

// ---- Datos personales ----
const form = reactive({ nombre: '', cedula: '', telefono: '' });
const errores = reactive({ nombre: '', cedula: '', telefono: '' });
const guardando = ref(false);
const errorDatos = ref('');
const okDatos = ref(false);

// ---- Contraseña ----
const formPass = reactive({ actual: '', nueva: '', confirmar: '' });
const erroresPass = reactive({ actual: '', nueva: '', confirmar: '' });
const cambiandoPass = ref(false);
const errorPass = ref('');
const okPass = ref(false);

function mensajeDeError(e, porDefecto) {
  if (!e?.response) {
    return 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.';
  }
  if (e.response.status >= 500) return porDefecto;
  return e.response.data?.message || porDefecto;
}

function aplicarPerfil(perfil) {
  email.value = perfil.email;
  form.nombre = perfil.nombre;
  form.cedula = perfil.cedula;
  form.telefono = perfil.telefono;
}

onMounted(async () => {
  try {
    aplicarPerfil(await obtenerPerfil());
  } catch (e) {
    errorCarga.value = mensajeDeError(e, 'No se pudo cargar tu perfil. Inténtalo de nuevo.');
  } finally {
    cargando.value = false;
  }
});

function validarDatos() {
  errores.nombre = form.nombre.trim() ? '' : 'El nombre es obligatorio.';
  errores.cedula = REGEX_CEDULA.test(form.cedula.trim())
    ? ''
    : 'La cédula debe tener entre 5 y 9 dígitos (Ej. V-12345678).';
  errores.telefono = REGEX_TELEFONO.test(form.telefono.trim())
    ? ''
    : 'El teléfono solo puede contener números, espacios, guiones y paréntesis (Ej. 0414-1234567).';
  return !errores.nombre && !errores.cedula && !errores.telefono;
}

async function guardarDatos() {
  okDatos.value = false;
  errorDatos.value = '';
  if (!validarDatos()) return;

  guardando.value = true;
  try {
    const perfil = await actualizarPerfil({
      nombre: form.nombre.trim(),
      cedula: form.cedula.trim(),
      telefono: form.telefono.trim(),
    });
    aplicarPerfil(perfil);
    auth.actualizarNombre(perfil.nombre);
    okDatos.value = true;
  } catch (e) {
    if (e?.response?.data?.error === 'CEDULA_TAKEN') {
      errores.cedula = e.response.data.message;
    } else {
      errorDatos.value = mensajeDeError(e, 'No se pudieron guardar los cambios. Inténtalo de nuevo.');
    }
  } finally {
    guardando.value = false;
  }
}

function validarPassword() {
  erroresPass.actual = formPass.actual ? '' : 'Indica tu contraseña actual.';
  erroresPass.nueva =
    formPass.nueva.length >= 8 && formPass.nueva.length <= 72
      ? ''
      : 'La nueva contraseña debe tener entre 8 y 72 caracteres.';
  erroresPass.confirmar = formPass.nueva === formPass.confirmar ? '' : 'Las contraseñas no coinciden.';
  return !erroresPass.actual && !erroresPass.nueva && !erroresPass.confirmar;
}

async function guardarPassword() {
  okPass.value = false;
  errorPass.value = '';
  if (!validarPassword()) return;

  cambiandoPass.value = true;
  try {
    await cambiarPassword({ passwordActual: formPass.actual, passwordNueva: formPass.nueva });
    formPass.actual = '';
    formPass.nueva = '';
    formPass.confirmar = '';
    okPass.value = true;
  } catch (e) {
    if (e?.response?.data?.error === 'PASSWORD_INCORRECT') {
      erroresPass.actual = e.response.data.message;
    } else {
      errorPass.value = mensajeDeError(e, 'No se pudo cambiar la contraseña. Inténtalo de nuevo.');
    }
  } finally {
    cambiandoPass.value = false;
  }
}
</script>

<template>
  <div class="perfil-vista">
    <EncabezadoPagina
      label="Mi cuenta"
      title="Mi perfil"
      accent="perfil"
      subtitle="Consulta y actualiza tus datos personales y tu contraseña."
    />

    <div class="container page--tight perfil-contenido">
      <p v-if="cargando" class="caption" aria-busy="true">Cargando tu perfil…</p>

      <div v-else-if="errorCarga" class="form-error" role="alert">
        <span>{{ errorCarga }}</span>
      </div>

      <template v-else>
        <!-- Datos personales -->
        <form class="perfil-card" novalidate @submit.prevent="guardarDatos">
          <h2 class="perfil-card__titulo">Datos personales</h2>

          <div class="field">
            <label class="field__label" for="perfil-email">Correo electrónico</label>
            <input id="perfil-email" class="input" type="email" :value="email" disabled />
            <p class="field__help">Es tu usuario para iniciar sesión y no se puede cambiar.</p>
          </div>

          <div class="field">
            <label class="field__label" for="perfil-nombre">Nombre completo</label>
            <input
              id="perfil-nombre"
              v-model="form.nombre"
              class="input"
              type="text"
              autocomplete="name"
              :disabled="guardando"
              :aria-invalid="errores.nombre ? 'true' : undefined"
              :aria-describedby="errores.nombre ? 'perfil-nombre-error' : undefined"
            />
            <p v-if="errores.nombre" id="perfil-nombre-error" class="field__error">
              {{ errores.nombre }}
            </p>
          </div>

          <div class="perfil-fila">
            <div class="field">
              <label class="field__label" for="perfil-cedula">Cédula</label>
              <input
                id="perfil-cedula"
                v-model="form.cedula"
                class="input"
                type="text"
                autocomplete="off"
                placeholder="V-12345678"
                :disabled="guardando"
                :aria-invalid="errores.cedula ? 'true' : undefined"
                :aria-describedby="errores.cedula ? 'perfil-cedula-error' : undefined"
              />
              <p v-if="errores.cedula" id="perfil-cedula-error" class="field__error">
                {{ errores.cedula }}
              </p>
            </div>

            <div class="field">
              <label class="field__label" for="perfil-telefono">Teléfono</label>
              <input
                id="perfil-telefono"
                v-model="form.telefono"
                class="input"
                type="tel"
                autocomplete="tel"
                placeholder="0414-1234567"
                :disabled="guardando"
                :aria-invalid="errores.telefono ? 'true' : undefined"
                :aria-describedby="errores.telefono ? 'perfil-telefono-error' : undefined"
              />
              <p v-if="errores.telefono" id="perfil-telefono-error" class="field__error">
                {{ errores.telefono }}
              </p>
            </div>
          </div>

          <div v-if="errorDatos" class="form-error" role="alert">
            <span>{{ errorDatos }}</span>
          </div>
          <p v-if="okDatos" class="perfil-ok" role="status">Tus datos se guardaron correctamente.</p>

          <button type="submit" class="btn btn--primary perfil-boton" :disabled="guardando">
            {{ guardando ? 'Guardando…' : 'Guardar cambios' }}
          </button>
        </form>

        <!-- Cambio de contraseña -->
        <form class="perfil-card" novalidate @submit.prevent="guardarPassword">
          <h2 class="perfil-card__titulo">Cambiar contraseña</h2>

          <div class="field">
            <label class="field__label" for="perfil-pass-actual">Contraseña actual</label>
            <input
              id="perfil-pass-actual"
              v-model="formPass.actual"
              class="input"
              type="password"
              autocomplete="current-password"
              :disabled="cambiandoPass"
              :aria-invalid="erroresPass.actual ? 'true' : undefined"
              :aria-describedby="erroresPass.actual ? 'perfil-pass-actual-error' : undefined"
            />
            <p v-if="erroresPass.actual" id="perfil-pass-actual-error" class="field__error">
              {{ erroresPass.actual }}
            </p>
          </div>

          <div class="perfil-fila">
            <div class="field">
              <label class="field__label" for="perfil-pass-nueva">Nueva contraseña</label>
              <input
                id="perfil-pass-nueva"
                v-model="formPass.nueva"
                class="input"
                type="password"
                autocomplete="new-password"
                placeholder="Mínimo 8 caracteres"
                :disabled="cambiandoPass"
                :aria-invalid="erroresPass.nueva ? 'true' : undefined"
                :aria-describedby="erroresPass.nueva ? 'perfil-pass-nueva-error' : undefined"
              />
              <p v-if="erroresPass.nueva" id="perfil-pass-nueva-error" class="field__error">
                {{ erroresPass.nueva }}
              </p>
            </div>

            <div class="field">
              <label class="field__label" for="perfil-pass-confirmar">Confirmar contraseña</label>
              <input
                id="perfil-pass-confirmar"
                v-model="formPass.confirmar"
                class="input"
                type="password"
                autocomplete="new-password"
                :disabled="cambiandoPass"
                :aria-invalid="erroresPass.confirmar ? 'true' : undefined"
                :aria-describedby="erroresPass.confirmar ? 'perfil-pass-confirmar-error' : undefined"
              />
              <p v-if="erroresPass.confirmar" id="perfil-pass-confirmar-error" class="field__error">
                {{ erroresPass.confirmar }}
              </p>
            </div>
          </div>

          <div v-if="errorPass" class="form-error" role="alert">
            <span>{{ errorPass }}</span>
          </div>
          <p v-if="okPass" class="perfil-ok" role="status">Tu contraseña se actualizó correctamente.</p>

          <button type="submit" class="btn btn--ghost perfil-boton" :disabled="cambiandoPass">
            {{ cambiandoPass ? 'Actualizando…' : 'Cambiar contraseña' }}
          </button>
        </form>
      </template>
    </div>
  </div>
</template>

<style scoped>
.perfil-contenido {
  display: grid;
  max-width: 720px;
  gap: var(--space-6);
}

.perfil-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-6);
  border: var(--borde-suave);
  border-radius: var(--radio-md);
  background: var(--color-blanco);
}

.perfil-card__titulo {
  margin: 0;
  color: var(--color-marino);
  font-family: var(--fuente-titulo);
  font-size: 24px;
  font-weight: var(--weight-regular);
}

.perfil-fila {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

.perfil-ok {
  margin: 0;
  color: var(--color-azul);
  font-size: var(--text-caption);
  font-weight: var(--weight-medium);
}

.perfil-boton {
  align-self: flex-start;
}

@media (max-width: 640px) {
  .perfil-fila {
    grid-template-columns: 1fr;
  }

  .perfil-card {
    padding: var(--space-4);
  }
}
</style>

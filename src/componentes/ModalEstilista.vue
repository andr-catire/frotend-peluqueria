<script setup>
import { ref, watch } from 'vue';
import ModalFormulario from './ModalFormulario.vue';
import { listar as listarServicios } from '../servicios/servicioServicios.js';
import { registrar } from '../servicios/servicioPersonal.js';

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'creado']);

const nombre = ref('');
const email = ref('');
const password = ref('');
const servicios = ref([]);
const seleccionados = ref([]);
const cargando = ref(false);
const cargandoServicios = ref(true);
const errorServicios = ref('');
const errorNombre = ref('');
const errorEmail = ref('');
const errorPassword = ref('');
const errorSeleccion = ref('');
const mensajeError = ref('');

function limpiar() {
  nombre.value = '';
  email.value = '';
  password.value = '';
  seleccionados.value = [];
  errorNombre.value = '';
  errorEmail.value = '';
  errorPassword.value = '';
  errorSeleccion.value = '';
  mensajeError.value = '';
}

async function cargarServicios() {
  cargandoServicios.value = true;
  errorServicios.value = '';

  try {
    const datos = await listarServicios();
    servicios.value = Array.isArray(datos) ? datos : [];
  } catch (excepcion) {
    errorServicios.value =
      excepcion?.response?.data?.message || 'No se pudieron cargar los servicios.';
  } finally {
    cargandoServicios.value = false;
  }
}

watch(
  () => props.open,
  (abierto) => {
    if (abierto) {
      limpiar();
      cargarServicios();
    } else {
      password.value = '';
    }
  },
  { immediate: true }
);

function cerrar() {
  if (cargando.value) return;
  password.value = '';
  limpiar();
  emit('close');
}

function alternarServicio(id) {
  errorSeleccion.value = '';

  if (seleccionados.value.includes(id)) {
    seleccionados.value = seleccionados.value.filter((actual) => actual !== id);
    return;
  }

  if (seleccionados.value.length >= 50) {
    errorSeleccion.value = 'Puedes asignar como máximo 50 servicios.';
    return;
  }

  seleccionados.value = [...seleccionados.value, id];
}

function validar() {
  errorNombre.value = '';
  errorEmail.value = '';
  errorPassword.value = '';
  errorSeleccion.value = '';
  mensajeError.value = '';

  if (!nombre.value.trim()) {
    errorNombre.value = 'El nombre es obligatorio.';
  } else if (nombre.value.trim().length > 120) {
    errorNombre.value = 'El nombre no puede tener más de 120 caracteres.';
  }

  if (!email.value.trim()) {
    errorEmail.value = 'El correo es obligatorio.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    errorEmail.value = 'El correo no tiene un formato válido.';
  }

  const longitudPassword = password.value.length;
  if (longitudPassword < 8 || longitudPassword > 72) {
    errorPassword.value = 'La contraseña debe tener entre 8 y 72 caracteres.';
  }

  if (!seleccionados.value.length) {
    errorSeleccion.value = 'Debes asignar al menos un servicio.';
  }

  if (errorNombre.value) {
    document.getElementById('estilista-nombre')?.focus();
    return false;
  }
  if (errorEmail.value) {
    document.getElementById('estilista-email')?.focus();
    return false;
  }
  if (errorPassword.value) {
    document.getElementById('estilista-password')?.focus();
    return false;
  }
  if (errorSeleccion.value) {
    document.getElementById('estilista-servicios')?.focus();
    return false;
  }

  return true;
}

async function guardar() {
  if (!validar()) return;

  const passwordEnviada = password.value;
  password.value = '';
  cargando.value = true;

  try {
    const empleado = await registrar({
      nombre: nombre.value.trim(),
      email: email.value.trim(),
      password: passwordEnviada,
      serviciosIds: seleccionados.value,
    });

    emit('creado', empleado);
    limpiar();
    emit('close');
  } catch (excepcion) {
    const codigo = excepcion?.response?.data?.error;
    const mensaje = excepcion?.response?.data?.message;

    if (codigo === 'EMAIL_TAKEN') {
      errorEmail.value = mensaje || 'Ya existe una cuenta con ese correo.';
      document.getElementById('estilista-email')?.focus();
    } else if (codigo === 'FORBIDDEN') {
      mensajeError.value = 'No tienes permisos para registrar empleados.';
    } else if (codigo === 'UNAUTHORIZED') {
      mensajeError.value = 'Inicia sesión para continuar.';
    } else if (codigo === 'VALIDATION_ERROR' || codigo === 'INACTIVE_SERVICE'
        || codigo === 'NOT_FOUND') {
      mensajeError.value = mensaje || 'Revisa los datos del formulario.';
    } else {
      mensajeError.value = mensaje || 'No se pudo registrar al empleado. Inténtalo de nuevo.';
    }
  } finally {
    cargando.value = false;
  }
}
</script>

<template>
  <ModalFormulario
    :open="open"
    title="Registrar empleado"
    submit-label="Registrar empleado"
    :loading="cargando"
    :error="mensajeError"
    @close="cerrar"
    @submit="guardar"
  >
    <div class="field">
      <label class="field__label" for="estilista-nombre">Nombre</label>
      <input
        id="estilista-nombre"
        v-model="nombre"
        class="input"
        type="text"
        maxlength="120"
        autocomplete="name"
        :aria-invalid="Boolean(errorNombre)"
        :aria-describedby="errorNombre ? 'estilista-nombre-error' : undefined"
      />
      <p v-if="errorNombre" id="estilista-nombre-error" class="field__error">
        {{ errorNombre }}
      </p>
    </div>

    <div class="field">
      <label class="field__label" for="estilista-email">Correo</label>
      <input
        id="estilista-email"
        v-model="email"
        class="input"
        type="email"
        maxlength="320"
        autocomplete="email"
        :aria-invalid="Boolean(errorEmail)"
        :aria-describedby="errorEmail ? 'estilista-email-error' : undefined"
      />
      <p v-if="errorEmail" id="estilista-email-error" class="field__error">
        {{ errorEmail }}
      </p>
    </div>

    <div class="field">
      <label class="field__label" for="estilista-password">Contraseña inicial</label>
      <input
        id="estilista-password"
        v-model="password"
        class="input"
        type="password"
        minlength="8"
        maxlength="72"
        autocomplete="new-password"
        :aria-invalid="Boolean(errorPassword)"
        :aria-describedby="errorPassword ? 'estilista-password-error' : 'estilista-password-ayuda'"
      />
      <p id="estilista-password-ayuda" class="field__help">
        Comunica la contraseña al empleado por un canal externo; el sistema no envía mensajes.
      </p>
      <p v-if="errorPassword" id="estilista-password-error" class="field__error">
        {{ errorPassword }}
      </p>
    </div>

    <fieldset class="servicios-field">
      <legend id="estilista-servicios" class="field__label" tabindex="-1">
        Servicios que atenderá
      </legend>

      <p v-if="cargandoServicios" class="caption">Cargando servicios…</p>

      <div v-else-if="errorServicios" class="services-error" role="alert">
        <span>{{ errorServicios }}</span>
        <button class="btn btn--ghost btn--small" type="button" @click="cargarServicios">
          Reintentar
        </button>
      </div>

      <p v-else-if="!servicios.length" class="caption">
        No hay servicios activos. Crea uno en Servicios antes de registrar al empleado.
      </p>

      <div v-else class="services-grid">
        <label
          v-for="servicio in servicios"
          :key="servicio.id"
          class="service-option"
          :class="{ 'is-selected': seleccionados.includes(servicio.id) }"
        >
          <input
            type="checkbox"
            :checked="seleccionados.includes(servicio.id)"
            @change="alternarServicio(servicio.id)"
          />
          <span class="service-option__name">{{ servicio.nombre }}</span>
          <span class="service-option__meta">{{ servicio.duracionMinutos }} min</span>
        </label>
      </div>

      <p v-if="errorSeleccion" class="field__error">{{ errorSeleccion }}</p>
    </fieldset>
  </ModalFormulario>
</template>

<style scoped>
.servicios-field {
  margin: var(--space-4) 0 0;
  padding: 0;
  border: 0;
}

.servicios-field legend {
  margin-bottom: var(--space-2);
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-2);
}

.service-option {
  display: flex;
  min-height: 44px;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3);
  border: var(--borde-suave);
  border-radius: var(--radio-sm);
  cursor: pointer;
  transition:
    background-color var(--dur-fast) var(--ease-out),
    border-color var(--dur-fast) var(--ease-out);
}

.service-option:hover {
  background: var(--color-superficie);
}

.service-option.is-selected {
  border-color: var(--color-azul);
  background: var(--color-superficie);
}

.service-option input {
  accent-color: var(--color-marino);
}

.service-option__name {
  font-size: var(--text-body);
  font-weight: var(--weight-medium);
}

.service-option__meta {
  margin-left: auto;
  color: var(--color-texto-suave);
  font-size: var(--text-caption);
}

.services-error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3);
  border: 2px solid var(--color-marino);
  border-radius: var(--radio-sm);
  font-size: var(--text-body);
}

@media (max-width: 640px) {
  .services-grid {
    grid-template-columns: 1fr;
  }
}
</style>

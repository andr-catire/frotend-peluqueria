<script setup>
import { ref, watch } from 'vue';
import FormModal from './FormModal.vue';
import { crear } from '../services/serviciosService.js';

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'creado']);

const nombre = ref('');
const costo = ref('');
const duracion = ref('');
const errorNombre = ref('');
const errorCosto = ref('');
const errorDuracion = ref('');
const errorGeneral = ref('');
const enviando = ref(false);

function limpiar() {
  nombre.value = '';
  costo.value = '';
  duracion.value = '';
  errorNombre.value = '';
  errorCosto.value = '';
  errorDuracion.value = '';
  errorGeneral.value = '';
}

watch(
  () => props.open,
  (abierto) => {
    if (abierto) limpiar();
  }
);

function cerrar() {
  if (enviando.value) return;
  limpiar();
  emit('close');
}

function validar() {
  errorNombre.value = '';
  errorCosto.value = '';
  errorDuracion.value = '';
  errorGeneral.value = '';

  const nombreLimpio = nombre.value.trim().replace(/\s+/g, ' ');

  if (!nombreLimpio) {
    errorNombre.value = 'El nombre es obligatorio.';
  } else if (nombreLimpio.length > 120) {
    errorNombre.value = 'El nombre no puede tener más de 120 caracteres.';
  }

  const costoTexto = String(costo.value).trim().replace(',', '.');
  const costoNumero = Number(costoTexto);

  if (!/^\d{1,8}(\.\d{1,2})?$/.test(costoTexto) || !Number.isFinite(costoNumero) || costoNumero <= 0) {
    errorCosto.value = 'El costo debe ser un número mayor que 0, con máximo 2 decimales.';
  }

  const duracionTexto = String(duracion.value).trim();
  const duracionNumero = Number(duracionTexto);

  if (!/^\d+$/.test(duracionTexto) || !Number.isFinite(duracionNumero) || duracionNumero <= 0) {
    errorDuracion.value = 'La duración debe ser un número entero de minutos mayor que 0.';
  }

  if (errorNombre.value) {
    document.getElementById('servicio-nombre')?.focus();
    return false;
  }

  if (errorCosto.value) {
    document.getElementById('servicio-costo')?.focus();
    return false;
  }

  if (errorDuracion.value) {
    document.getElementById('servicio-duracion')?.focus();
    return false;
  }

  return true;
}

async function guardar() {
  if (!validar()) return;

  const nombreLimpio = nombre.value.trim().replace(/\s+/g, ' ');
  const costoNumero = Number(String(costo.value).trim().replace(',', '.'));
  const duracionNumero = Number(String(duracion.value).trim());

  enviando.value = true;

  try {
    const servicio = await crear({
      nombre: nombreLimpio,
      costo: costoNumero,
      duracionMinutos: duracionNumero,
    });

    emit('creado', servicio);
    limpiar();
    emit('close');
  } catch (excepcion) {
    const codigo = excepcion?.response?.data?.error;
    const mensaje = excepcion?.response?.data?.message;

    if (codigo === 'DUPLICATE') {
      errorNombre.value = mensaje || 'Ya existe un servicio con ese nombre.';
      document.getElementById('servicio-nombre')?.focus();
    } else if (codigo === 'FORBIDDEN') {
      errorGeneral.value = 'No tienes permisos para crear servicios.';
    } else if (codigo === 'UNAUTHORIZED') {
      errorGeneral.value = 'Inicia sesión para continuar.';
    } else if (codigo === 'VALIDATION_ERROR') {
      errorGeneral.value = mensaje || 'Revisa los datos del formulario.';
    } else {
      errorGeneral.value = mensaje || 'No se pudo crear el servicio. Inténtalo de nuevo.';
    }
  } finally {
    enviando.value = false;
  }
}
</script>

<template>
  <FormModal
    :open="open"
    title="Crear servicio"
    submit-label="Crear servicio"
    :loading="enviando"
    :error="errorGeneral"
    @close="cerrar"
    @submit="guardar"
  >
    <div class="field">
      <label class="field__label" for="servicio-nombre">Nombre</label>
      <input
        id="servicio-nombre"
        v-model="nombre"
        class="input"
        type="text"
        maxlength="120"
        autocomplete="off"
        :aria-invalid="Boolean(errorNombre)"
        :aria-describedby="errorNombre ? 'servicio-nombre-error' : undefined"
      />
      <p v-if="errorNombre" id="servicio-nombre-error" class="field__error">
        {{ errorNombre }}
      </p>
    </div>

    <div class="field">
      <label class="field__label" for="servicio-costo">Costo</label>
      <input
        id="servicio-costo"
        v-model="costo"
        class="input"
        type="text"
        inputmode="decimal"
        placeholder="25,50"
        autocomplete="off"
        :aria-invalid="Boolean(errorCosto)"
        :aria-describedby="errorCosto
          ? 'servicio-costo-ayuda servicio-costo-error'
          : 'servicio-costo-ayuda'"
      />
      <p id="servicio-costo-ayuda" class="field__help">
        Usa hasta 2 decimales. El pago se realiza en el local.
      </p>
      <p v-if="errorCosto" id="servicio-costo-error" class="field__error">
        {{ errorCosto }}
      </p>
    </div>

    <div class="field">
      <label class="field__label" for="servicio-duracion">Duración (minutos)</label>
      <input
        id="servicio-duracion"
        v-model="duracion"
        class="input"
        type="text"
        inputmode="numeric"
        placeholder="45"
        autocomplete="off"
        :aria-invalid="Boolean(errorDuracion)"
        :aria-describedby="errorDuracion ? 'servicio-duracion-error' : undefined"
      />
      <p v-if="errorDuracion" id="servicio-duracion-error" class="field__error">
        {{ errorDuracion }}
      </p>
    </div>
  </FormModal>
</template>

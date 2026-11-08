<script setup>
import { onBeforeUnmount, ref, watch } from 'vue';
import ModalFormulario from './ModalFormulario.vue';
import { crear } from '../servicios/servicioServicios.js';

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'creado']);

const MAX_IMAGEN = 10 * 1024 * 1024;
const LADO_MAXIMO = 1600;

const nombre = ref('');
const descripcion = ref('');
const precio = ref('');
const duracion = ref('');
const inputImagen = ref(null);
const archivoImagen = ref(null);
const vistaPrevia = ref('');
const errorNombre = ref('');
const errorPrecio = ref('');
const errorDuracion = ref('');
const errorImagen = ref('');
const mensajeError = ref('');
const cargando = ref(false);
const procesandoImagen = ref(false);

function limpiarImagen() {
  if (vistaPrevia.value) {
    URL.revokeObjectURL(vistaPrevia.value);
  }
  vistaPrevia.value = '';
  archivoImagen.value = null;
  errorImagen.value = '';
  procesandoImagen.value = false;

  if (inputImagen.value) {
    inputImagen.value.value = '';
  }
}

function limpiar() {
  nombre.value = '';
  descripcion.value = '';
  precio.value = '';
  duracion.value = '';
  errorNombre.value = '';
  errorPrecio.value = '';
  errorDuracion.value = '';
  mensajeError.value = '';
  limpiarImagen();
}

watch(
  () => props.open,
  (abierto) => {
    if (abierto) limpiar();
  }
);

onBeforeUnmount(limpiarImagen);

function cerrar() {
  if (cargando.value || procesandoImagen.value) return;
  limpiar();
  emit('close');
}

async function convertirAWebp(archivo) {
  const bitmap = await createImageBitmap(archivo);

  try {
    const escala = Math.min(1, LADO_MAXIMO / Math.max(bitmap.width, bitmap.height));
    const ancho = Math.max(1, Math.round(bitmap.width * escala));
    const alto = Math.max(1, Math.round(bitmap.height * escala));
    const lienzo = document.createElement('canvas');
    lienzo.width = ancho;
    lienzo.height = alto;

    const contexto = lienzo.getContext('2d');
    if (!contexto) {
      throw new Error('No se pudo preparar la imagen.');
    }

    contexto.drawImage(bitmap, 0, 0, ancho, alto);

    return await new Promise((resolve, reject) => {
      lienzo.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('No se pudo convertir la imagen.'))),
        'image/webp',
        0.85
      );
    });
  } finally {
    bitmap.close?.();
  }
}

async function alSeleccionarImagen(evento) {
  const archivo = evento.target.files?.[0];
  limpiarImagen();

  if (!archivo) {
    return;
  }

  if (!['image/jpeg', 'image/png', 'image/webp'].includes(archivo.type)) {
    errorImagen.value = 'Selecciona una imagen JPG, PNG o WEBP.';
    return;
  }

  if (archivo.size > MAX_IMAGEN) {
    errorImagen.value = 'La imagen no puede superar los 10 MB.';
    return;
  }

  procesandoImagen.value = true;

  try {
    const webp = await convertirAWebp(archivo);
    archivoImagen.value = webp;
    vistaPrevia.value = URL.createObjectURL(webp);
  } catch {
    errorImagen.value = 'No se pudo procesar la imagen. Inténtalo con otra.';
  } finally {
    procesandoImagen.value = false;
  }
}

function validar() {
  errorNombre.value = '';
  errorPrecio.value = '';
  errorDuracion.value = '';
  mensajeError.value = '';

  const nombreLimpio = nombre.value.trim().replace(/\s+/g, ' ');

  if (!nombreLimpio) {
    errorNombre.value = 'El nombre es obligatorio.';
  } else if (nombreLimpio.length > 120) {
    errorNombre.value = 'El nombre no puede tener más de 120 caracteres.';
  }

  const precioTexto = String(precio.value).trim().replace(',', '.');
  const precioNumero = Number(precioTexto);

  if (!/^\d{1,8}(\.\d{1,2})?$/.test(precioTexto) || !Number.isFinite(precioNumero) || precioNumero <= 0) {
    errorPrecio.value = 'El precio debe ser un número mayor que 0, con máximo 2 decimales.';
  }

  const duracionTexto = String(duracion.value).trim();
  const duracionNumero = Number(duracionTexto);

  if (!/^\d+$/.test(duracionTexto) || !Number.isFinite(duracionNumero) || duracionNumero <= 0) {
    errorDuracion.value = 'La duración debe ser un número entero de minutos mayor que 0.';
  } else if (duracionNumero > 480) {
    errorDuracion.value = 'La duración no puede superar los 480 minutos.';
  }

  if (errorNombre.value) {
    document.getElementById('servicio-nombre')?.focus();
    return false;
  }

  if (errorPrecio.value) {
    document.getElementById('servicio-precio')?.focus();
    return false;
  }

  if (errorDuracion.value) {
    document.getElementById('servicio-duracion')?.focus();
    return false;
  }

  if (errorImagen.value) {
    document.getElementById('servicio-imagen')?.focus();
    return false;
  }

  if (procesandoImagen.value) {
    mensajeError.value = 'Espera a que termine de procesarse la imagen.';
    return false;
  }

  return true;
}

async function guardar() {
  if (!validar()) return;

  const nombreLimpio = nombre.value.trim().replace(/\s+/g, ' ');
  const precioNumero = Number(String(precio.value).trim().replace(',', '.'));
  const duracionNumero = Number(String(duracion.value).trim());

  cargando.value = true;

  try {
    const descripcionLimpia = descripcion.value.trim();
    const datos = {
      nombre: nombreLimpio,
      precio: precioNumero,
      duracionMinutos: duracionNumero,
    };

    if (descripcionLimpia) {
      datos.descripcion = descripcionLimpia;
    }

    const servicio = await crear(datos, archivoImagen.value);

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
      mensajeError.value = 'No tienes permisos para crear servicios.';
    } else if (codigo === 'UNAUTHORIZED') {
      mensajeError.value = 'Inicia sesión para continuar.';
    } else if (codigo === 'FILE_TOO_LARGE') {
      errorImagen.value = mensaje || 'La imagen supera el tamaño permitido.';
    } else if (codigo === 'INVALID_IMAGE') {
      errorImagen.value = mensaje || 'La imagen no es válida.';
    } else if (codigo === 'VALIDATION_ERROR') {
      mensajeError.value = mensaje || 'Revisa los datos del formulario.';
    } else {
      mensajeError.value = mensaje || 'No se pudo crear el servicio. Inténtalo de nuevo.';
    }
  } finally {
    cargando.value = false;
  }
}
</script>

<template>
  <ModalFormulario
    :open="open"
    title="Crear servicio"
    submit-label="Crear servicio"
    :loading="cargando || procesandoImagen"
    :error="mensajeError"
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
      <label class="field__label" for="servicio-descripcion">Descripción</label>
      <textarea
        id="servicio-descripcion"
        v-model="descripcion"
        class="textarea"
        maxlength="1000"
        placeholder="Detalle opcional del servicio"
      ></textarea>
    </div>

    <div class="field">
      <label class="field__label" for="servicio-imagen">Imagen (opcional)</label>
      <input
        id="servicio-imagen"
        ref="inputImagen"
        class="input"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        :disabled="cargando || procesandoImagen"
        :aria-invalid="Boolean(errorImagen)"
        :aria-describedby="errorImagen
          ? 'servicio-imagen-ayuda servicio-imagen-error'
          : 'servicio-imagen-ayuda'"
        @change="alSeleccionarImagen"
      />
      <p id="servicio-imagen-ayuda" class="field__help">
        Se convierte a WebP (máximo 1600 px y 10 MB).
      </p>
      <p v-if="errorImagen" id="servicio-imagen-error" class="field__error">
        {{ errorImagen }}
      </p>
      <div v-if="vistaPrevia" class="image-preview">
        <img :src="vistaPrevia" alt="Vista previa de la imagen del servicio" />
      </div>
    </div>

    <div class="field">
      <label class="field__label" for="servicio-precio">Precio</label>
      <input
        id="servicio-precio"
        v-model="precio"
        class="input"
        type="text"
        inputmode="decimal"
        placeholder="25,50"
        autocomplete="off"
        :aria-invalid="Boolean(errorPrecio)"
        :aria-describedby="errorPrecio
          ? 'servicio-precio-ayuda servicio-precio-error'
          : 'servicio-precio-ayuda'"
      />
      <p id="servicio-precio-ayuda" class="field__help">
        Usa hasta 2 decimales. El pago se realiza en el local.
      </p>
      <p v-if="errorPrecio" id="servicio-precio-error" class="field__error">
        {{ errorPrecio }}
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
  </ModalFormulario>
</template>

<style scoped>
.image-preview {
  margin-top: var(--space-2);
}

.image-preview img {
  width: 100%;
  max-height: 220px;
  border: var(--borde-suave);
  border-radius: var(--radio-sm);
  object-fit: cover;
}
</style>

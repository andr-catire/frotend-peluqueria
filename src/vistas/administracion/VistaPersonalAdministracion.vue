<script setup>
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import EncabezadoPagina from '../../componentes/EncabezadoPagina.vue';
import { buscarPorEmail, promover } from '../../servicios/servicioPersonal.js';
import { listar } from '../../servicios/servicioServicios.js';

const email = ref('');
const buscando = ref(false);
const encontrado = ref(null);
const promoviendo = ref(false);
const mensajeError = ref('');
const mensajeExito = ref('');

const servicios = ref([]);
const cargandoServicios = ref(true);
const errorServicios = ref('');
const seleccionados = ref([]);

const seleccionadosSet = computed(() => new Set(seleccionados.value));
const puedePromover = computed(
  () => Boolean(encontrado.value) && seleccionados.value.length > 0 && !promoviendo.value
);

async function cargarServicios() {
  cargandoServicios.value = true;
  errorServicios.value = '';

  try {
    const datos = await listar();
    servicios.value = Array.isArray(datos) ? datos : [];
  } catch (excepcion) {
    errorServicios.value =
      excepcion?.response?.data?.message || 'No se pudieron cargar los servicios.';
  } finally {
    cargandoServicios.value = false;
  }
}

onMounted(cargarServicios);

function limpiarResultado() {
  encontrado.value = null;
  seleccionados.value = [];
  mensajeError.value = '';
  mensajeExito.value = '';
}

async function buscar() {
  limpiarResultado();

  if (!email.value.trim()) {
    mensajeError.value = 'Escribe el correo de la cuenta.';
    return;
  }

  buscando.value = true;

  try {
    encontrado.value = await buscarPorEmail(email.value.trim());
  } catch (excepcion) {
    mensajeError.value = mensajeDeError(excepcion, 'No se pudo buscar la cuenta.');
  } finally {
    buscando.value = false;
  }
}

function alternarServicio(id) {
  if (seleccionadosSet.value.has(id)) {
    seleccionados.value = seleccionados.value.filter((actual) => actual !== id);
  } else {
    seleccionados.value = [...seleccionados.value, id];
  }
}

async function promoverEmpleado() {
  if (!encontrado.value || !seleccionados.value.length) return;

  promoviendo.value = true;
  mensajeError.value = '';
  mensajeExito.value = '';

  try {
    const respuesta = await promover({
      idUsuario: encontrado.value.id,
      serviciosIds: seleccionados.value,
    });

    mensajeExito.value = `${respuesta.nombre} quedó registrado como estilista.`;
    email.value = '';
    encontrado.value = null;
    seleccionados.value = [];
  } catch (excepcion) {
    mensajeError.value = mensajeDeError(excepcion, 'No se pudo registrar al empleado.');
  } finally {
    promoviendo.value = false;
  }
}

function mensajeDeError(excepcion, respaldo) {
  const codigo = excepcion?.response?.data?.error;
  const mensaje = excepcion?.response?.data?.message;

  if (codigo === 'FORBIDDEN') {
    return 'No tienes permisos para registrar empleados.';
  }
  if (codigo === 'UNAUTHORIZED') {
    return 'Inicia sesión para continuar.';
  }

  return mensaje || respaldo;
}
</script>

<template>
  <div class="personal-admin">
    <EncabezadoPagina
      label="Gestión de personal"
      title="Registrar empleado"
      accent="empleado"
      subtitle="Busca una cuenta cliente y conviértela en estilista con sus servicios."
    />

    <div class="container page">
      <section class="form-card" aria-labelledby="registro-empleado-title">
        <h2 id="registro-empleado-title" class="form-card__title">Datos de la cuenta</h2>

        <form class="search-form" @submit.prevent="buscar">
          <div class="field search-form__field">
            <label class="field__label" for="empleado-email">Correo de la cuenta</label>
            <input
              id="empleado-email"
              v-model="email"
              class="input"
              type="email"
              autocomplete="email"
              placeholder="persona@correo.com"
              :disabled="buscando || promoviendo"
              @input="limpiarResultado"
            />
          </div>

          <button class="btn btn--ghost" type="submit" :disabled="buscando || promoviendo">
            {{ buscando ? 'Buscando...' : 'Buscar' }}
          </button>
        </form>

        <p v-if="mensajeError" class="form-error" role="alert">{{ mensajeError }}</p>
        <p v-if="mensajeExito" class="success-message" role="status">{{ mensajeExito }}</p>

        <div v-if="encontrado" class="account-card">
          <div>
            <p class="account-card__name">{{ encontrado.nombre }}</p>
            <p class="account-card__email">{{ encontrado.email }}</p>
          </div>
          <span class="account-card__role">{{ encontrado.rol }}</span>
        </div>

        <fieldset v-if="encontrado" class="services-field">
          <legend class="field__label">Servicios que atenderá</legend>

          <p v-if="cargandoServicios" class="caption">Cargando servicios…</p>

          <div v-else-if="errorServicios" class="services-error" role="alert">
            <span>{{ errorServicios }}</span>
            <button class="btn btn--ghost btn--small" type="button" @click="cargarServicios">
              Reintentar
            </button>
          </div>

          <p v-else-if="!servicios.length" class="caption">
            No hay servicios activos.
            <RouterLink :to="{ name: 'admin-servicios' }">Crea uno primero</RouterLink>.
          </p>

          <div v-else class="services-grid">
            <label
              v-for="servicio in servicios"
              :key="servicio.id"
              class="service-option"
              :class="{ 'is-selected': seleccionadosSet.has(servicio.id) }"
            >
              <input
                type="checkbox"
                :checked="seleccionadosSet.has(servicio.id)"
                @change="alternarServicio(servicio.id)"
              />
              <span class="service-option__name">{{ servicio.nombre }}</span>
              <span class="service-option__meta">{{ servicio.duracionMinutos }} min</span>
            </label>
          </div>
        </fieldset>

        <button
          v-if="encontrado"
          class="btn btn--primary form-card__submit"
          type="button"
          :disabled="!puedePromover"
          @click="promoverEmpleado"
        >
          {{ promoviendo ? 'Registrando...' : 'Registrar como estilista' }}
        </button>
      </section>
    </div>
  </div>
</template>

<style scoped>
.personal-admin {
  min-height: calc(100vh - var(--topbar-h));
  background: var(--color-fondo);
}

.form-card {
  max-width: 760px;
  padding: var(--space-6);
  border: var(--borde-suave);
  border-radius: var(--radio-md);
  background: var(--color-blanco);
}

.form-card__title {
  margin-bottom: var(--space-4);
  font-size: var(--text-heading-sm);
}

.search-form {
  display: flex;
  align-items: flex-end;
  gap: var(--space-4);
}

.search-form__field {
  flex: 1;
}

.account-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  margin-top: var(--space-6);
  padding: var(--space-4);
  border: var(--borde-suave);
  border-radius: var(--radio-sm);
  background: var(--color-superficie);
}

.account-card__name {
  font-size: var(--text-body-lg);
  font-weight: var(--weight-semibold);
}

.account-card__email {
  color: var(--color-texto-suave);
  font-size: var(--text-body);
}

.account-card__role {
  color: var(--color-marino);
  font-size: var(--text-caption);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.services-field {
  margin: var(--space-6) 0 0;
  padding: 0;
  border: 0;
}

.services-field legend {
  margin-bottom: var(--space-2);
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-2);
  margin-top: var(--space-2);
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

.form-card__submit {
  margin-top: var(--space-6);
}

.success-message {
  margin-top: var(--space-4);
  padding: var(--space-3) var(--space-4);
  border: var(--borde-suave);
  border-radius: var(--radio-sm);
  background: var(--color-superficie);
  color: var(--color-marino);
  font-size: var(--text-body);
  font-weight: var(--weight-medium);
}

.form-error {
  margin-top: var(--space-4);
}

@media (max-width: 640px) {
  .form-card {
    padding: var(--space-4);
  }

  .search-form {
    align-items: stretch;
    flex-direction: column;
  }

  .search-form .btn {
    width: 100%;
  }

  .services-grid {
    grid-template-columns: 1fr;
  }
}
</style>

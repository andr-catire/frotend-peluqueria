<script setup>
import { computed, onMounted, ref } from 'vue';
import EncabezadoPagina from '../../componentes/EncabezadoPagina.vue';
import TarjetaCifra from '../../componentes/TarjetaCifra.vue';
import TablaDatos from '../../componentes/TablaDatos.vue';
import ModalEstilista from '../../componentes/ModalEstilista.vue';
import { listar } from '../../servicios/servicioPersonal.js';

const empleados = ref([]);
const cargando = ref(true);
const error = ref('');
const modalAbierto = ref(false);
const mensajeExito = ref('');

const columnas = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'email', label: 'Correo' },
  { key: 'servicios', label: 'Servicios' },
];

const estilistasActivos = computed(() => empleados.value.length);

async function cargarEmpleados() {
  cargando.value = true;
  error.value = '';

  try {
    const datos = await listar();
    empleados.value = Array.isArray(datos) ? datos : [];
  } catch (excepcion) {
    error.value =
      excepcion?.response?.data?.message || 'No se pudieron cargar los estilistas.';
  } finally {
    cargando.value = false;
  }
}

onMounted(cargarEmpleados);

function abrirModal() {
  mensajeExito.value = '';
  modalAbierto.value = true;
}

function alRegistrar(empleado) {
  modalAbierto.value = false;
  mensajeExito.value = 'Empleado registrado correctamente.';
  empleados.value = empleados.value.filter((actual) => actual.id !== empleado.id);
  empleados.value = [...empleados.value, empleado].sort((a, b) =>
    a.nombre.localeCompare(b.nombre, 'es')
  );
}

function serviciosDe(empleado) {
  return (empleado.servicios ?? []).map((servicio) => servicio.nombre).join(', ') || '—';
}
</script>

<template>
  <div class="personal-admin">
    <EncabezadoPagina
      label="Gestión de personal"
      title="Equipo de estilistas"
      accent="estilistas"
      subtitle="Registra las cuentas del personal y consulta los servicios que atienden."
    >
      <template #stats>
        <TarjetaCifra :value="estilistasActivos" label="Estilistas activos" />
      </template>
    </EncabezadoPagina>

    <div class="container page">
      <div class="toolbar">
        <p v-if="mensajeExito" class="success-message" role="status">{{ mensajeExito }}</p>
        <button class="btn btn--primary" type="button" @click="abrirModal">
          Registrar empleado
        </button>
      </div>

      <TablaDatos
        :columns="columnas"
        :rows="empleados"
        row-key="id"
        caption="Estilistas activos de la peluquería"
        :loading="cargando"
        :error="error"
        empty-title="Aún no hay estilistas"
        empty-description="Registra la primera cuenta del personal para que pueda atender citas."
        @retry="cargarEmpleados"
      >
        <template #cell-servicios="{ row }">{{ serviciosDe(row) }}</template>
        <template #empty-action>
          <button class="btn btn--ghost" type="button" @click="abrirModal">
            Registrar empleado
          </button>
        </template>
      </TablaDatos>
    </div>

    <ModalEstilista
      :open="modalAbierto"
      @close="modalAbierto = false"
      @creado="alRegistrar"
    />
  </div>
</template>

<style scoped>
.personal-admin {
  min-height: calc(100vh - var(--topbar-h));
  background: var(--color-fondo);
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.success-message {
  margin: 0;
  padding: var(--space-3) var(--space-4);
  border: var(--borde-suave);
  border-radius: var(--radio-sm);
  background: var(--color-superficie);
  color: var(--color-marino);
  font-size: var(--text-body);
  font-weight: var(--weight-medium);
}

@media (max-width: 640px) {
  .toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .toolbar .btn {
    width: 100%;
  }
}
</style>

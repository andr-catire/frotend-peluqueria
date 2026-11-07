<script setup>
import EstadoVacio from './EstadoVacio.vue';

const props = defineProps({
  columns: {
    type: Array,
    required: true,
  },
  rows: {
    type: Array,
    default: () => [],
  },
  rowKey: {
    type: String,
    default: 'id',
  },
  caption: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
  emptyTitle: {
    type: String,
    default: 'Sin datos',
  },
  emptyDescription: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['retry']);

function valor(fila, columna) {
  return fila?.[columna.key];
}

function clave(fila, indice) {
  return fila?.[props.rowKey] ?? indice;
}
</script>

<template>
  <div class="data-table" :aria-busy="loading">
    <div v-if="error" class="data-table__error" role="alert">
      <p>{{ error }}</p>
      <button class="btn btn--ghost btn--small" type="button" @click="emit('retry')">
        Reintentar
      </button>
    </div>

    <template v-else>
      <table v-if="loading || rows.length">
        <caption v-if="caption" class="sr-only">{{ caption }}</caption>
        <thead>
          <tr>
            <th
              v-for="columna in columns"
              :key="columna.key"
              scope="col"
              :style="{ textAlign: columna.align || 'left' }"
            >
              {{ columna.label }}
            </th>
          </tr>
        </thead>

        <tbody v-if="loading">
          <tr v-for="fila in 3" :key="fila">
            <td v-for="columna in columns" :key="columna.key">
              <span class="data-table__skeleton" aria-hidden="true"></span>
            </td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr v-for="(fila, indice) in rows" :key="clave(fila, indice)">
            <td
              v-for="columna in columns"
              :key="columna.key"
              :style="{ textAlign: columna.align || 'left' }"
            >
              <slot
                :name="`cell-${columna.key}`"
                :row="fila"
                :value="valor(fila, columna)"
                :index="indice"
              >
                {{ valor(fila, columna) }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>

      <EstadoVacio
        v-if="!loading && !rows.length"
        :title="emptyTitle"
        :description="emptyDescription"
      >
        <template v-if="$slots['empty-action']" #action>
          <slot name="empty-action" />
        </template>
      </EstadoVacio>
    </template>
  </div>
</template>

<style scoped>
/* TablaDatos — DESIGN §3.2
   Encabezado 12/600 mayúsculas color texto-suave.
   Filas: borde suave, sin cebrado, hover en superficie.
   Contenedor: radio 16 px, borde suave, fondo blanco.
*/
.data-table {
  width: 100%;
  overflow-x: auto;
  border: var(--borde-suave);
  border-radius: var(--radio-md);
  background: var(--color-blanco);
}

table {
  width: 100%;
  border-collapse: collapse;
}

/* Encabezado: 12/600, mayúsculas, espaciado 0.08em, color texto suave */
th {
  padding: var(--space-3) var(--space-4);
  border-bottom: var(--borde-suave);
  font-family: var(--fuente-texto);
  font-size: var(--text-caption);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-texto-suave);
  text-align: left;
  background: var(--color-blanco);
}

td {
  padding: var(--space-3) var(--space-4);
  border-bottom: var(--borde-suave);
  font-size: var(--text-body);
  font-weight: var(--weight-regular);
  color: var(--color-marino);
}

tbody tr:last-child td {
  border-bottom: none;
}

/* Hover: superficie (sin cebrado) */
tbody tr:hover {
  background: var(--color-superficie);
}

/* Skeleton de carga */
.data-table__skeleton {
  display: block;
  width: 100%;
  min-width: 64px;
  height: 16px;
  border-radius: var(--radio-sm);
  background: var(--color-superficie);
  animation: shimmer 1.4s var(--ease-out) infinite;
}

@keyframes shimmer {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* Estado de error */
.data-table__error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4);
  border-radius: var(--radio-md);
  background: var(--color-superficie);
  border: var(--borde-fuerte);
  font-size: var(--text-caption);
  font-weight: var(--weight-regular);
  color: var(--color-marino);
}

@media (max-width: 768px) {
  th,
  td {
    padding-inline: var(--space-3);
  }
}
</style>

<script setup>
import EmptyState from './EmptyState.vue';

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

      <EmptyState
        v-if="!loading && !rows.length"
        :title="emptyTitle"
        :description="emptyDescription"
      >
        <template v-if="$slots['empty-action']" #action>
          <slot name="empty-action" />
        </template>
      </EmptyState>
    </template>
  </div>
</template>

<style scoped>
.data-table {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  padding: var(--space-2) var(--space-3);
  border-bottom: var(--border-soft);
  font-size: var(--text-label);
  font-weight: var(--weight-medium);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

td {
  padding: var(--space-3);
  border-bottom: var(--border-soft);
  font-size: var(--text-body);
  font-weight: var(--weight-light);
}

tbody tr:hover {
  background: color-mix(in srgb, var(--color-powder-blue) 40%, transparent);
}

.data-table__skeleton {
  display: block;
  width: 100%;
  min-width: 64px;
  height: 16px;
  border-radius: var(--radius-base);
  background: var(--color-powder-blue);
}

.data-table__error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-3);
  border: var(--border-ink);
  border-radius: var(--radius-base);
  font-size: var(--text-caption);
  font-weight: var(--weight-regular);
}

@media (max-width: 768px) {
  th,
  td {
    padding-inline: var(--space-2);
  }
}
</style>

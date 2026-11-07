<script setup>
import { useId } from 'vue';

defineProps({
  label: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
});

const titleId = useId();
</script>

<template>
  <section class="page-header" :aria-labelledby="titleId">
    <div class="page-header__inner">
      <div class="page-header__text">
        <!-- Etiqueta azul con línea de 28 px a la izquierda (DESIGN §2.4) -->
        <p v-if="label" class="page-header__label">
          <span class="page-header__line" aria-hidden="true"></span>
          {{ label }}
        </p>
        <!-- Título en serifa 36 px (con una palabra en <em> si se quiere azul en cursiva) -->
        <h1 :id="titleId" class="page-header__title">{{ title }}</h1>
        <p v-if="subtitle" class="page-header__subtitle">{{ subtitle }}</p>
      </div>

      <!-- Bloque de cifras a la derecha -->
      <div v-if="$slots.stats" class="page-header__stats">
        <slot name="stats" />
      </div>
    </div>
  </section>
</template>

<style scoped>
/* EncabezadoPagina — DESIGN §3.2
   Banda --color-superficie, etiqueta azul con línea,
   título serifa 36 px, subtítulo gris, cifras a la derecha.
*/
.page-header {
  border-bottom: var(--borde-suave);
  background: var(--color-superficie);
}

.page-header__inner {
  display: flex;
  width: min(100% - 32px, var(--page-max));
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-6);
  margin-inline: auto;
  padding-block: var(--space-8);
}

.page-header__text {
  min-width: 0;
}

/* Etiqueta: azul, 12/600, mayúsculas, espaciado 0.16em, línea 28 px */
.page-header__label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
  font-family: var(--fuente-texto);
  font-size: var(--text-caption);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  /* Texto azul sobre superficie: NO cumple 4.18:1 → usar color-marino aquí.
     La línea sí puede ser azul porque es decorativa (no texto). */
  color: var(--color-marino);
}

.page-header__line {
  width: 28px;
  height: 2px;
  background: var(--color-azul);
  flex-shrink: 0;
  border-radius: 1px;
}

/* Título: serifa 36 px. Usar <em> dentro del title si se quiere la palabra en cursiva azul. */
.page-header__title {
  font-family: var(--fuente-titulo);
  font-size: 36px;
  font-weight: var(--weight-regular);
  color: var(--color-marino);
  line-height: 1.1;
}

.page-header__title :deep(em) {
  font-style: italic;
  color: var(--color-azul);
}

.page-header__subtitle {
  margin-top: var(--space-2);
  color: var(--color-texto-suave);
  font-size: var(--text-body);
  line-height: 1.4;
}

/* Bloque de cifras */
.page-header__stats {
  display: flex;
  flex-shrink: 0;
  gap: var(--space-3);
}

@media (max-width: 768px) {
  .page-header__inner {
    width: min(100% - 24px, var(--page-max));
    align-items: stretch;
    flex-direction: column;
    padding-block: var(--space-6);
  }

  .page-header__title {
    font-size: 28px;
  }

  .page-header__stats {
    flex-wrap: wrap;
  }
}
</style>

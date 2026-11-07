<script setup>
import { computed, useId } from 'vue';

const props = defineProps({
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
  accent: {
    type: String,
    default: '',
  },
});

const titleId = useId();

const partes = computed(() => {
  if (!props.accent) {
    return { antes: props.title, acento: '', despues: '' };
  }

  const indice = props.title
    .toLocaleLowerCase('es')
    .indexOf(props.accent.toLocaleLowerCase('es'));

  if (indice < 0) {
    return { antes: props.title, acento: '', despues: '' };
  }

  return {
    antes: props.title.slice(0, indice),
    acento: props.title.slice(indice, indice + props.accent.length),
    despues: props.title.slice(indice + props.accent.length),
  };
});
</script>

<template>
  <section class="page-header" :aria-labelledby="titleId">
    <div class="page-header__inner">
      <div class="page-header__text">
        <p v-if="label" class="page-header__label">
          <span class="page-header__line" aria-hidden="true"></span>
          {{ label }}
        </p>
        <h1 :id="titleId" class="page-header__title">{{ partes.antes }}<em v-if="partes.acento" class="page-header__accent">{{ partes.acento }}</em>{{ partes.despues }}</h1>
        <p v-if="subtitle" class="page-header__subtitle">{{ subtitle }}</p>
      </div>

      <div v-if="$slots.stats" class="page-header__stats">
        <slot name="stats" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.page-header {
  border-bottom: var(--borde-suave);
  background: var(--color-superficie);
}

.page-header__inner {
  display: flex;
  width: min(100% - 32px, var(--page-max));
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-8);
  margin-inline: auto;
  padding-block: var(--space-8);
}

.page-header__text {
  min-width: 0;
}

.page-header__label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
  color: var(--color-marino);
  font-size: var(--text-caption);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.page-header__line {
  width: 28px;
  height: 1px;
  background: currentColor;
}

.page-header__title {
  font-size: var(--text-heading);
  line-height: 1.1;
}

.page-header__accent {
  color: var(--color-marino);
  font-family: var(--fuente-titulo);
  font-style: italic;
  font-weight: inherit;
}

.page-header__subtitle {
  margin-top: var(--space-2);
  color: var(--color-texto-suave);
  font-size: var(--text-body);
  line-height: 1.6;
}

.page-header__stats {
  display: flex;
  flex-shrink: 0;
  flex-wrap: wrap;
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
    font-size: var(--text-heading-sm);
  }
}
</style>

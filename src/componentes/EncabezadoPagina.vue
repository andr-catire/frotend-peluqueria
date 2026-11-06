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
        <p v-if="label" class="page-header__label">
          <span class="page-header__line" aria-hidden="true"></span>
          {{ label }}
        </p>
        <h1 :id="titleId" class="page-header__title">{{ title }}</h1>
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
  border-bottom: var(--border-soft);
  background: var(--color-powder-blue);
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

.page-header__label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
  font-size: var(--text-label);
  font-weight: var(--weight-medium);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.page-header__line {
  width: 24px;
  height: 1px;
  background: currentColor;
}

.page-header__title {
  font-size: var(--text-heading-lg);
  line-height: 1.08;
}

.page-header__subtitle {
  margin-top: var(--space-2);
  color: var(--color-mist-gray);
  font-size: var(--text-body);
  line-height: 1.3;
}

.page-header__stats {
  display: flex;
  flex-shrink: 0;
  gap: var(--space-2);
}

@media (max-width: 768px) {
  .page-header__inner {
    width: min(100% - 24px, var(--page-max));
    align-items: stretch;
    flex-direction: column;
    padding-block: var(--space-6);
  }

  .page-header__title {
    font-size: var(--text-heading);
  }

  .page-header__stats {
    flex-wrap: wrap;
  }
}
</style>

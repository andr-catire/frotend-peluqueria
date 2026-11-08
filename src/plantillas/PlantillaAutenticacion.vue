<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
  <div class="auth-layout">
    <header class="auth-header">
      <RouterLink class="brand" :to="{ name: 'inicio' }" aria-label="Volver al inicio">
        <span class="brand__mark" aria-hidden="true">P</span>
        <span class="brand__name">Peluquería</span>
      </RouterLink>
    </header>

    <main class="auth-main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.auth-layout {
  display: flex;
  height: 100vh;
  min-height: 100vh;
  flex-direction: column;
  padding: 0 var(--space-8);
  background: var(--color-fondo);
  overflow: hidden;
  box-sizing: border-box;
}

.auth-header {
  display: flex;
  min-height: 64px;
  align-items: center;
  border-bottom: var(--borde-suave);
  flex-shrink: 0;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  font-family: var(--fuente-titulo);
  font-size: 22px;
  font-weight: var(--weight-regular);
  color: var(--color-marino);
  text-decoration: none;
  transition: opacity var(--dur-fast) var(--ease-out);
}

.brand:hover {
  opacity: 0.85;
}

.brand__mark {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border: var(--borde-suave);
  border-radius: var(--radio-sm);
  background: var(--color-superficie);
  color: var(--color-marino);
  font-family: var(--fuente-titulo);
  font-size: 19px;
  font-weight: var(--weight-bold);
}

.brand__name {
  color: var(--color-marino);
}

.auth-main {
  display: flex;
  width: 100%;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-4) 0;
  min-height: 0;
}

@media (max-width: 900px) {
  .auth-layout {
    height: auto;
    min-height: 100vh;
    overflow-y: auto;
    padding: 0 var(--space-4);
  }

  .auth-main {
    padding: var(--space-6) 0;
  }
}
</style>

<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
  <div class="auth-layout">
    <header class="auth-header">
      <RouterLink class="brand" :to="{ name: 'inicio' }" aria-label="Volver al inicio">
        <span class="brand__mark" aria-hidden="true">P</span>
        <span>Peluquería</span>
      </RouterLink>
    </header>

    <main class="auth-main">
      <slot />
    </main>

    <footer class="auth-footer">
      <RouterLink :to="{ name: 'inicio' }">Volver al inicio</RouterLink>
    </footer>
  </div>
</template>

<style scoped>
.auth-layout {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  padding: var(--space-4);
  background: var(--color-fondo);
}

.auth-header {
  display: flex;
  min-height: var(--topbar-h);
  align-items: center;
  border-bottom: var(--borde-suave);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--fuente-titulo);
  font-size: 22px;
  font-weight: var(--weight-regular);
  text-decoration: none;
}

.brand__mark {
  display: grid;
  width: 32px;
  aspect-ratio: 1;
  place-items: center;
  border: var(--borde-suave);
  border-radius: var(--radio-pill);
  background: var(--color-superficie);
  color: var(--color-marino);
  font-family: var(--fuente-titulo);
  font-size: 20px;
}

.auth-main {
  display: flex;
  width: min(100%, 440px);
  flex: 1;
  flex-direction: column;
  justify-content: center;
  margin-inline: auto;
  padding-block: var(--space-8);
}

.auth-footer {
  padding-block: var(--space-4);
  color: var(--color-texto-suave);
  font-size: var(--text-caption);
  font-weight: var(--weight-regular);
  text-align: center;
}
</style>

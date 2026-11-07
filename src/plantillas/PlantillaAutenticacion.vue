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

    <footer class="auth-footer">
      <RouterLink :to="{ name: 'inicio' }">Volver al inicio</RouterLink>
    </footer>
  </div>
</template>

<style scoped>
/* PlantillaAutenticacion — DESIGN §3.1 */
.auth-layout {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  background: var(--color-fondo);
}

.auth-header {
  display: flex;
  min-height: var(--topbar-h);
  align-items: center;
  padding-inline: var(--space-6);
  border-bottom: var(--borde-suave);
  background: var(--color-blanco);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--fuente-titulo);
  font-size: 22px;
  font-weight: var(--weight-regular);
  color: var(--color-marino);
  text-decoration: none;
}

.brand__mark {
  display: grid;
  width: 32px;
  aspect-ratio: 1;
  place-items: center;
  border: var(--borde-fuerte);
  border-radius: var(--radio-sm);
  background: var(--color-superficie);
  font-size: var(--text-body-lg);
  color: var(--color-marino);
}

.brand__name {
  color: var(--color-marino);
}

.auth-main {
  display: flex;
  width: min(100%, 480px);
  flex: 1;
  flex-direction: column;
  justify-content: center;
  margin-inline: auto;
  padding: var(--space-8) var(--space-4);
}

.auth-footer {
  padding-block: var(--space-4);
  color: var(--color-texto-suave);
  font-size: var(--text-caption);
  font-weight: var(--weight-regular);
  text-align: center;
  border-top: var(--borde-suave);
}
</style>

<script setup>
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { obtenerEstado } from '../../servicios/servicioSalud.js';

const health = ref(null);
const loading = ref(true);
const error = ref('');

async function checkHealth() {
  loading.value = true;
  error.value = '';

  try {
    const data = await obtenerEstado();

    if (data?.status !== 'ok') {
      throw new Error('Respuesta inesperada');
    }

    health.value = data;
  } catch {
    health.value = null;
    error.value = 'No se pudo conectar con la API. Comprueba que el backend esté iniciado.';
  } finally {
    loading.value = false;
  }
}

onMounted(checkHealth);
</script>

<template>
  <main class="health-page">
    <header class="health-topbar">
      <RouterLink class="brand" :to="{ name: 'inicio' }" aria-label="Volver al inicio">
        <span class="brand__mark" aria-hidden="true">P</span>
        <span>Peluquería</span>
      </RouterLink>
      <span class="label">Diagnóstico</span>
    </header>

    <section class="container health-panel" aria-labelledby="health-title">
      <p class="section-label"><span class="section-label__line" aria-hidden="true"></span> Estado del sistema</p>
      <h1 id="health-title">Estado del <em class="acento">backend</em></h1>
      <p class="health-subtitle">Comprobación de la API de peluquería.</p>

      <div class="health-status" role="status" aria-live="polite">
        <span
          class="health-status__dot"
          :class="{
            'is-online': health && !loading,
            'is-error': error,
            'is-loading': loading,
          }"
          aria-hidden="true"
        ></span>
        {{ loading ? 'Comprobando' : error ? 'Sin conexión' : 'En línea' }}
      </div>

      <div class="health-result" aria-live="polite">
        <p v-if="loading" class="health-message">Consultando /api/health...</p>
        <p v-else-if="error" class="form-error" role="alert">{{ error }}</p>
        <div v-else class="health-response">
          <span class="health-response__key">Respuesta</span>
          <code>{ "status": "{{ health.status }}" }</code>
        </div>
      </div>

      <div class="health-actions">
        <span class="health-endpoint"><span class="label">GET</span> /api/health</span>
        <button class="btn btn--primary" type="button" :disabled="loading" @click="checkHealth">
          {{ loading ? 'Consultando...' : 'Comprobar de nuevo' }}
        </button>
      </div>
    </section>

    <footer class="container health-footer">
      <RouterLink :to="{ name: 'inicio' }">Volver al inicio</RouterLink>
      <span class="caption">Vue 3 / Spring Boot</span>
    </footer>
  </main>
</template>

<style scoped>
.health-page {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  background: var(--color-fondo);
}

.health-topbar {
  display: flex;
  width: min(100% - 32px, var(--page-max));
  min-height: var(--topbar-h);
  align-items: center;
  justify-content: space-between;
  margin-inline: auto;
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

.health-panel {
  flex: 1;
  padding-block: var(--space-16);
}

.section-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
  color: var(--color-azul);
  font-size: var(--text-caption);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.section-label__line {
  width: 28px;
  height: 1px;
  background: currentColor;
}

.health-panel h1 {
  font-size: var(--text-heading-lg);
  line-height: 1.1;
}

.health-subtitle {
  margin-top: var(--space-2);
  color: var(--color-texto-suave);
  font-size: var(--text-body-lg);
  line-height: 1.6;
}

.health-status {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-6);
  color: var(--color-marino);
  font-size: var(--text-body);
  font-weight: var(--weight-medium);
}

.health-status__dot {
  width: 8px;
  height: 8px;
  border: 1px solid var(--color-marino);
  border-radius: 50%;
}

.health-status__dot.is-online {
  background: var(--color-marino);
}

.health-status__dot.is-error {
  border-style: dashed;
}

.health-status__dot.is-loading {
  border-style: dotted;
}

.health-result {
  max-width: 640px;
  margin-top: var(--space-4);
}

.health-message {
  color: var(--color-texto-suave);
}

.health-response {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4);
  border: var(--borde-suave);
  border-radius: var(--radio-md);
  background: var(--color-blanco);
}

.health-response__key {
  color: var(--color-texto-suave);
  font-size: var(--text-caption);
  font-weight: var(--weight-regular);
}

code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: var(--text-caption);
}

.health-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  margin-top: var(--space-8);
}

.health-endpoint {
  color: var(--color-texto-suave);
  font-size: var(--text-caption);
  font-weight: var(--weight-regular);
}

.health-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding-block: var(--space-4);
  border-top: var(--borde-suave);
  color: var(--color-texto-suave);
  font-size: var(--text-caption);
  font-weight: var(--weight-regular);
}

@media (max-width: 768px) {
  .health-panel {
    padding-block: var(--space-8);
  }

  .health-actions {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>

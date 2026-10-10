<script setup>
import { onMounted, ref } from 'vue';
import api from '../../services/api.js';

const health = ref(null);
const loading = ref(true);
const error = ref('');

async function checkHealth() {
  loading.value = true;
  error.value = '';

  try {
    const response = await api.get('/health');
    health.value = response.data;
  } catch {
    health.value = null;
    error.value = 'No se pudo conectar con la API. Comprueba que el backend este iniciado.';
  } finally {
    loading.value = false;
  }
}

onMounted(checkHealth);
</script>

<template>
  <main class="page-shell">
    <header class="topbar">
      <a class="brand" href="/" aria-label="Inicio - Sistema de Peluqueria">
        <span class="brand-mark" aria-hidden="true">P</span>
        <span>Sistema de Peluqueria</span>
      </a>
      <span class="environment">DESARROLLO</span>
    </header>

    <section class="health-panel" aria-labelledby="page-title">
      <div class="section-label"><span class="label-line"></span> CONECTIVIDAD</div>
      <div class="heading-row">
        <div>
          <h1 id="page-title">Estado del backend</h1>
          <p class="subtitle">Comprobacion de la API de peluqueria</p>
        </div>
        <span
          class="status-badge"
          :class="{ 'is-online': health && !loading, 'is-error': error, 'is-loading': loading }"
          role="status"
          aria-live="polite"
        >
          <span class="status-dot"></span>
          {{ loading ? 'Comprobando' : error ? 'Sin conexion' : 'En linea' }}
        </span>
      </div>

      <div class="result-area" aria-live="polite">
        <div v-if="loading" class="result-message">Consultando /api/health...</div>
        <div v-else-if="error" class="result-message error-message">{{ error }}</div>
        <div v-else class="response-row">
          <span class="response-key">Respuesta</span>
          <code>{ "status": "{{ health.status }}" }</code>
        </div>
      </div>

      <div class="panel-footer">
        <span class="endpoint"><span class="endpoint-method">GET</span> localhost:3000/api/health</span>
        <button type="button" :disabled="loading" @click="checkHealth">
          {{ loading ? 'Consultando...' : 'Comprobar de nuevo' }}
        </button>
      </div>
    </section>

    <footer class="page-footer">
      <span>FRONTEND <i></i> API</span>
      <span>Vue 3 / Express</span>
    </footer>
  </main>
</template>

<style>
:root {
  font-family: 'Avenir Next', Avenir, 'Segoe UI', sans-serif;
  color: #202a27;
  background: #f2f4ef;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
}

* {
  box-sizing: border-box;
}

body {
  min-width: 320px;
  min-height: 100vh;
  margin: 0;
  background-image: linear-gradient(135deg, rgb(229 236 224 / 70%), transparent 42%),
    repeating-linear-gradient(0deg, transparent, transparent 39px, rgb(48 75 62 / 4%) 40px);
}

button,
a {
  font: inherit;
}

.page-shell {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  padding: 0 7.2vw;
}

.topbar {
  display: flex;
  min-height: 76px;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #d9dfd6;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 11px;
  color: inherit;
  font-size: 14px;
  font-weight: 650;
  text-decoration: none;
}

.brand-mark {
  display: grid;
  width: 29px;
  aspect-ratio: 1;
  place-items: center;
  background: #275c49;
  color: #f7f7f0;
  font-family: Georgia, serif;
  font-size: 18px;
}

.environment,
.section-label,
.page-footer,
.endpoint-method {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.environment {
  color: #65746b;
}

.health-panel {
  width: min(100%, 760px);
  margin: auto;
  padding: 44px 0 35px;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #52715f;
}

.label-line {
  width: 24px;
  height: 1px;
  background: #52715f;
}

.heading-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-top: 20px;
}

h1 {
  margin: 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(32px, 5vw, 48px);
  font-weight: 400;
}

.subtitle {
  margin: 10px 0 0;
  color: #68756d;
  font-size: 14px;
}

.status-badge {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 8px;
  padding: 8px 11px;
  border: 1px solid #d1d8d0;
  color: #647169;
  font-size: 12px;
}

.status-dot {
  width: 7px;
  aspect-ratio: 1;
  border-radius: 50%;
  background: #a8b0aa;
}

.is-online .status-dot {
  background: #36865d;
}

.is-error .status-dot {
  background: #c25245;
}

.is-loading .status-dot {
  background: #bc8a31;
}

.result-area {
  display: flex;
  min-height: 104px;
  align-items: center;
  margin-top: 31px;
  padding: 24px;
  border-left: 3px solid #43815f;
  background: #fff;
}

.result-message {
  color: #66736b;
  font-size: 14px;
}

.error-message {
  color: #a43d34;
}

.response-row {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.response-key {
  color: #65736a;
  font-size: 13px;
}

code {
  padding: 9px 12px;
  background: #eff4ed;
  color: #285b43;
  font-size: 14px;
}

.panel-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-top: 18px;
}

.endpoint {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #68756d;
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 12px;
}

.endpoint-method {
  color: #28704d;
}

button {
  min-height: 38px;
  padding: 0 14px;
  border: 1px solid #275c49;
  background: #275c49;
  color: white;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 150ms ease;
}

button:hover:not(:disabled) {
  background: #1f4939;
}

button:disabled {
  cursor: wait;
  opacity: 0.65;
}

.page-footer {
  display: flex;
  min-height: 55px;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #d9dfd6;
  color: #778179;
  font-weight: 500;
}

.page-footer i {
  display: inline-block;
  width: 4px;
  aspect-ratio: 1;
  margin: 0 5px 2px;
  border-radius: 50%;
  background: #43815f;
}

@media (max-width: 560px) {
  .page-shell {
    padding: 0 22px;
  }

  .topbar {
    min-height: 65px;
  }

  .brand {
    font-size: 12px;
  }

  .heading-row,
  .panel-footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .heading-row {
    gap: 17px;
  }

  .result-area {
    min-height: 92px;
    padding: 18px;
  }

  .response-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .panel-footer {
    gap: 14px;
  }
}
</style>
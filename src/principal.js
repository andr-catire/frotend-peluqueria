import { createApp } from 'vue';
import { createPinia } from 'pinia';
import '@fontsource-variable/inter';
import './recursos/estilos/tokens.css';
import './recursos/estilos/base.css';
import './iconos.js';
import AplicacionPeluqueria from './AplicacionPeluqueria.vue';
import router from './enrutador/index.js';

const app = createApp(AplicacionPeluqueria);

app.use(createPinia());
app.use(router);
app.mount('#app');

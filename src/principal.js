import { createApp } from 'vue';
import { createPinia } from 'pinia';
import '@fontsource/dm-serif-display/400.css';
import '@fontsource/dm-serif-display/400-italic.css';
import '@fontsource-variable/dm-sans';
import './recursos/tokens.css';
import './recursos/base.css';
import './iconos.js';
import AplicacionPeluqueria from './AplicacionPeluqueria.vue';
import router from './enrutador/index.js';

const app = createApp(AplicacionPeluqueria);

app.use(createPinia());
app.use(router);
app.mount('#app');

import { createApp } from 'vue';
import { createPinia } from 'pinia';
// Fuentes autoalojadas: DM Serif Display (titulares) + DM Sans (texto)
import '@fontsource/dm-serif-display/400.css';
import '@fontsource/dm-serif-display/400-italic.css';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/600.css';
import '@fontsource/dm-sans/700.css';
import './recursos/estilos/tokens.css';
import './recursos/estilos/base.css';
import './iconos.js';
import AplicacionPeluqueria from './AplicacionPeluqueria.vue';
import router from './enrutador/index.js';

const app = createApp(AplicacionPeluqueria);

app.use(createPinia());
app.use(router);
app.mount('#app');

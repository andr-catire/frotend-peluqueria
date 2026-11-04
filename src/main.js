import { createApp } from 'vue';
import { createPinia } from 'pinia';
import '@fontsource-variable/inter';
import './assets/styles/tokens.css';
import './assets/styles/base.css';
import './icons.js';
import App from './App.vue';
import router from './router/index.js';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.mount('#app');

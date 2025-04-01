import './assets/base.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router.ts'
import App from './App.vue'
import VueKonva from 'vue-konva'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueKonva)

app.mount('#app')

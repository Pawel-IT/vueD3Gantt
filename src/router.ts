import { createMemoryHistory, createRouter } from 'vue-router'

import Basic from './components/Basic.vue'
import Home from './components/Home.vue'
import ComplexResizable from '@/components/ComplexResizable.vue'
import DeepSeekGantt from '@/components/DeepSeekGantt.vue'
import Gantt from '@/components/Gantt.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/basic', component: Basic },
  { path: '/resizable', component: ComplexResizable },
  { path: '/deepseekgantt', component: DeepSeekGantt },
  { path: '/gantt', component: Gantt },
  // { path: '/basic', component: Basic },
  // { path: '/basic', component: Basic },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

export default router

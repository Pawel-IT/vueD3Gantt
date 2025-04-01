<script setup lang="ts">
import Basic from '@/components/Basic.vue'
import ComplexResizable from '@/components/ComplexResizable.vue'
import Gantt from '@/components/Gantt.vue'
import LoopedRefMount from '@/components/LoopedRefMount.vue'
import SimpleWithNode from '@/components/SimpleWithNode.vue'
import DataManipulation from '@/DataManipulation.vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
</script>

<template>
  <h1>Some D3 Examples</h1>
  <p><strong>Current route path:</strong>{{ route.path }}</p>
  <nav class="nav">
    <RouterLink to="/">Go to Home</RouterLink>
    <RouterLink to="/basic">Go to basic</RouterLink>
    <RouterLink to="/resizable">Go to resizable</RouterLink>
    <RouterLink to="/deepseekgantt">Go to deep seek gantt </RouterLink>
    <RouterLink to="/gantt">Go to canvas gantt </RouterLink>
  </nav>
  <main><RouterView /></main>

  <div v-if="false">
    <DataManipulation />
    <ComplexResizable />
    <SimpleWithNode />
    <LoopedRefMount />
  </div>
</template>

<style>
body {
  margin: 20px;
}
.nav {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}
.nav a {
  text-decoration: none;
  color: #42b983;
}
.nav a.router-link-active {
  font-weight: bold;
  color: #ff7f0e;
}
</style>

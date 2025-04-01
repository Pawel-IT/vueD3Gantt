<!-- App.vue -->
<template>
  <div class="app">
    <h1>Interactive Gantt Chart</h1>
    <GanttChart />
  </div>
</template>

<script setup>
import GanttChart from './GanttChartComponent.vue'
</script>

<style>
body {
  margin: 0;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.app {
  height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
}

.app h1 {
  margin-bottom: 20px;
}
</style>

<script setup lang="ts">
import * as d3 from 'd3'
import { onMounted, ref, watch } from 'vue'

const width = 600
const height = 400
const margin = { top: 20, right: 20, bottom: 30, left: 40 }
const chartData = ref([
  { id: 1, category: '1', value: 30 },
  { id: 2, category: '2', value: 50 },
  { id: 3, category: '3', value: 20 },
])

// Create the SVG container.
const svg = d3
  .create('svg')
  .attr('width', width)
  .attr('height', height)
  .attr('viewBox', [0, 0, width, height])
  .attr('style', 'max-width: 100%; height: auto;')

// Append a path for the area (under the axes).
svg
  .append('g')
  .selectAll('rect')
  .data(chartData.value, (d) => d.id)
  .join('rect')
  .attr('fill', 'steelblue')
  .attr('y', (d, i) => 12 * i)
  .attr('width', (d) => d.value * 11)
  .attr('height', (d) => 10)

const output = ref()

onMounted(() => {
  output.value.appendChild(svg.node())
})

function updateData() {
  //This wont obviously work, d3 isn't reactive here.
  chartData.value[2] = Math.random() * 50
}
</script>

<template>
  <svg ref="output"></svg>
  <button @click="updateData" style="background-color: darkred; color: white">
    Update Chart (wont work)
  </button>
</template>

<style scoped></style>

<script setup lang="ts">
import * as d3 from 'd3'
import { onMounted, ref, watch } from 'vue'
import { color, type Path, range, svg } from 'd3'

const data = ref([
  { x: 1, y: 2 },
  { x: 2, y: 22 },
  { x: 3, y: 7 },
])

onMounted(() => {
  d3.select('#container')
    .append('g')
    .selectAll('rect')
    .data(data.value)
    .join('rect')
    .attr('x', (d, i) => d.x * 12 * i)
    .attr('width', (d) => d.x * 11)
    .attr('height', (d) => d.y * 10)
    // .attr('fill', 'orange')
    .attr('stroke', 'black')
    .attr('stroke-width', 0)
})
</script>

<template>
  <svg id="container" class="relative"></svg>
</template>

<style scoped></style>

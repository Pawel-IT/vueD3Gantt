<template>
  <div>
    <svg ref="svgRef" :width="width" :height="height"></svg>
    <button @click="updateData">Update Chart</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as d3 from 'd3'

const width = 600
const height = 400
const svgRef = ref(null)
const chartData = ref([10, 40, 30, 20, 50])

function renderChart() {
  // Clear existing SVG children
  while (svgRef.value.firstChild) {
    svgRef.value.removeChild(svgRef.value.firstChild)
  }

  // Create a new detached SVG with D3
  const d3Svg = d3.create('svg').attr('width', width).attr('height', height)

  // Create scales
  const xScale = d3
    .scaleBand()
    .domain(d3.range(chartData.value.length))
    .range([0, width])
    .padding(0.1)

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(chartData.value)])
    .range([height, 0])

  // Add bars
  d3Svg
    .selectAll('rect')
    .data(chartData.value)
    .enter()
    .append('rect')
    .attr('x', (d, i) => xScale(i))
    .attr('y', (d) => yScale(d))
    .attr('width', xScale.bandwidth())
    .attr('height', (d) => height - yScale(d))
    .attr('fill', 'steelblue')

  // Mount the D3 SVG node to our template ref
  svgRef.value.appendChild(d3Svg.node())
}

function updateData() {
  chartData.value = chartData.value.map(() => Math.random() * 50)
  renderChart()
}

onMounted(() => {
  renderChart()
})
</script>

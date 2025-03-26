<script setup>
import { ref, watch, onMounted } from 'vue'
import * as d3 from 'd3'

// Configuration
const width = 600
const height = 400
const margin = { top: 20, right: 20, bottom: 30, left: 40 }
const svg = ref(null)

// Tooltip state
const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  content: '',
})

// Reactive data
const chartData = ref([
  { id: 1, category: '1', value: 30 },
  { id: 2, category: '2', value: 50 },
  { id: 3, category: '3', value: 20 },
])

// Scales
const xScale = ref(null)
const yScale = ref(null)

// Initialize chart
const initChart = () => {
  xScale.value = d3
    .scaleBand()
    .domain(chartData.value.map((d) => d.category))
    .range([margin.left, width - margin.right])
    .padding(0.1)

  yScale.value = d3
    .scaleLinear()
    .domain([0, 100]) // Fixed domain for resizing
    .range([height - margin.bottom, margin.top])
}

// Drag behavior factory function
const getDragBehavior = () => {
  return d3
    .drag()
    .on('start', function (event) {
      d3.select(this).raise().classed('active', true)
    })
    .on('drag', function (event, d) {
      const newY = Math.max(margin.top, Math.min(height - margin.bottom, event.y))
      const newValue = yScale.value.invert(newY)
      d.value = Math.max(0, Math.min(100, newValue))
      chartData.value = [...chartData.value]

      if (tooltip.value.visible) {
        tooltip.value.content = `${d.category}: ${d.value.toFixed(1)}`
      }
    })
    .on('end', function () {
      d3.select(this).classed('active', false)
    })
}

// Mouse event handlers
const handleMouseOver = (event, d) => {
  tooltip.value = {
    visible: true,
    x: event.pageX + 10,
    y: event.pageY - 10,
    content: `${d.category}: ${d.value}`,
  }
}

const handleMouseOut = () => {
  tooltip.value.visible = false
}

// Update chart with proper drag behavior binding
const updateChart = () => {
  // Update scales
  xScale.value.domain(chartData.value.map((d) => d.category))

  // Select SVG
  const svgEl = d3.select(svg.value)

  // Data join for bar groups
  const barGroups = svgEl.selectAll('.bar-group').data(chartData.value, (d) => d.id)

  // Exit first
  barGroups.exit().remove()

  // Enter new bar groups
  const barGroupsEnter = barGroups.enter().append('g').attr('class', 'bar-group')

  // Add rect to new groups
  barGroupsEnter
    .append('rect')
    .attr('class', 'bar')
    .attr('x', (d) => xScale.value(d.category))
    .attr('y', height - margin.bottom)
    .attr('width', xScale.value.bandwidth())
    .attr('height', 0)
    .attr('fill', 'steelblue')
    .on('mouseover', handleMouseOver)
    .on('mouseout', handleMouseOut)

  // Add drag handles to new groups
  barGroupsEnter
    .append('rect')
    .attr('class', 'drag-handle')
    .attr('x', (d) => xScale.value(d.category))
    .attr('width', xScale.value.bandwidth())
    .attr('height', 5)
    .call(getDragBehavior())

  // Merge and update all groups
  const mergedGroups = barGroupsEnter.merge(barGroups)

  // Update bars
  mergedGroups
    .select('.bar')
    .transition()
    .duration(100)
    .attr('x', (d) => xScale.value(d.category))
    .attr('y', (d) => yScale.value(d.value))
    .attr('width', xScale.value.bandwidth())
    .attr('height', (d) => height - margin.bottom - yScale.value(d.value))

  // Update drag handles (must reapply drag behavior)
  mergedGroups
    .select('.drag-handle')
    .attr('x', (d) => xScale.value(d.category))
    .attr('y', (d) => yScale.value(d.value) - 5)
    .attr('width', xScale.value.bandwidth())
    .call(getDragBehavior()) // Reapply drag behavior

  // Update labels
  const labels = svgEl.selectAll('.label').data(chartData.value, (d) => d.id)

  labels
    .enter()
    .append('text')
    .attr('class', 'label')
    .attr('x', (d) => xScale.value(d.category) + xScale.value.bandwidth() / 2)
    .attr('y', height - margin.bottom + 20)
    .attr('text-anchor', 'middle')
    .text((d) => d.category)
    .merge(labels)
    .attr('x', (d) => xScale.value(d.category) + xScale.value.bandwidth() / 2)

  labels.exit().remove()
}

// Randomize data
const randomizeData = () => {
  chartData.value = chartData.value.map((d) => ({
    ...d,
    value: Math.floor(Math.random() * 100),
  }))
}

// Add new data
const addData = () => {
  const newId = Math.max(0, ...chartData.value.map((d) => d.id)) + 1
  const newCategory = newId
  chartData.value = [
    ...chartData.value,
    { id: newId, category: newCategory, value: Math.floor(Math.random() * 100) },
  ]
}

// Lifecycle hooks
onMounted(() => {
  initChart()
  updateChart()
})

watch(
  chartData,
  () => {
    updateChart()
  },
  { deep: true },
)
</script>
<template>
  <div>
    <button @click="randomizeData">Randomize Data</button>
    <button @click="addData">Add New Bar</button>
    <svg ref="svg" :width="width" :height="height"></svg>

    <div
      v-if="tooltip.visible"
      class="tooltip"
      :style="{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }"
    >
      {{ tooltip.content }}
    </div>
  </div>
</template>
<style>
svg {
  background-color: #f8f8f8;
  margin-bottom: 1rem;
  display: block;
}

.bar {
  transition: all 0.1s ease;
}

.bar-group:hover .bar {
  fill: #ff7f0e;
}

.drag-handle {
  cursor: ns-resize;
  fill: rgba(0, 0, 0, 0.1);
}
.drag-handle:hover {
  fill: rgba(244, 0, 0, 0.2);
}

.active .bar {
  fill: #ff4500;
}

.label {
  font-size: 12px;
  fill: #333;
  text-anchor: middle;
}

button {
  padding: 0.5rem 1rem;
  background: steelblue;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 0.5rem;
}

button:hover {
  background: #4682b4;
}

.tooltip {
  position: fixed;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 4px;
  pointer-events: none;
  font-size: 14px;
  z-index: 100;
}
</style>

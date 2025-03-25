<template>
  <div>
    <svg ref="svg" :width="width" :height="height"></svg>
    <button @click="randomizeData">Randomize Data</button>
    <div
      v-if="tooltip.visible"
      class="tooltip"
      :style="{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }"
    >
      {{ tooltip.content }}
    </div>
    <pre>
      {{ chartData }}
    </pre>
  </div>
</template>

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
  { id: 1, category: 'A', value: 30 },
  { id: 2, category: 'B', value: 50 },
  { id: 3, category: 'C', value: 20 },
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

// Drag behavior for resizing
const createDragBehavior = () => {
  return d3
    .drag()
    .on('start', function (event) {
      d3.select(this).raise().classed('active', true)
    })
    .on('drag', function (event, d) {
      // Calculate new value based on Y position
      const newY = Math.max(margin.top, Math.min(height - margin.bottom, event.y))
      const newValue = yScale.value.invert(newY)

      // Update data
      d.value = Math.max(0, Math.min(100, newValue))
      chartData.value = [...chartData.value] // Trigger reactivity

      // Update tooltip if visible
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
  d3.select(event.target).attr('fill', 'orange')
  console.log(event, d)
}

const handleMouseOut = (event) => {
  tooltip.value.visible = false
  console.log('out')
  d3.select(event.target).attr('fill', 'steelblue')
}

// Update chart with transitions
const updateChart = () => {
  // Update scales (domain remains fixed for resizing)
  xScale.value.domain(chartData.value.map((d) => d.category))

  // Select SVG
  const svgEl = d3.select(svg.value)

  // Data join for bars
  const bars = svgEl.selectAll('.bar').data(chartData.value, (d) => d.id)

  // Enter + Update bars
  const barsEnter = bars.enter().append('g').attr('class', 'bar-group')

  barsEnter
    .append('rect')
    .attr('class', 'bar')
    .attr('x', (d) => xScale.value(d.category))
    .attr('y', height - margin.bottom)
    .attr('width', xScale.value.bandwidth())
    .attr('height', 0)
    .attr('fill', 'steelblue')
    .on('mouseover', handleMouseOver)
    .on('mouseout', handleMouseOut)

  // Add drag handles (invisible top area for resizing)
  barsEnter
    .append('rect')
    .attr('class', 'drag-handle')
    .attr('x', (d) => xScale.value(d.category))
    .attr('width', xScale.value.bandwidth())
    .attr('height', 10)
    .attr('fill', 'transparent')
    .attr('cursor', 'ns-resize')
    .call(createDragBehavior())

  // Update all bar components
  svgEl
    .selectAll('.bar')
    .transition()
    .duration(100)
    .attr('x', (d) => xScale.value(d.category))
    .attr('y', (d) => yScale.value(d.value))
    .attr('width', xScale.value.bandwidth())
    .attr('height', (d) => height - margin.bottom - yScale.value(d.value))

  svgEl
    .selectAll('.drag-handle')
    .attr('x', (d) => xScale.value(d.category))
    .attr('y', (d) => yScale.value(d.value) - 5) // Position above the bar
    .attr('width', xScale.value.bandwidth())

  // Exit
  bars.exit().remove()

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

  labels.exit().remove()
}

// Randomize data for demo
const randomizeData = () => {
  chartData.value = [
    { id: 1, category: 'A', value: Math.floor(Math.random() * 100) },
    { id: 2, category: 'B', value: Math.floor(Math.random() * 100) },
    { id: 3, category: 'C', value: Math.floor(Math.random() * 100) },
    ...(Math.random() > 0.5
      ? [{ id: 4, category: 'D', value: Math.floor(Math.random() * 100) }]
      : []),
  ]
}

// Lifecycle hooks
onMounted(() => {
  initChart()
  updateChart()
})

// Watch for data changes
watch(
  chartData,
  () => {
    updateChart()
  },
  { deep: true },
)
</script>

<style scoped>
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

.drag-handle:hover {
  fill: rgba(0, 0, 0, 0.1) !important;
}

.active .bar {
  fill: #ff4500 !important;
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

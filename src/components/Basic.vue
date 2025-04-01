<script setup lang="ts">
import { selection } from 'd3'
import * as d3 from 'd3'
import { onMounted, ref, watch, onUnmounted } from 'vue'

interface ChartData {
  value: number
  label: string
}

const svgRef = ref<SVGSVGElement | null>(null)

type D3Selection = d3.Selection<SVGGElement, unknown, null, undefined>
const chart = ref<D3Selection | null>(null)

const data = ref<ChartData[]>([
  { value: 10, label: '0' },
  { value: 20, label: '1' },
  { value: 12, label: '2' },
])

const width = 600
const height = 400
const xScale = d3.scaleLinear().domain([0, data.value.length]).range([0, width])

function initChart() {
  if (!svgRef.value) return

  const svg = d3.select(svgRef.value)
  // svg.selectAll('*').remove()

  chart.value = svg.append('g')
  // .attr('transform', `translate(${width / 2}, ${height / 2})`)

  updateChart()
  add_x_axis(chart.value)
}

function updateChart() {
  if (!chart.value) return

  const selection = chart.value
    .selectAll<SVGRectElement, ChartData>('rect')
    .data(data.value, (d) => d.label)

  selection
    .enter()
    .append('rect')
    .attr('x', 0)
    .attr('fill', 'steelblue')
    .merge(selection)
    .transition()
    .duration(500)
    .attr('width', 10)
    .attr('height', (d) => d.value * 10)
    // .attr('x', (d, i) => i * 12)
    // .attr('y', (d) => d.value * 10)
    .attr('y', 0)
    .attr('transform', (d, i) => `translate(${xScale(i)}, 0)`)
  selection.exit().transition().duration(500).attr('x', 0).remove()
}
// const resizeObserver = new ResizeObserver(() => {
//   if (svgRef.value) {
//     const { width, height } = svgRef.value.getBoundingClientRect()
//     svgRef.value.setAttribute('width', `${width}`)
//     svgRef.value.setAttribute('height', `${height}`)
//   }
// })

const add_x_axis = (selection: D3Selection) => {
  // if (!selection.select('.x-axis').empty()) {
  //   console.log('No selection')
  // }
  selection.select('.x-axis').remove()
  selection
    .append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${height - 30})`)
    .transition()
    .duration(500)
    .call(d3.axisBottom(xScale))
}
const add_data = () => {
  data.value.push({ value: Math.random() * 10, label: data.value.length + 1 })
  xScale.domain([0, data.value.length])
  add_x_axis(chart.value)
}

onMounted(initChart)
watch(() => data, updateChart, { deep: true })
</script>

<template>
  <h1>Basic D3 Example</h1>
  <div class="chart-container">
    <svg ref="svgRef" :width="width" :height="height"></svg>
  </div>
  <input type="range" min="0" max="40" v-model="data[0].value" />
  <button @click="add_data">Add Data</button>
</template>
